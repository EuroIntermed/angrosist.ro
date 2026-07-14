/**
 * Produse catalog — data model, parser and helpers.
 *
 * The catalog is driven by a published Google Sheet / Excel file exported as CSV
 * (File → Share → Publish to web → CSV) or a JSON endpoint, fetched at RUNTIME on
 * the client from `PUBLIC_PRODUCTS_URL` (see src/lib/config.ts). This module is
 * intentionally pure/isomorphic so it can run at BUILD time (JSON-LD + SEO chips
 * from the sample) and be bundled into the CLIENT runtime (src/scripts/catalog.ts).
 *
 * SHEET SCHEMA — one product per row, header row required. Column names are
 * matched case- and diacritic-insensitively, so `Categorie`, `categorie`,
 * `CATEGORIE` all work:
 *
 *   categorie   (string)   grouping bucket, e.g. "Condimente, ierburi & mixuri"
 *   produs      (string)   product name, e.g. "Boia dulce"
 *   descriere   (string)   short description
 *   unitate     (string)   sales unit, e.g. "kg", "sac 25 kg", "bax"
 *   pret        (string)   OPTIONAL indicative price, e.g. "12 RON" — free text
 *   imagine     (string)   image URL (a Google Drive share link is auto-converted)
 *   activ       (bool-ish) "true"/"da"/"1"/"yes"/"x" → shown; anything else → hidden
 *   ordine      (number)   sort order within its category (ascending)
 *
 * A JSON source is an array of objects using the SAME keys.
 */

export interface Product {
  categorie: string
  produs: string
  descriere: string
  unitate: string
  pret: string
  imagine: string
  activ: boolean
  ordine: number
}

export interface CategoryGroup {
  categorie: string
  items: Product[]
}

/** Canonical column keys and the accepted header aliases (normalised). */
const COLUMN_ALIASES: Record<keyof Product, string[]> = {
  categorie: ['categorie', 'category', 'categorii'],
  produs: ['produs', 'product', 'nume', 'name', 'denumire'],
  descriere: ['descriere', 'description', 'desc', 'detalii'],
  unitate: ['unitate', 'unit', 'um', 'unitatemasura'],
  pret: ['pret', 'price', 'pretorientativ', 'pretlei', 'pretron'],
  imagine: ['imagine', 'image', 'img', 'poza', 'foto', 'photo'],
  activ: ['activ', 'active', 'vizibil', 'visible', 'publicat', 'published'],
  ordine: ['ordine', 'order', 'sort', 'ordonare', 'pozitie', 'position'],
}

/** Strip diacritics + lowercase + drop non-alphanumerics for tolerant matching. */
function normKey(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

const TRUE_VALUES = new Set(['true', 'da', '1', 'yes', 'y', 'x', 'activ', 'active'])

function toBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  if (v == null) return false
  return TRUE_VALUES.has(String(v).trim().toLowerCase())
}

function toNum(v: unknown): number {
  const n = parseFloat(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

/**
 * Convert a Google Drive share link into a directly-embeddable image URL. Any
 * non-Drive URL (or empty) is returned unchanged.
 */
export function driveImage(url: string): string {
  const raw = (url || '').trim()
  if (!raw) return ''
  if (!/drive\.google\.com/i.test(raw)) return raw
  const m =
    raw.match(/\/file\/d\/([-\w]+)/) ||
    raw.match(/[?&]id=([-\w]+)/) ||
    raw.match(/\/d\/([-\w]+)/)
  const id = m?.[1]
  if (!id) return raw
  return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`
}

/** Minimal RFC-4180-ish CSV parser (handles quotes, escaped quotes, CRLF). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  const s = text.replace(/^﻿/, '') // strip BOM
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++
      row.push(field)
      field = ''
      // Skip fully empty lines.
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else {
      field += ch
    }
  }
  if (field !== '' || row.length) {
    row.push(field)
    if (row.length > 1 || row[0] !== '') rows.push(row)
  }
  return rows
}

/** Build a header index: canonical key → column position. */
function mapHeader(header: string[]): Partial<Record<keyof Product, number>> {
  const idx: Partial<Record<keyof Product, number>> = {}
  header.forEach((h, i) => {
    const nh = normKey(h)
    for (const key of Object.keys(COLUMN_ALIASES) as (keyof Product)[]) {
      if (idx[key] == null && COLUMN_ALIASES[key].includes(nh)) idx[key] = i
    }
  })
  return idx
}

function rowToProduct(get: (k: keyof Product) => string): Product {
  return {
    categorie: get('categorie').trim(),
    produs: get('produs').trim(),
    descriere: get('descriere').trim(),
    unitate: get('unitate').trim(),
    pret: get('pret').trim(),
    imagine: driveImage(get('imagine')),
    activ: toBool(get('activ')),
    ordine: toNum(get('ordine')),
  }
}

/**
 * Parse a raw sheet payload (CSV or JSON) into products. Rows missing both a
 * category and a product name are dropped. Does NOT filter by `activ` — the caller
 * decides (so build-time SEO can inspect everything if needed).
 */
export function parseProducts(raw: string): Product[] {
  const text = (raw || '').trim()
  if (!text) return []

  // Try JSON first (array of objects, or { products: [...] }).
  if (text[0] === '[' || text[0] === '{') {
    try {
      const data = JSON.parse(text)
      const arr: unknown[] = Array.isArray(data)
        ? data
        : Array.isArray((data as { products?: unknown[] }).products)
          ? (data as { products: unknown[] }).products
          : []
      return arr
        .map((r) => {
          const obj = r as Record<string, unknown>
          // Build a diacritic-insensitive lookup for this row's keys.
          const byNorm: Record<string, unknown> = {}
          for (const k of Object.keys(obj)) byNorm[normKey(k)] = obj[k]
          const get = (key: keyof Product): string => {
            for (const alias of COLUMN_ALIASES[key]) {
              if (byNorm[alias] != null) return String(byNorm[alias])
            }
            return ''
          }
          return rowToProduct(get)
        })
        .filter((p) => p.categorie || p.produs)
    } catch {
      // Fall through to CSV.
    }
  }

  const rows = parseCsv(text)
  if (rows.length < 2) return []
  const idx = mapHeader(rows[0])
  return rows
    .slice(1)
    .map((cols) => {
      const get = (key: keyof Product): string => {
        const i = idx[key]
        return i != null ? (cols[i] ?? '') : ''
      }
      return rowToProduct(get)
    })
    .filter((p) => p.categorie || p.produs)
}

/** Keep only active rows. */
export function activeOnly(products: Product[]): Product[] {
  return products.filter((p) => p.activ && p.produs)
}

/**
 * Group active products by category. Categories are ordered by the smallest
 * `ordine` they contain (then alphabetically); items within a category are sorted
 * by `ordine` then name.
 */
export function groupByCategory(products: Product[]): CategoryGroup[] {
  const map = new Map<string, Product[]>()
  for (const p of activeOnly(products)) {
    const key = p.categorie || '—'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  const groups: CategoryGroup[] = []
  for (const [categorie, items] of map) {
    items.sort((a, b) => a.ordine - b.ordine || a.produs.localeCompare(b.produs))
    groups.push({ categorie, items })
  }
  groups.sort((a, b) => {
    const minA = Math.min(...a.items.map((i) => i.ordine))
    const minB = Math.min(...b.items.map((i) => i.ordine))
    return minA - minB || a.categorie.localeCompare(b.categorie)
  })
  return groups
}

/**
 * Bundled SAMPLE fallback — shown until the owner sets PUBLIC_PRODUCTS_URL (or if
 * the fetch fails). Category names mirror the site's taxonomy. Images are left
 * empty on purpose so the sample renders with the themed placeholder and makes no
 * external request; real rows use a Drive link in the `imagine` column.
 */
export const sampleProducts: Product[] = [
  { categorie: 'Materii prime & auxiliare', produs: 'Zahăr alb cristal', descriere: 'Zahăr alb rafinat pentru industrie și HoReCa.', unitate: 'sac 50 kg', pret: '', imagine: '', activ: true, ordine: 10 },
  { categorie: 'Materii prime & auxiliare', produs: 'Sare fină iodată', descriere: 'Sare alimentară fină, ambalare vrac sau la sac.', unitate: 'sac 25 kg', pret: '', imagine: '', activ: true, ordine: 20 },
  { categorie: 'Condimente, ierburi & mixuri', produs: 'Boia dulce de ardei', descriere: 'Boia dulce măcinată, calitate B2B pentru procesare.', unitate: 'kg', pret: '', imagine: '', activ: true, ordine: 30 },
  { categorie: 'Condimente, ierburi & mixuri', produs: 'Piper negru boabe', descriere: 'Piper negru boabe, sac de 5–25 kg.', unitate: 'kg', pret: '', imagine: '', activ: true, ordine: 40 },
  { categorie: 'Cereale, semințe & pseudocereale', produs: 'Semințe de chia', descriere: 'Semințe de chia pentru ambalare și food processing.', unitate: 'sac 25 kg', pret: '', imagine: '', activ: true, ordine: 50 },
  { categorie: 'Cereale, semințe & pseudocereale', produs: 'Quinoa albă', descriere: 'Quinoa albă, lot standard, disponibilitate recurentă.', unitate: 'sac 25 kg', pret: '', imagine: '', activ: true, ordine: 60 },
  { categorie: 'Nuci, oleaginoase & fructe uscate', produs: 'Miez de nucă', descriere: 'Miez de nucă, jumătăți și sferturi, calibru la cerere.', unitate: 'kg', pret: '', imagine: '', activ: true, ordine: 70 },
  { categorie: 'Nuci, oleaginoase & fructe uscate', produs: 'Stafide aurii', descriere: 'Stafide aurii, ambalare vrac pentru brutării și cofetării.', unitate: 'cutie 10 kg', pret: '', imagine: '', activ: true, ordine: 80 },
  { categorie: 'Făinuri, pudre & produse speciale', produs: 'Făină de migdale', descriere: 'Făină fină de migdale, produs special pentru producție.', unitate: 'kg', pret: '', imagine: '', activ: true, ordine: 90 },
  { categorie: 'FMCG & produse standard B2B', produs: 'Ulei de floarea-soarelui 1L', descriere: 'Ulei rafinat, bax standard pentru distribuție și retail.', unitate: 'bax 12 x 1L', pret: '', imagine: '', activ: true, ordine: 100 },
]

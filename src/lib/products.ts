/**
 * Produse catalog — data model, parser and helpers (3-LEVEL taxonomy).
 *
 * The catalog is bundled at build time from `src/data/catalog.json` (the source of
 * truth; see src/lib/catalog-data.ts). It MAY also be refreshed from a published
 * Google Sheet / Excel exported as CSV or JSON — but only when that sheet exposes
 * the NEW 3-level schema. This module is intentionally pure/isomorphic so it runs
 * at BUILD time (JSON-LD + SEO from the bundle) and is bundled into the CLIENT
 * runtime (src/scripts/catalog.ts) for the live refresh.
 *
 * NEW SHEET SCHEMA — one product per row, header row required. Column names are
 * matched case- and diacritic-insensitively:
 *
 *   sku            (string)  internal stock-keeping code (NEVER surfaced on the site)
 *   produs         (string)  product name, e.g. "Boia dulce"
 *   l1_slug        (string)  top category slug, e.g. "condimente-ierburi-arome-vrac"
 *   subcat_slug    (string)  LEAF slug (a real L2, or == l1_slug for L1-direct items)
 *   subcategorie   (string)  leaf display name, e.g. "Condimente simple vrac"
 *   descriere      (string)  prose description
 *   unitate        (string)  sales unit, e.g. "kg", "buc", "litru"
 *   pret           (string)  indicative price / "cere oferta" — free text
 *
 * A JSON source is an array of objects using the SAME keys. The `l1_slug` +
 * `subcat_slug` columns are what make a payload "new-schema": a parse that cannot
 * find BOTH returns an empty list, so the loader falls back to the bundle (the
 * legacy 2-level sheet is rejected on purpose).
 */

export interface Product {
  sku: string
  produs: string
  /** Top (L1) category slug. */
  l1Slug: string
  /** Leaf slug — a real L2 slug, or == l1Slug for products that hang off the L1. */
  subcatSlug: string
  /** Leaf display name (Romanian) — used as the "category" in the order message. */
  subcategorie: string
  descriere: string
  unitate: string
  pret: string
}

/** Canonical column keys and the accepted header aliases (normalised). */
const COLUMN_ALIASES: Record<keyof Product, string[]> = {
  sku: ['sku', 'cod', 'codprodus', 'code'],
  produs: ['produs', 'product', 'nume', 'name', 'denumire'],
  l1Slug: ['l1slug', 'l1', 'categorieslug', 'l1cat', 'topslug'],
  subcatSlug: ['subcatslug', 'subcategorieslug', 'leafslug', 'subslug'],
  subcategorie: ['subcategorie', 'subcategory', 'leaf', 'categorie', 'category'],
  descriere: ['descriere', 'description', 'desc', 'detalii'],
  unitate: ['unitate', 'unit', 'um', 'unitatemasura'],
  pret: ['pret', 'price', 'pretorientativ', 'pretlei', 'pretron'],
}

/** Strip diacritics + lowercase + drop non-alphanumerics for tolerant matching. */
export function normKey(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
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
export function parseCsv(text: string): string[][] {
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
    sku: get('sku').trim(),
    produs: get('produs').trim(),
    l1Slug: get('l1Slug').trim(),
    subcatSlug: get('subcatSlug').trim(),
    subcategorie: get('subcategorie').trim(),
    descriere: get('descriere').trim(),
    unitate: get('unitate').trim(),
    pret: get('pret').trim(),
  }
}

/**
 * Parse a raw sheet payload (CSV or JSON) into new-schema products. A payload
 * that does NOT expose BOTH `l1_slug` and `subcat_slug` is treated as legacy /
 * invalid and yields an EMPTY list, so the caller falls back to the bundle. Rows
 * missing both a leaf slug and a product name are dropped.
 */
export function parseProducts(raw: string): Product[] {
  const text = (raw || '').trim()
  if (!text) return []

  // JSON source (array of objects, or { products: [...] }).
  if (text[0] === '[' || text[0] === '{') {
    try {
      const data = JSON.parse(text)
      const arr: unknown[] = Array.isArray(data)
        ? data
        : Array.isArray((data as { products?: unknown[] }).products)
          ? (data as { products: unknown[] }).products
          : []
      if (!arr.length) return []
      // Validate schema on the first row's keys (must carry l1 + subcat slugs).
      const firstKeys = Object.keys(arr[0] as Record<string, unknown>).map(normKey)
      const hasL1 = COLUMN_ALIASES.l1Slug.some((a) => firstKeys.includes(a))
      const hasSub = COLUMN_ALIASES.subcatSlug.some((a) => firstKeys.includes(a))
      if (!hasL1 || !hasSub) return []
      return arr
        .map((r) => {
          const obj = r as Record<string, unknown>
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
        .filter((p) => p.subcatSlug && p.produs)
    } catch {
      // Fall through to CSV.
    }
  }

  const rows = parseCsv(text)
  if (rows.length < 2) return []
  const idx = mapHeader(rows[0])
  // Reject legacy sheets that lack the 3-level slug columns.
  if (idx.l1Slug == null || idx.subcatSlug == null) return []
  return rows
    .slice(1)
    .map((cols) => {
      const get = (key: keyof Product): string => {
        const i = idx[key]
        return i != null ? (cols[i] ?? '') : ''
      }
      return rowToProduct(get)
    })
    .filter((p) => p.subcatSlug && p.produs)
}

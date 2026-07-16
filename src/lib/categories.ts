/**
 * Category taxonomy — data model, parser and helpers (3-LEVEL).
 *
 * Categories drive the /produse overview (13 top-level "L1" tiles), the L1 pages
 * (their real "L2" subcategory tiles) and the L2 leaf pages. The primary source is
 * the bundled `src/data/catalog.json` (see src/lib/catalog-data.ts); a published
 * Google Sheet (CSV/JSON) may override it, but only when it exposes the NEW schema.
 * This module is pure/isomorphic so it can run at build time and in tests.
 *
 * NEW SHEET SCHEMA — one category per row, header row required. Columns are matched
 * case- and diacritic-insensitively:
 *
 *   level          "L1" | "L2"  — presence of this column is what marks the payload
 *                                 as new-schema (a legacy sheet without it → empty)
 *   categorie      (string)  Romanian display name
 *   categorie_en   (string)  English display name ('' → falls back to RO)
 *   slug           (string)  URL slug
 *   parent_slug    (string)  the L1 slug for an L2 row; '' for an L1 row
 *   imagine        (string)  hero image URL/path (Drive links auto-converted)
 *   nr_produse     (number)  indicative product count (badge fallback)
 *   ordine         (number)  sort order (ascending)
 */
import { driveImage, normKey, parseCsv } from './products'

export interface Category {
  /** Taxonomy depth. */
  level: 'L1' | 'L2'
  categorie: string
  /** English display name ('' → falls back to the RO name). */
  categorieEn: string
  slug: string
  /** For an L2: its L1 slug. For an L1: ''. */
  parentSlug: string
  imagine: string
  nrProduse: number
  ordine: number
}

/** Canonical column keys → accepted header aliases (normalised via normKey). */
const COLUMN_ALIASES: Record<keyof Category, string[]> = {
  level: ['level', 'nivel', 'lvl'],
  categorie: ['categorie', 'category', 'nume', 'name', 'denumire'],
  categorieEn: ['categorieen', 'categorieengleza', 'categoryen', 'nameen', 'denumireen', 'en', 'engleza'],
  slug: ['slug', 'url', 'cale', 'path'],
  parentSlug: ['parentslug', 'parent', 'parinte', 'parentcat', 'l1slug'],
  imagine: ['imaginecategorie', 'imagine', 'image', 'img', 'poza', 'foto', 'photo', 'hero'],
  nrProduse: ['nrproduse', 'nrprod', 'count', 'produse', 'numarproduse', 'nr'],
  ordine: ['ordine', 'order', 'sort', 'ordonare', 'pozitie', 'position'],
}

/** The display name for a locale — EN falls back to the RO name when absent. */
export function categoryName(c: Pick<Category, 'categorie' | 'categorieEn'>, locale: 'ro' | 'en'): string {
  return locale === 'en' && c.categorieEn ? c.categorieEn : c.categorie
}

/** Diacritic-insensitive, URL-safe slug from a display name (fallback only). */
export function slugify(name: string): string {
  return (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toNum(v: unknown): number {
  const n = parseInt(String(v ?? '').replace(/[^\d]/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

function normLevel(v: string): 'L1' | 'L2' {
  return normKey(v) === 'l2' ? 'L2' : 'L1'
}

function mapHeader(header: string[]): Partial<Record<keyof Category, number>> {
  const idx: Partial<Record<keyof Category, number>> = {}
  header.forEach((h, i) => {
    const nh = normKey(h)
    for (const key of Object.keys(COLUMN_ALIASES) as (keyof Category)[]) {
      if (idx[key] == null && COLUMN_ALIASES[key].includes(nh)) idx[key] = i
    }
  })
  return idx
}

/**
 * Parse a raw categories payload (CSV or JSON) into new-schema Category rows. A
 * payload without a `level` column is treated as legacy / invalid and yields an
 * EMPTY list, so the caller falls back to the bundle. Rows without a display name
 * are dropped; a missing slug is derived from the name so routing never breaks.
 */
export function parseCategories(raw: string): Category[] {
  const text = (raw || '').trim()
  if (!text) return []

  // JSON source (array of objects, or { categories: [...] }).
  if (text[0] === '[' || text[0] === '{') {
    try {
      const data = JSON.parse(text)
      const arr: unknown[] = Array.isArray(data)
        ? data
        : Array.isArray((data as { categories?: unknown[] }).categories)
          ? (data as { categories: unknown[] }).categories
          : []
      if (!arr.length) return []
      const firstKeys = Object.keys(arr[0] as Record<string, unknown>).map(normKey)
      if (!COLUMN_ALIASES.level.some((a) => firstKeys.includes(a))) return []
      const seen = new Set<string>()
      const out: Category[] = []
      for (const r of arr) {
        const obj = r as Record<string, unknown>
        const byNorm: Record<string, unknown> = {}
        for (const k of Object.keys(obj)) byNorm[normKey(k)] = obj[k]
        const get = (key: keyof Category): string => {
          for (const alias of COLUMN_ALIASES[key]) {
            if (byNorm[alias] != null) return String(byNorm[alias])
          }
          return ''
        }
        const row = buildCategory(get)
        if (!row || seen.has(row.slug)) continue
        seen.add(row.slug)
        out.push(row)
      }
      return out
    } catch {
      // Fall through to CSV.
    }
  }

  const rows = parseCsv(text)
  if (rows.length < 2) return []
  const idx = mapHeader(rows[0])
  // Reject legacy sheets that lack the `level` column.
  if (idx.level == null) return []
  const seen = new Set<string>()
  const out: Category[] = []
  for (const cols of rows.slice(1)) {
    const get = (k: keyof Category): string => {
      const i = idx[k]
      return i != null ? (cols[i] ?? '').trim() : ''
    }
    const row = buildCategory(get)
    if (!row || seen.has(row.slug)) continue
    seen.add(row.slug)
    out.push(row)
  }
  return out
}

function buildCategory(get: (k: keyof Category) => string): Category | null {
  const categorie = get('categorie').trim()
  if (!categorie) return null
  const slug = get('slug').trim() || slugify(categorie)
  if (!slug) return null
  return {
    level: normLevel(get('level')),
    categorie,
    categorieEn: get('categorieEn').trim(),
    slug,
    parentSlug: get('parentSlug').trim(),
    imagine: driveImage(get('imagine').trim()),
    nrProduse: toNum(get('nrProduse')),
    ordine: toNum(get('ordine')),
  }
}

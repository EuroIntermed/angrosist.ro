/**
 * Category showcase — data model, parser and bundled fallback.
 *
 * The category overview (/produse) and the per-category routes (/produse/[slug])
 * are driven by a published Google Sheet (CSV) fetched at BUILD time from
 * `PUBLIC_CATEGORIES_URL` (see src/lib/config.ts + src/lib/catalog-data.ts). This
 * module is pure/isomorphic so it can run at build time and be reasoned about in
 * tests.
 *
 * SHEET SCHEMA — one category per row, header row required. Columns are matched
 * case- and diacritic-insensitively:
 *
 *   categorie          (string)  display name, e.g. "Materii prime & auxiliare"
 *   slug               (string)  URL slug, e.g. "materii-prime-auxiliare"
 *   nr_produse         (number)  OPTIONAL indicative product count (badge)
 *   imagine_categorie  (string)  hero image URL (Drive links auto-converted)
 *   sursa              (string)  OPTIONAL source/reference URL (not rendered)
 */
import { driveImage, normKey, parseCsv } from './products'

export interface Category {
  categorie: string
  slug: string
  imagine: string
  nrProduse: number
  sursa: string
}

/** Canonical column keys → accepted header aliases (normalised via normKey). */
const COLUMN_ALIASES: Record<keyof Category, string[]> = {
  categorie: ['categorie', 'category', 'nume', 'name', 'denumire'],
  slug: ['slug', 'url', 'cale', 'path'],
  nrProduse: ['nrproduse', 'nrprod', 'count', 'produse', 'numarproduse', 'nr'],
  imagine: ['imaginecategorie', 'imagine', 'image', 'img', 'poza', 'foto', 'photo', 'hero'],
  sursa: ['sursa', 'source', 'ref', 'link'],
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
 * Parse a raw categories CSV into Category rows. Rows without a display name are
 * dropped; a missing slug is derived from the name so routing never breaks.
 */
export function parseCategories(raw: string): Category[] {
  const text = (raw || '').trim()
  if (!text) return []
  const rows = parseCsv(text)
  if (rows.length < 2) return []
  const idx = mapHeader(rows[0])
  const seen = new Set<string>()
  const out: Category[] = []
  for (const cols of rows.slice(1)) {
    const get = (k: keyof Category): string => {
      const i = idx[k]
      return i != null ? (cols[i] ?? '').trim() : ''
    }
    const categorie = get('categorie')
    if (!categorie) continue
    const slug = get('slug') || slugify(categorie)
    if (!slug || seen.has(slug)) continue
    seen.add(slug)
    out.push({
      categorie,
      slug,
      imagine: driveImage(get('imagine')),
      nrProduse: toNum(get('nrProduse')),
      sursa: get('sursa'),
    })
  }
  return out
}

/**
 * Bundled SAMPLE fallback — the 12 top-level Angrosist categories with their
 * showcase hero images. Used when PUBLIC_CATEGORIES_URL is unset or the build-time
 * fetch fails, so the overview + routes always exist. Images are the owner's
 * public catalog photos (angrosist.ro uploads).
 */
export const sampleCategories: Category[] = [
  { categorie: 'Materii prime & auxiliare', slug: 'materii-prime-auxiliare', nrProduse: 222, imagine: 'https://angrosist.ro/wp-content/uploads/2024/07/Materii-prime-auxiliare-1.jpg', sursa: '' },
  { categorie: 'Cereale & pseudocereale', slug: 'cereale-pseudocereale', nrProduse: 79, imagine: 'https://angrosist.ro/wp-content/uploads/2024/07/Cereale-Pseudocereale-2.jpg', sursa: '' },
  { categorie: 'Făină & pudre', slug: 'faina-pudre', nrProduse: 28, imagine: 'https://angrosist.ro/wp-content/uploads/2024/07/faina.jpg', sursa: '' },
  { categorie: 'Oleaginoase', slug: 'oleaginoase', nrProduse: 55, imagine: 'https://angrosist.ro/wp-content/uploads/2024/07/OLEAGINOASE-2.jpg', sursa: '' },
  { categorie: 'Plante - ceai', slug: 'plante-ceai', nrProduse: 356, imagine: 'https://angrosist.ro/wp-content/uploads/2024/07/plante-2.jpg', sursa: '' },
  { categorie: 'Condimente', slug: 'condimente', nrProduse: 180, imagine: 'https://angrosist.ro/wp-content/uploads/2024/07/Condimente-2.jpg', sursa: '' },
  { categorie: 'Gluten free', slug: 'gluten-free', nrProduse: 88, imagine: 'https://angrosist.ro/wp-content/uploads/2024/07/gluten-free-1.jpg', sursa: '' },
  { categorie: 'Fructe', slug: 'fructe', nrProduse: 86, imagine: 'https://angrosist.ro/wp-content/uploads/2024/07/Fructe-4.jpg', sursa: '' },
  { categorie: 'Legume', slug: 'legume', nrProduse: 102, imagine: 'https://angrosist.ro/wp-content/uploads/2024/07/legume-e1720712466648.jpg', sursa: '' },
  { categorie: 'Legume deshidratate', slug: 'legume-deshidratate', nrProduse: 48, imagine: 'https://angrosist.ro/wp-content/uploads/2025/02/categorie-leguma-deschidratate.webp', sursa: '' },
  { categorie: 'Suplimente alimentare', slug: 'suplimente-alimentare', nrProduse: 196, imagine: 'https://angrosist.ro/wp-content/uploads/2024/12/suplimente-alimentare.webp', sursa: '' },
  { categorie: 'Mâncare gata preparată', slug: 'mancare-gata-preparata', nrProduse: 21, imagine: 'https://angrosist.ro/wp-content/uploads/2025/01/ready-food-home-hero-image-2.webp', sursa: '' },
]

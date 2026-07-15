/**
 * Build-time catalog loader.
 *
 * Fetches the published categories + products sheets ONCE per build (memoised
 * module-level promises), parses them, and joins products to their category by
 * a diacritic-insensitive name match. The /produse overview and every
 * /produse/[slug] route read from here at build time, so pages ship as static
 * HTML with real data (SEO + no-JS), while src/scripts/catalog.ts still refreshes
 * the table from the live sheet at runtime.
 *
 * Every fetch degrades gracefully: a missing URL or a failed request falls back
 * to the bundled samples (src/lib/categories.ts + src/lib/products.ts) so the
 * build never breaks and the routes always exist.
 */
import { categoriesUrl, productsUrl } from './config'
import { parseCategories, sampleCategories, type Category } from './categories'
import {
  activeOnly,
  normKey,
  parseProducts,
  sampleProducts,
  type Product,
} from './products'

/** A category enriched with its (build-time) products and an effective count. */
export interface CategoryWithProducts extends Category {
  products: Product[]
  count: number
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { Accept: 'text/csv, application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

let productsPromise: Promise<Product[]> | null = null
/** All active products (build time). Falls back to the bundled sample. */
export function loadProducts(): Promise<Product[]> {
  if (!productsPromise) {
    productsPromise = (async () => {
      if (!productsUrl) return activeOnly(sampleProducts)
      try {
        const parsed = activeOnly(parseProducts(await fetchText(productsUrl)))
        return parsed.length ? parsed : activeOnly(sampleProducts)
      } catch {
        return activeOnly(sampleProducts)
      }
    })()
  }
  return productsPromise
}

/** Bundled EN name per slug — backfills categories whose sheet lacks categorie_en. */
const EN_BY_SLUG = new Map(sampleCategories.map((c) => [c.slug, c.categorieEn]))

let categoriesPromise: Promise<Category[]> | null = null
/** The category list (build time). Falls back to the bundled 12. */
export function loadCategories(): Promise<Category[]> {
  if (!categoriesPromise) {
    categoriesPromise = (async () => {
      if (!categoriesUrl) return sampleCategories
      try {
        const parsed = parseCategories(await fetchText(categoriesUrl))
        if (!parsed.length) return sampleCategories
        // Backfill the English name from the bundled map when the sheet has no
        // categorie_en column yet, so the EN site is localised immediately.
        for (const c of parsed) if (!c.categorieEn) c.categorieEn = EN_BY_SLUG.get(c.slug) ?? ''
        return parsed
      } catch {
        return sampleCategories
      }
    })()
  }
  return categoriesPromise
}

let catalogPromise: Promise<CategoryWithProducts[]> | null = null
/**
 * Categories joined to their products, each list sorted by `ordine` then name.
 * `count` is the real product count, falling back to the sheet's `nr_produse`.
 */
export function loadCatalog(): Promise<CategoryWithProducts[]> {
  if (!catalogPromise) {
    catalogPromise = (async () => {
      const [cats, prods] = await Promise.all([loadCategories(), loadProducts()])
      const byCat = new Map<string, Product[]>()
      for (const p of prods) {
        const key = normKey(p.categorie)
        const bucket = byCat.get(key)
        if (bucket) bucket.push(p)
        else byCat.set(key, [p])
      }
      return cats.map((c) => {
        const items = (byCat.get(normKey(c.categorie)) ?? [])
          .slice()
          .sort((a, b) => a.ordine - b.ordine || a.produs.localeCompare(b.produs))
        return { ...c, products: items, count: items.length || c.nrProduse }
      })
    })()
  }
  return catalogPromise
}

/** Find one enriched category by slug (build time). */
export async function findCategory(slug: string): Promise<CategoryWithProducts | undefined> {
  return (await loadCatalog()).find((c) => c.slug === slug)
}

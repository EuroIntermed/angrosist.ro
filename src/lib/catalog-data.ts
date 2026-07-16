/**
 * Build-time catalog loader (3-LEVEL taxonomy).
 *
 * The PRIMARY source is the bundled `src/data/catalog.json` — 13 L1 categories,
 * their real L2 subcategories, and ~1320 products carrying both an `l1Slug` and a
 * leaf `subcatSlug`. The loader ALSO tries the published Google Sheets
 * (PUBLIC_CATEGORIES_URL / PUBLIC_PRODUCTS_URL) with the NEW-schema parsers; a
 * sheet is only adopted when it parses into a non-empty new-schema catalog. The
 * legacy 2-level sheets still live at those URLs today, so their new-schema parse
 * returns empty and the bundle wins — exactly as intended until the sheets are
 * re-imported.
 *
 * Everything here runs at BUILD time; the /produse overview, the L1 pages and the
 * L2 leaf pages ship as static HTML with real data (SEO + no-JS). The client
 * runtime (src/scripts/catalog.ts) refreshes a single leaf's table from the live
 * sheet only when that sheet is new-schema.
 */
import bundle from '../data/catalog.json'
import { categoriesUrl, productsUrl } from './config'
import { parseCategories, type Category } from './categories'
import { parseProducts, type Product } from './products'

export type { Category, Product }

/** A category enriched with its effective product count (badge + hero). */
export interface CategoryWithCount extends Category {
  count: number
}

/** The whole catalog: every category (L1 + L2) and every product. */
export interface Catalog {
  categories: Category[]
  products: Product[]
}

const bundleCatalog = bundle as unknown as Catalog

async function fetchText(url: string): Promise<string> {
  // Bound the build-time fetch so a slow/hanging Sheet can't stall the whole
  // build — on timeout it throws and the caller falls back to the bundle.
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 10_000)
  try {
    const res = await fetch(url, {
      headers: { Accept: 'text/csv, application/json' },
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Default a category with no image to the self-hosted convention
 * `/categories/<slug>.jpg`. Lets a blank sheet cell still pick up a bundled image
 * (e.g. suplimente-functionale); a missing file just triggers the tile's onerror
 * placeholder, so it's always safe.
 */
function withImageFallback(categories: Category[]): Category[] {
  return categories.map((c) =>
    c.imagine ? c : { ...c, imagine: `/categories/${c.slug}.jpg` },
  )
}

let catalogPromise: Promise<Catalog> | null = null
/**
 * The catalog (build time). Prefers a valid new-schema sheet pair; otherwise the
 * bundled catalog.json. A partial/legacy sheet (either side empty) falls back.
 */
export function loadCatalog(): Promise<Catalog> {
  if (!catalogPromise) {
    catalogPromise = (async () => {
      if (categoriesUrl && productsUrl) {
        try {
          const [catText, prodText] = await Promise.all([
            fetchText(categoriesUrl),
            fetchText(productsUrl),
          ])
          const categories = parseCategories(catText)
          const products = parseProducts(prodText)
          // Only adopt the sheets when BOTH parse as non-empty new-schema data
          // (and there is at least one L1). Otherwise the bundle wins.
          if (categories.length && products.length && categories.some((c) => c.level === 'L1')) {
            return { categories: withImageFallback(categories), products }
          }
        } catch {
          /* fall through to the bundle */
        }
      }
      return { ...bundleCatalog, categories: withImageFallback(bundleCatalog.categories) }
    })()
  }
  return catalogPromise
}

/** Count products per leaf slug (subcatSlug) and per top slug (l1Slug). */
async function counts(): Promise<{ byLeaf: Map<string, number>; byL1: Map<string, number> }> {
  const { products } = await loadCatalog()
  const byLeaf = new Map<string, number>()
  const byL1 = new Map<string, number>()
  for (const p of products) {
    byLeaf.set(p.subcatSlug, (byLeaf.get(p.subcatSlug) ?? 0) + 1)
    byL1.set(p.l1Slug, (byL1.get(p.l1Slug) ?? 0) + 1)
  }
  return { byLeaf, byL1 }
}

/** The 13 top-level (L1) categories, sorted by `ordine`, each with a product count. */
export async function loadL1(): Promise<CategoryWithCount[]> {
  const { categories } = await loadCatalog()
  const { byL1 } = await counts()
  return categories
    .filter((c) => c.level === 'L1')
    .sort((a, b) => a.ordine - b.ordine)
    .map((c) => ({ ...c, count: byL1.get(c.slug) ?? c.nrProduse }))
}

/** The real L2 subcategories of an L1, sorted by `ordine`, each with a count. */
export async function loadSubcategories(l1Slug: string): Promise<CategoryWithCount[]> {
  const { categories } = await loadCatalog()
  const { byLeaf } = await counts()
  return categories
    .filter((c) => c.level === 'L2' && c.parentSlug === l1Slug)
    .sort((a, b) => a.ordine - b.ordine)
    .map((c) => ({ ...c, count: byLeaf.get(c.slug) ?? c.nrProduse }))
}

/** Products for a leaf slug (a real L2 slug, or an L1 slug for direct products). */
export async function loadProductsFor(slug: string): Promise<Product[]> {
  const { products } = await loadCatalog()
  return products
    .filter((p) => p.subcatSlug === slug)
    .sort((a, b) => a.produs.localeCompare(b.produs, 'ro'))
}

/** Products that hang directly off an L1 (subcatSlug === l1Slug). */
export function directProducts(l1Slug: string): Promise<Product[]> {
  return loadProductsFor(l1Slug)
}

/** Find one L1 category by slug (with count). */
export async function findL1(slug: string): Promise<CategoryWithCount | undefined> {
  return (await loadL1()).find((c) => c.slug === slug)
}

/** Find one L2 category by slug, together with its parent L1. */
export async function findL2(
  slug: string,
): Promise<{ l2: CategoryWithCount; l1: CategoryWithCount } | undefined> {
  const { categories } = await loadCatalog()
  const l2raw = categories.find((c) => c.level === 'L2' && c.slug === slug)
  if (!l2raw) return undefined
  const l1 = await findL1(l2raw.parentSlug)
  if (!l1) return undefined
  const { byLeaf } = await counts()
  return { l2: { ...l2raw, count: byLeaf.get(l2raw.slug) ?? l2raw.nrProduse }, l1 }
}

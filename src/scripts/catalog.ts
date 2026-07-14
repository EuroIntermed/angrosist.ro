/**
 * Produse catalog — CLIENT runtime.
 *
 * Renders a category's product TABLE from the embedded build-time rows, then
 * refreshes from the live sheet (PUBLIC_PRODUCTS_URL) in the background. Adds:
 *   - a text SEARCH box (filters by name / description / unit / category),
 *   - per-row MULTI-SELECT with a "order selected" action that sends ONE request
 *     listing every ticked product,
 *   - a per-row "Comandă" that always opens the WhatsApp/chat CHOOSER (order.ts),
 *     pre-filling a message with ALL the info we have (product, category, unit,
 *     details).
 *
 * All sheet text is rendered via textContent (untrusted input — Hard Rule #6);
 * image URLs are accepted only over http(s).
 */
import {
  parseProducts,
  groupByCategory,
  normKey,
  sampleProducts,
  type Product,
  type CategoryGroup,
} from '../lib/products'
import { OrderSheet, placeOrder } from './order'

interface CatalogStrings {
  filterAll: string
  loading: string
  empty: string
  error: string
  retry: string
  sampleNote: string
  orderCta: string
  imageAlt: string
  headImage: string
  headProduct: string
  headCategory: string
  headDesc: string
  headUnit: string
  headOrder: string
  headSelect: string
  priceEmpty: string
  results: string
  searchPlaceholder: string
  searchEmpty: string
  selectAll: string
  selectedCount: string
  orderSelected: string
  clearSelection: string
}
interface CatalogConfig {
  productsUrl: string
  waNumber: string
  intent: string
  /** Single-product message template ({product}/{category}/{unit}/{details}). */
  orderTemplate: string
  /** Multi-product message parts (intro/{category}, per item, outro). */
  orderMultiIntro: string
  orderMultiItem: string
  orderMultiOutro: string
  /**
   * Single-category mode: when set (a category display name), the runtime shows
   * ONLY that category's products and suppresses the category filter chips. Used
   * by the per-category pages (/produse/[slug]).
   */
  category?: string
  strings: CatalogStrings
}

function readJson<T>(selector: string): T | null {
  const el = document.querySelector(selector)
  if (!el || !el.textContent) return null
  try {
    return JSON.parse(el.textContent) as T
  } catch {
    return null
  }
}

/** Stable identity for a product row (name + unit + details distinguish variants). */
function productKey(p: Product): string {
  return `${p.produs}${p.unitate}${p.descriere}`
}

/** Small accent-tinted thumbnail (product initial) when a row has no image. */
function thumbPlaceholder(name: string): HTMLElement {
  const box = document.createElement('div')
  box.className = 'ag-thumb ag-thumb--ph'
  box.setAttribute('aria-hidden', 'true')
  const span = document.createElement('span')
  span.textContent = (name.trim()[0] || '·').toUpperCase()
  box.appendChild(span)
  return box
}

function thumb(p: Product): HTMLElement {
  const src = p.imagine.trim()
  if (/^https?:\/\//i.test(src)) {
    const img = document.createElement('img')
    img.className = 'ag-thumb'
    img.src = src
    img.alt = p.produs
    img.loading = 'lazy'
    img.decoding = 'async'
    img.width = 48
    img.height = 48
    img.addEventListener('error', () => {
      img.replaceWith(thumbPlaceholder(p.produs))
    })
    return img
  }
  return thumbPlaceholder(p.produs)
}

function td(label: string, className: string): HTMLTableCellElement {
  const cell = document.createElement('td')
  cell.className = className
  if (label) cell.dataset.label = label
  return cell
}

interface RowHandlers {
  onOrder: (p: Product) => void
  onToggle: (p: Product, checked: boolean) => void
  isSelected: (p: Product) => boolean
}

function row(p: Product, cfg: CatalogConfig, h: RowHandlers): HTMLTableRowElement {
  const s = cfg.strings
  const tr = document.createElement('tr')
  tr.className = 'ag-row'
  tr.dataset.category = p.categorie || '—'
  tr.dataset.key = productKey(p)
  tr.dataset.search = `${p.produs} ${p.descriere} ${p.unitate} ${p.categorie}`.toLowerCase()

  // Select checkbox (leading).
  const checkCell = td(s.headSelect, 'ag-td ag-td--check')
  const check = document.createElement('input')
  check.type = 'checkbox'
  check.className = 'ag-check'
  check.checked = h.isSelected(p)
  check.setAttribute('aria-label', `${s.headSelect}: ${p.produs}`)
  check.addEventListener('change', () => h.onToggle(p, check.checked))
  checkCell.appendChild(check)
  tr.appendChild(checkCell)

  const imgCell = td(s.headImage, 'ag-td ag-td--img')
  imgCell.appendChild(thumb(p))
  tr.appendChild(imgCell)

  const nameCell = td(s.headProduct, 'ag-td ag-td--name')
  const name = document.createElement('span')
  name.className = 'ag-row__name'
  name.textContent = p.produs
  nameCell.appendChild(name)
  tr.appendChild(nameCell)

  const descCell = td(s.headDesc, 'ag-td ag-td--desc')
  const descText = document.createElement('span')
  descText.className = 'ag-clamp'
  descText.textContent = p.descriere
  descCell.appendChild(descText)
  tr.appendChild(descCell)

  const unitCell = td(s.headUnit, 'ag-td ag-td--unit')
  unitCell.textContent = p.unitate || s.priceEmpty
  tr.appendChild(unitCell)

  const orderCell = td('', 'ag-td ag-td--order')
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'ag-btn ag-btn--primary ag-row__order'
  btn.textContent = s.orderCta
  btn.addEventListener('click', () => h.onOrder(p))
  orderCell.appendChild(btn)
  tr.appendChild(orderCell)

  return tr
}

/** Fill a single-product template with everything we know. */
function buildMessage(template: string, p: Product): string {
  return template
    .replace('{product}', p.produs)
    .replace('{category}', p.categorie || '—')
    .replace('{unit}', p.unitate || '—')
    .replace('{details}', p.descriere || '—')
}

/** Build one request listing several products. */
function buildMultiMessage(cfg: CatalogConfig, products: Product[]): string {
  const category = cfg.category || products[0]?.categorie || '—'
  const intro = cfg.orderMultiIntro.replace('{category}', category)
  const items = products.map((p, i) =>
    cfg.orderMultiItem
      .replace('{n}', String(i + 1))
      .replace('{product}', p.produs)
      .replace('{unit}', p.unitate || '—')
      .replace('{details}', p.descriere || '—'),
  )
  return [intro, ...items, cfg.orderMultiOutro].join('\n')
}

function renderFilters(
  container: HTMLElement,
  groups: CategoryGroup[],
  allLabel: string,
  onPick: (cat: string | null) => void,
): void {
  container.replaceChildren()
  const make = (label: string, value: string | null, active: boolean) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'ag-chip' + (active ? ' is-active' : '')
    b.textContent = label
    b.setAttribute('role', 'tab')
    b.setAttribute('aria-selected', String(active))
    b.addEventListener('click', () => {
      container.querySelectorAll('.ag-chip').forEach((c) => {
        c.classList.remove('is-active')
        c.setAttribute('aria-selected', 'false')
      })
      b.classList.add('is-active')
      b.setAttribute('aria-selected', 'true')
      onPick(value)
    })
    return b
  }
  container.appendChild(make(allLabel, null, true))
  groups.forEach((g) => container.appendChild(make(g.categorie, g.categorie, false)))
}

function initCatalog(): void {
  const root = document.querySelector<HTMLElement>('[data-catalog-root]')
  if (!root) return
  const cfg = readJson<CatalogConfig>('[data-catalog-config]')
  if (!cfg) return
  const fallback = readJson<Product[]>('[data-catalog-fallback]') ?? sampleProducts

  const statusEl = root.querySelector<HTMLElement>('[data-catalog-status]')!
  const filtersEl = root.querySelector<HTMLElement>('[data-catalog-filters]')
  const countEl = root.querySelector<HTMLElement>('[data-catalog-count]')!
  const wrapEl = root.querySelector<HTMLElement>('[data-catalog-table-wrap]')!
  const tbodyEl = root.querySelector<HTMLElement>('[data-catalog-tbody]')!
  const noteEl = root.querySelector<HTMLElement>('[data-catalog-note]')!
  const searchEl = root.querySelector<HTMLInputElement>('[data-catalog-search]')
  const selectAllEl = root.querySelector<HTMLInputElement>('[data-catalog-selectall]')
  const selBar = document.querySelector<HTMLElement>('[data-catalog-selbar]')
  const selCountEl = selBar?.querySelector<HTMLElement>('[data-sel-count]') ?? null
  const selOrderBtn = selBar?.querySelector<HTMLButtonElement>('[data-sel-order]') ?? null
  const selClearBtn = selBar?.querySelector<HTMLButtonElement>('[data-sel-clear]') ?? null
  const sheetEl = document.querySelector<HTMLElement>('[data-order-sheet]')
  const sheet = sheetEl ? new OrderSheet(sheetEl) : null

  // Selection persists across background re-renders (keyed by product identity).
  const selected = new Map<string, Product>()

  const onOrder = (p: Product) => {
    placeOrder(
      {
        productName: p.produs,
        message: buildMessage(cfg.orderTemplate, p),
        waNumber: cfg.waNumber,
        intent: cfg.intent || 'buy',
      },
      sheet,
    )
  }

  const orderSelected = () => {
    const products = [...selected.values()]
    if (!products.length) return
    const label = cfg.strings.selectedCount.replace('{n}', String(products.length))
    placeOrder(
      {
        productName: label,
        message: buildMultiMessage(cfg, products),
        waNumber: cfg.waNumber,
        intent: cfg.intent || 'buy',
      },
      sheet,
    )
  }

  const updateSelBar = () => {
    const n = selected.size
    if (selCountEl) selCountEl.textContent = cfg.strings.selectedCount.replace('{n}', String(n))
    if (selBar) selBar.hidden = n === 0
    // Reflect "all visible selected" on the header checkbox.
    if (selectAllEl) {
      const visible = [...tbodyEl.querySelectorAll<HTMLElement>('.ag-row:not([hidden])')]
      const allSel = visible.length > 0 && visible.every((r) => selected.has(r.dataset.key || ''))
      selectAllEl.checked = allSel
      selectAllEl.indeterminate = !allSel && n > 0
    }
  }

  const toggleSelect = (p: Product, checked: boolean) => {
    if (checked) selected.set(productKey(p), p)
    else selected.delete(productKey(p))
    updateSelBar()
  }

  const updateCount = () => {
    const visible = tbodyEl.querySelectorAll<HTMLElement>('.ag-row:not([hidden])').length
    countEl.textContent = `${visible} ${cfg.strings.results}`
  }

  const applySearch = () => {
    const q = (searchEl?.value ?? '').trim().toLowerCase()
    let visible = 0
    tbodyEl.querySelectorAll<HTMLElement>('.ag-row').forEach((tr) => {
      const match = !q || (tr.dataset.search ?? '').includes(q)
      tr.hidden = !match
      if (match) visible++
    })
    // Empty-search state uses the status slot without wiping the table.
    if (q && visible === 0) {
      statusEl.replaceChildren()
      statusEl.className = 'ag-catalog__status is-empty'
      const p = document.createElement('p')
      p.textContent = cfg.strings.searchEmpty.replace('{q}', searchEl?.value ?? '')
      statusEl.appendChild(p)
      statusEl.hidden = false
      wrapEl.hidden = true
    } else {
      statusEl.hidden = true
      wrapEl.hidden = false
    }
    updateCount()
    updateSelBar()
  }

  const setStatus = (msg: string, kind: 'loading' | 'error' | 'empty' | '', withRetry = false) => {
    statusEl.replaceChildren()
    statusEl.hidden = !msg
    if (!msg) return
    statusEl.className = 'ag-catalog__status' + (kind ? ` is-${kind}` : '')
    const p = document.createElement('p')
    p.textContent = msg
    statusEl.appendChild(p)
    if (withRetry) {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'ag-btn ag-btn--secondary'
      b.textContent = cfg.strings.retry
      b.addEventListener('click', () => load())
      statusEl.appendChild(b)
    }
  }

  // Single-category pages pass cfg.category — keep only that category's rows.
  const limitToCategory = (products: Product[]): Product[] =>
    cfg.category
      ? products.filter((p) => normKey(p.categorie) === normKey(cfg.category as string))
      : products

  const rowHandlers: RowHandlers = {
    onOrder,
    onToggle: toggleSelect,
    isSelected: (p) => selected.has(productKey(p)),
  }

  const render = (groups: CategoryGroup[], sample: boolean) => {
    setStatus('', '')
    noteEl.hidden = !sample
    if (filtersEl) {
      if (cfg.category) {
        filtersEl.hidden = true
      } else {
        renderFilters(filtersEl, groups, cfg.strings.filterAll, (cat) => {
          tbodyEl.querySelectorAll<HTMLElement>('.ag-row').forEach((tr) => {
            tr.hidden = cat != null && tr.dataset.category !== cat
          })
          updateCount()
        })
        filtersEl.hidden = false
      }
    }
    tbodyEl.replaceChildren()
    groups.forEach((g) => g.items.forEach((p) => tbodyEl.appendChild(row(p, cfg, rowHandlers))))

    // Prune selections whose product is no longer present (after a refresh).
    if (selected.size) {
      const present = new Set(
        [...tbodyEl.querySelectorAll<HTMLElement>('.ag-row')].map((r) => r.dataset.key || ''),
      )
      for (const key of [...selected.keys()]) if (!present.has(key)) selected.delete(key)
    }

    wrapEl.hidden = false
    countEl.hidden = false
    applySearch() // applies search filter + updates count + selection bar
  }

  const showFallback = (sample = true) => {
    const groups = groupByCategory(limitToCategory(fallback))
    if (groups.length) render(groups, sample)
    else setStatus(cfg.strings.empty, 'empty')
  }

  const fetchGroups = async (): Promise<CategoryGroup[]> => {
    const res = await fetch(cfg.productsUrl, {
      headers: { Accept: 'text/csv, application/json' },
      cache: 'default',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return groupByCategory(limitToCategory(parseProducts(await res.text())))
  }

  const load = async () => {
    // Single-category pages already carry build-time rows + data. Render the
    // embedded rows INSTANTLY, then refresh from the live sheet in the background
    // and swap in only on success. A slow/failed/CORS'd fetch leaves the
    // build-time table in place — the page is never blanked.
    if (cfg.category) {
      showFallback(false)
      if (!cfg.productsUrl) return
      try {
        const groups = await fetchGroups()
        if (groups.length) render(groups, false)
      } catch {
        /* keep the build-time rows already on screen */
      }
      return
    }

    // Full catalog (no live rows pre-rendered): loading → live | empty | error.
    if (filtersEl) filtersEl.hidden = true
    countEl.hidden = true
    wrapEl.hidden = true
    noteEl.hidden = true
    tbodyEl.replaceChildren()

    if (!cfg.productsUrl) {
      showFallback()
      return
    }

    setStatus(cfg.strings.loading, 'loading')
    try {
      const groups = await fetchGroups()
      if (!groups.length) {
        setStatus(cfg.strings.empty, 'empty')
        return
      }
      render(groups, false)
    } catch {
      setStatus(cfg.strings.error, 'error', true)
    }
  }

  // Wire the toolbar controls (present only on category pages).
  searchEl?.addEventListener('input', applySearch)
  selectAllEl?.addEventListener('change', () => {
    const check = selectAllEl.checked
    // Toggle every VISIBLE row via its own checkbox so the per-row change handler
    // updates the selection map from that row's product (its closure).
    tbodyEl.querySelectorAll<HTMLElement>('.ag-row:not([hidden])').forEach((tr) => {
      const box = tr.querySelector<HTMLInputElement>('.ag-check')
      if (box && box.checked !== check) {
        box.checked = check
        box.dispatchEvent(new Event('change'))
      }
    })
    updateSelBar()
  })
  selOrderBtn?.addEventListener('click', orderSelected)
  selClearBtn?.addEventListener('click', () => {
    selected.clear()
    tbodyEl.querySelectorAll<HTMLInputElement>('.ag-check').forEach((b) => (b.checked = false))
    updateSelBar()
  })

  load()
}

initCatalog()

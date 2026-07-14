/**
 * Produse catalog — CLIENT runtime.
 *
 * Reads a small config blob + the bundled sample fallback from the page, fetches
 * the live sheet (CSV/JSON) from PUBLIC_PRODUCTS_URL at runtime, parses it, groups
 * by category, renders a professional TABLE with a category filter, and wires each
 * "Comandă" button into the device-aware order flow (src/scripts/order.ts).
 *
 * States: loading → (live | empty | error) with a graceful sample fallback when no
 * URL is configured. All sheet text is rendered via textContent (untrusted input —
 * Hard Rule #6); image URLs are accepted only over http(s).
 */
import {
  parseProducts,
  groupByCategory,
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
  priceLabel: string
  imageAlt: string
  headImage: string
  headProduct: string
  headCategory: string
  headDesc: string
  headUnit: string
  headPrice: string
  headOrder: string
  priceEmpty: string
  results: string
}
interface CatalogConfig {
  productsUrl: string
  waNumber: string
  intent: string
  orderTemplate: string
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

function row(p: Product, cfg: CatalogConfig, onOrder: (p: Product) => void): HTMLTableRowElement {
  const s = cfg.strings
  const tr = document.createElement('tr')
  tr.className = 'ag-row'
  tr.dataset.category = p.categorie || '—'

  const imgCell = td(s.headImage, 'ag-td ag-td--img')
  imgCell.appendChild(thumb(p))
  tr.appendChild(imgCell)

  const nameCell = td(s.headProduct, 'ag-td ag-td--name')
  const name = document.createElement('span')
  name.className = 'ag-row__name'
  name.textContent = p.produs
  nameCell.appendChild(name)
  tr.appendChild(nameCell)

  const catCell = td(s.headCategory, 'ag-td ag-td--cat')
  catCell.textContent = p.categorie || '—'
  tr.appendChild(catCell)

  const descCell = td(s.headDesc, 'ag-td ag-td--desc')
  const descText = document.createElement('span')
  descText.className = 'ag-clamp'
  descText.textContent = p.descriere
  descCell.appendChild(descText)
  tr.appendChild(descCell)

  const unitCell = td(s.headUnit, 'ag-td ag-td--unit')
  unitCell.textContent = p.unitate || s.priceEmpty
  tr.appendChild(unitCell)

  const priceCell = td(s.headPrice, 'ag-td ag-td--price')
  priceCell.textContent = p.pret || s.priceEmpty
  if (p.pret) priceCell.title = s.priceLabel
  tr.appendChild(priceCell)

  const orderCell = td('', 'ag-td ag-td--order')
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'ag-btn ag-btn--primary ag-row__order'
  btn.textContent = s.orderCta
  btn.addEventListener('click', () => onOrder(p))
  orderCell.appendChild(btn)
  tr.appendChild(orderCell)

  return tr
}

function buildMessage(template: string, p: Product): string {
  return template
    .replace('{product}', p.produs)
    .replace('{category}', p.categorie || '—')
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
  const filtersEl = root.querySelector<HTMLElement>('[data-catalog-filters]')!
  const countEl = root.querySelector<HTMLElement>('[data-catalog-count]')!
  const wrapEl = root.querySelector<HTMLElement>('[data-catalog-table-wrap]')!
  const tbodyEl = root.querySelector<HTMLElement>('[data-catalog-tbody]')!
  const noteEl = root.querySelector<HTMLElement>('[data-catalog-note]')!
  const sheetEl = document.querySelector<HTMLElement>('[data-order-sheet]')
  const sheet = sheetEl ? new OrderSheet(sheetEl) : null

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

  const updateCount = () => {
    const visible = tbodyEl.querySelectorAll<HTMLElement>('.ag-row:not([hidden])').length
    countEl.textContent = `${visible} ${cfg.strings.results}`
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

  const render = (groups: CategoryGroup[], sample: boolean) => {
    setStatus('', '')
    noteEl.hidden = !sample
    renderFilters(filtersEl, groups, cfg.strings.filterAll, (cat) => {
      tbodyEl.querySelectorAll<HTMLElement>('.ag-row').forEach((tr) => {
        tr.hidden = cat != null && tr.dataset.category !== cat
      })
      updateCount()
    })
    filtersEl.hidden = false
    tbodyEl.replaceChildren()
    groups.forEach((g) => g.items.forEach((p) => tbodyEl.appendChild(row(p, cfg, onOrder))))
    wrapEl.hidden = false
    countEl.hidden = false
    updateCount()
  }

  const showFallback = () => {
    const groups = groupByCategory(fallback)
    if (groups.length) render(groups, true)
    else setStatus(cfg.strings.empty, 'empty')
  }

  const load = async () => {
    filtersEl.hidden = true
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
      const res = await fetch(cfg.productsUrl, {
        headers: { Accept: 'text/csv, application/json' },
        cache: 'default',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      const groups = groupByCategory(parseProducts(text))
      if (!groups.length) {
        setStatus(cfg.strings.empty, 'empty')
        return
      }
      render(groups, false)
    } catch {
      setStatus(cfg.strings.error, 'error', true)
    }
  }

  load()
}

initCatalog()

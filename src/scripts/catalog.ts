/**
 * Produse catalog — CLIENT runtime.
 *
 * Reads a small config blob + the bundled sample fallback from the page, fetches
 * the live sheet (CSV/JSON) from PUBLIC_PRODUCTS_URL at runtime, parses it, groups
 * by category, renders responsive cards with a category filter, and wires each
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
  unitLabel: string
  imageAlt: string
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

/** Safe accent-tinted placeholder (product initial) when a row has no image. */
function placeholder(name: string): HTMLElement {
  const box = document.createElement('div')
  box.className = 'ag-prod__ph'
  box.setAttribute('aria-hidden', 'true')
  const span = document.createElement('span')
  span.textContent = (name.trim()[0] || '·').toUpperCase()
  box.appendChild(span)
  return box
}

function media(p: Product, alt: string): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'ag-prod__media'
  const src = p.imagine.trim()
  if (/^https?:\/\//i.test(src)) {
    const img = document.createElement('img')
    img.src = src
    img.alt = p.produs || alt
    img.loading = 'lazy'
    img.decoding = 'async'
    img.addEventListener('error', () => {
      wrap.replaceChildren(placeholder(p.produs))
    })
    wrap.appendChild(img)
  } else {
    wrap.appendChild(placeholder(p.produs))
  }
  return wrap
}

function card(p: Product, cfg: CatalogConfig, onOrder: (p: Product) => void): HTMLElement {
  const s = cfg.strings
  const el = document.createElement('article')
  el.className = 'ag-prod'

  el.appendChild(media(p, s.imageAlt))

  const body = document.createElement('div')
  body.className = 'ag-prod__body'

  const h = document.createElement('h3')
  h.className = 'ag-prod__name'
  h.textContent = p.produs
  body.appendChild(h)

  if (p.descriere) {
    const desc = document.createElement('p')
    desc.className = 'ag-prod__desc'
    desc.textContent = p.descriere
    body.appendChild(desc)
  }

  const meta = document.createElement('div')
  meta.className = 'ag-prod__meta'
  if (p.unitate) {
    const u = document.createElement('span')
    u.className = 'ag-prod__unit'
    u.textContent = p.unitate
    meta.appendChild(u)
  }
  if (p.pret) {
    const pr = document.createElement('span')
    pr.className = 'ag-prod__price'
    pr.title = s.priceLabel
    pr.textContent = p.pret
    meta.appendChild(pr)
  }
  if (meta.childElementCount) body.appendChild(meta)

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'ei-btn ei-btn--primary ei-btn--sm ag-prod__order'
  btn.textContent = s.orderCta
  btn.addEventListener('click', () => onOrder(p))
  body.appendChild(btn)

  el.appendChild(body)
  return el
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
  const gridEl = root.querySelector<HTMLElement>('[data-catalog-grid]')!
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
      b.className = 'ei-btn ei-btn--secondary ei-btn--sm'
      b.textContent = cfg.strings.retry
      b.addEventListener('click', () => load())
      statusEl.appendChild(b)
    }
  }

  const render = (groups: CategoryGroup[], sample: boolean) => {
    setStatus('', '')
    noteEl.hidden = !sample
    renderFilters(filtersEl, groups, cfg.strings.filterAll, (cat) => {
      gridEl.querySelectorAll<HTMLElement>('.ag-cat').forEach((sec) => {
        sec.hidden = cat != null && sec.dataset.category !== cat
      })
    })
    filtersEl.hidden = false
    gridEl.replaceChildren()
    groups.forEach((g) => {
      const sec = document.createElement('section')
      sec.className = 'ag-cat'
      sec.dataset.category = g.categorie
      const head = document.createElement('h2')
      head.className = 'ag-cat__title'
      head.textContent = g.categorie
      sec.appendChild(head)
      const grid = document.createElement('div')
      grid.className = 'ag-prod-grid'
      g.items.forEach((p) => grid.appendChild(card(p, cfg, onOrder)))
      sec.appendChild(grid)
      gridEl.appendChild(sec)
    })
  }

  const showFallback = () => {
    const groups = groupByCategory(fallback)
    if (groups.length) render(groups, true)
    else setStatus(cfg.strings.empty, 'empty')
  }

  const load = async () => {
    filtersEl.hidden = true
    noteEl.hidden = true
    gridEl.replaceChildren()

    if (!cfg.productsUrl) {
      showFallback()
      return
    }

    setStatus(cfg.strings.loading, 'loading')
    try {
      const res = await fetch(cfg.productsUrl, { headers: { Accept: 'text/csv, application/json' } })
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

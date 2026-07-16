/**
 * Produse catalog — CLIENT runtime (single leaf table).
 *
 * A page's product table shows ONE leaf's products (a real L2 subcategory, or an
 * L1's direct products). The rows are supplied at build time (embedded JSON); this
 * runtime renders them, then OPTIONALLY refreshes from a live sheet — but only when
 * that sheet is NEW-schema (parseProducts rejects the legacy sheet, so the
 * build-time rows are kept). It adds:
 *   - a text SEARCH box (filters by name / description / unit / subcategory),
 *   - per-row MULTI-SELECT with an "order selected" action that sends ONE request
 *     listing every ticked product,
 *   - a per-row "Comandă" that always opens the WhatsApp/chat CHOOSER (order.ts),
 *     pre-filling a message with all the info we have (product, category, unit,
 *     details).
 *
 * All text is rendered via textContent (untrusted input — Hard Rule #6). Every
 * element lookup is NULL-SAFE.
 */
import { parseProducts, type Product } from '../lib/products'
import { OrderSheet, placeOrder } from './order'

/** The subset of product fields this runtime needs. */
interface Row {
  sku: string
  produs: string
  subcatSlug: string
  subcategorie: string
  descriere: string
  unitate: string
  pret?: string
}

interface CatalogStrings {
  loading: string
  empty: string
  error: string
  retry: string
  orderCta: string
  priceEmpty: string
  results: string
  searchPlaceholder: string
  searchEmpty: string
  headProduct: string
  headDesc: string
  headUnit: string
  headOrder: string
  headSelect: string
  selectAll: string
  selectedCount: string
  orderSelected: string
  clearSelection: string
  // Product detail modal.
  detailsTitle: string
  labelSku: string
  labelCategory: string
  labelUnit: string
  close: string
}
interface CatalogConfig {
  productsUrl: string
  waNumber: string
  intent: string
  /** Leaf slug — the live-sheet refresh is filtered to this subcatSlug. */
  leafSlug: string
  /** Category label used in the order message (the leaf subcategorie). */
  categoryLabel: string
  /** Single-product message template ({product}/{category}/{unit}/{details}). */
  orderTemplate: string
  /** Multi-product message parts (intro/{category}, per item, outro). */
  orderMultiIntro: string
  orderMultiItem: string
  orderMultiOutro: string
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
function productKey(p: Row): string {
  return `${p.produs}${p.unitate}${p.descriere}`
}

function td(label: string, className: string): HTMLTableCellElement {
  const cell = document.createElement('td')
  cell.className = className
  if (label) cell.dataset.label = label
  return cell
}

interface RowHandlers {
  onOrder: (p: Row) => void
  onToggle: (p: Row, checked: boolean) => void
  onOpenDetail: (p: Row) => void
  isSelected: (p: Row) => boolean
}

function row(p: Row, cfg: CatalogConfig, h: RowHandlers): HTMLTableRowElement {
  const s = cfg.strings
  const tr = document.createElement('tr')
  tr.className = 'ag-row is-clickable'
  tr.dataset.category = p.subcategorie || '—'
  tr.dataset.key = productKey(p)
  tr.dataset.search = `${p.produs} ${p.sku} ${p.descriere} ${p.unitate} ${p.subcategorie}`.toLowerCase()

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

  const nameCell = td(s.headProduct, 'ag-td ag-td--name')
  // Focusable, keyboard-operable trigger for the detail modal.
  const name = document.createElement('span')
  name.className = 'ag-row__name'
  name.textContent = p.produs
  name.tabIndex = 0
  name.setAttribute('role', 'button')
  name.setAttribute('aria-label', `${s.detailsTitle}: ${p.produs}`)
  name.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      h.onOpenDetail(p)
    }
  })
  nameCell.appendChild(name)
  if (p.sku) {
    const sku = document.createElement('span')
    sku.className = 'ag-row__sku'
    sku.textContent = p.sku
    nameCell.appendChild(sku)
  }
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

  // A tap anywhere on the row opens the product detail modal — EXCEPT on the
  // checkbox cell or the "Comandă" button, which keep their own behaviour.
  tr.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.closest('.ag-td--check') || target.closest('.ag-row__order')) return
    h.onOpenDetail(p)
  })

  return tr
}

/** Fill a single-product template with everything we know (SKU included). */
function buildMessage(cfg: CatalogConfig, p: Row): string {
  return cfg.orderTemplate
    .replace('{product}', p.produs)
    .replace('{sku}', p.sku || '—')
    .replace('{category}', cfg.categoryLabel || p.subcategorie || '—')
    .replace('{unit}', p.unitate || '—')
    .replace('{details}', p.descriere || '—')
}

/** Build one request listing several products (each line carries its SKU). */
function buildMultiMessage(cfg: CatalogConfig, products: Row[]): string {
  const category = cfg.categoryLabel || products[0]?.subcategorie || '—'
  const intro = cfg.orderMultiIntro.replace('{category}', category)
  const items = products.map((p, i) =>
    cfg.orderMultiItem
      .replace('{n}', String(i + 1))
      .replace('{product}', p.produs)
      .replace('{sku}', p.sku || '—')
      .replace('{unit}', p.unitate || '—')
      .replace('{details}', p.descriere || '—'),
  )
  return [intro, ...items, cfg.orderMultiOutro].join('\n')
}

const MODAL_FOCUSABLE =
  'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'

/**
 * Accessible product-detail modal. Controls the [data-product-modal] element:
 * opens as a focus-trapped dialog, fills its slots from a product, closes on
 * Escape / backdrop / close button, and restores focus to the trigger. Modeled
 * on OrderSheet (order.ts).
 */
class ProductModal {
  private root: HTMLElement
  private nameEl: HTMLElement | null
  private skuRow: HTMLElement | null
  private skuEl: HTMLElement | null
  private categoryEl: HTMLElement | null
  private unitEl: HTMLElement | null
  private priceRow: HTMLElement | null
  private priceEl: HTMLElement | null
  private descEl: HTMLElement | null
  private orderBtn: HTMLButtonElement | null
  private priceEmpty: string
  private lastFocus: HTMLElement | null = null
  private onOrder: (() => void) | null = null

  constructor(root: HTMLElement, priceEmpty: string) {
    this.root = root
    this.nameEl = root.querySelector('[data-modal-name]')
    this.skuRow = root.querySelector('[data-modal-sku-row]')
    this.skuEl = root.querySelector('[data-modal-sku]')
    this.categoryEl = root.querySelector('[data-modal-category]')
    this.unitEl = root.querySelector('[data-modal-unit]')
    this.priceRow = root.querySelector('[data-modal-price-row]')
    this.priceEl = root.querySelector('[data-modal-price]')
    this.descEl = root.querySelector('[data-modal-desc]')
    this.orderBtn = root.querySelector('[data-modal-order]')
    this.priceEmpty = priceEmpty

    this.orderBtn?.addEventListener('click', () => {
      const fn = this.onOrder
      this.close()
      fn?.()
    })
    root.querySelectorAll('[data-modal-close]').forEach((el) =>
      el.addEventListener('click', () => this.close()),
    )
    root.addEventListener('keydown', (e) => this.onKeydown(e as KeyboardEvent))
  }

  open(p: Row, category: string, onOrder: () => void): void {
    this.onOrder = onOrder
    if (this.nameEl) this.nameEl.textContent = p.produs
    if (this.skuEl) this.skuEl.textContent = p.sku
    if (this.skuRow) this.skuRow.hidden = !p.sku
    if (this.categoryEl) this.categoryEl.textContent = category || p.subcategorie || '—'
    if (this.unitEl) this.unitEl.textContent = p.unitate || this.priceEmpty
    if (this.priceEl) this.priceEl.textContent = p.pret || this.priceEmpty
    if (this.priceRow) this.priceRow.hidden = !p.pret
    if (this.descEl) this.descEl.textContent = p.descriere
    this.lastFocus = document.activeElement as HTMLElement | null
    this.root.hidden = false
    void this.root.offsetHeight
    this.root.classList.add('is-open')
    document.body.style.overflow = 'hidden'
    this.orderBtn?.focus()
  }

  close(): void {
    if (this.root.hidden) return
    this.root.classList.remove('is-open')
    document.body.style.overflow = ''
    const done = () => {
      this.root.hidden = true
      this.root.removeEventListener('transitionend', done)
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) done()
    else this.root.addEventListener('transitionend', done)
    this.lastFocus?.focus?.()
  }

  private onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault()
      this.close()
      return
    }
    if (e.key !== 'Tab') return
    const items = Array.from(this.root.querySelectorAll<HTMLElement>(MODAL_FOCUSABLE)).filter(
      (el) => el.offsetParent !== null,
    )
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

function initCatalog(): void {
  const root = document.querySelector<HTMLElement>('[data-catalog-root]')
  if (!root) return
  const cfg = readJson<CatalogConfig>('[data-catalog-config]')
  if (!cfg) return
  const fallback = readJson<Row[]>('[data-catalog-fallback]') ?? []

  const statusEl = root.querySelector<HTMLElement>('[data-catalog-status]')
  const countEl = root.querySelector<HTMLElement>('[data-catalog-count]')
  const wrapEl = root.querySelector<HTMLElement>('[data-catalog-table-wrap]')
  const tbodyEl = root.querySelector<HTMLElement>('[data-catalog-tbody]')
  if (!tbodyEl || !wrapEl) return
  const searchEl = root.querySelector<HTMLInputElement>('[data-catalog-search]')
  const selectAllEl = root.querySelector<HTMLInputElement>('[data-catalog-selectall]')
  const selBar = root.querySelector<HTMLElement>('[data-catalog-selbar]')
  const selCountEl = selBar?.querySelector<HTMLElement>('[data-sel-count]') ?? null
  const selOrderBtn = selBar?.querySelector<HTMLButtonElement>('[data-sel-order]') ?? null
  const selClearBtn = selBar?.querySelector<HTMLButtonElement>('[data-sel-clear]') ?? null
  const sheetEl = root.querySelector<HTMLElement>('[data-order-sheet]')
  const sheet = sheetEl ? new OrderSheet(sheetEl) : null
  const modalEl = root.querySelector<HTMLElement>('[data-product-modal]')
  const modal = modalEl ? new ProductModal(modalEl, cfg.strings.priceEmpty) : null

  // Selection persists across background re-renders (keyed by product identity).
  const selected = new Map<string, Row>()

  const onOrder = (p: Row) => {
    placeOrder(
      {
        productName: p.produs,
        message: buildMessage(cfg, p),
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

  const toggleSelect = (p: Row, checked: boolean) => {
    if (checked) selected.set(productKey(p), p)
    else selected.delete(productKey(p))
    updateSelBar()
  }

  const updateCount = () => {
    const visible = tbodyEl.querySelectorAll<HTMLElement>('.ag-row:not([hidden])').length
    if (countEl) countEl.textContent = `${visible} ${cfg.strings.results}`
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
    if (statusEl && q && visible === 0) {
      statusEl.replaceChildren()
      statusEl.className = 'ag-catalog__status is-empty'
      const p = document.createElement('p')
      p.textContent = cfg.strings.searchEmpty.replace('{q}', searchEl?.value ?? '')
      statusEl.appendChild(p)
      statusEl.hidden = false
      wrapEl.hidden = true
    } else {
      if (statusEl) statusEl.hidden = true
      wrapEl.hidden = false
    }
    updateCount()
    updateSelBar()
  }

  const openDetail = (p: Row) => {
    if (!modal) {
      onOrder(p)
      return
    }
    modal.open(p, cfg.categoryLabel, () => onOrder(p))
  }

  const rowHandlers: RowHandlers = {
    onOrder,
    onToggle: toggleSelect,
    onOpenDetail: openDetail,
    isSelected: (p) => selected.has(productKey(p)),
  }

  const render = (products: Row[]) => {
    tbodyEl.replaceChildren()
    products.forEach((p) => tbodyEl.appendChild(row(p, cfg, rowHandlers)))

    // Prune selections whose product is no longer present (after a refresh).
    if (selected.size) {
      const present = new Set(
        [...tbodyEl.querySelectorAll<HTMLElement>('.ag-row')].map((r) => r.dataset.key || ''),
      )
      for (const key of [...selected.keys()]) if (!present.has(key)) selected.delete(key)
    }

    wrapEl.hidden = false
    if (countEl) countEl.hidden = false
    applySearch() // applies search filter + updates count + selection bar
  }

  // Refresh from a live NEW-schema sheet, filtered to THIS leaf. A legacy sheet
  // parses to [] (parseProducts rejects it) → we keep the build-time rows.
  const refresh = async () => {
    if (!cfg.productsUrl || !cfg.leafSlug) return
    try {
      const res = await fetch(cfg.productsUrl, {
        headers: { Accept: 'text/csv, application/json' },
        cache: 'default',
      })
      if (!res.ok) return
      const parsed: Product[] = parseProducts(await res.text())
      const leaf = parsed.filter((p) => p.subcatSlug === cfg.leafSlug)
      if (leaf.length) render(leaf)
    } catch {
      /* keep the build-time rows already on screen */
    }
  }

  // Wire the toolbar controls.
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

  // Render the embedded build-time rows immediately (they are already in the SSR
  // table too; re-rendering wires the JS handlers), then refresh in the background.
  render(fallback)
  refresh()
}

initCatalog()

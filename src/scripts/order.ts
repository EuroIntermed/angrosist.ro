/**
 * Comandă (order) flow — device-aware handoff from a product card into the agent.
 *
 * Each product's "Comandă" button builds a PREFILLED message and continues the
 * conversation, routed by device:
 *   - Desktop → open the AI chat widget automatically, prefilled, via the
 *     `window.AngrosistChat.open({ message, vertical, intent })` API (feature-
 *     detected). If the widget API is unavailable, fall back to WhatsApp.
 *   - Mobile → ask the user WhatsApp or widget with an accessible chooser sheet.
 *
 * Pure DOM + typed; no framework. Keyboard-accessible, focus-managed,
 * reduced-motion-safe (the sheet's transition is CSS and respects the global
 * off-switch in global.css).
 */

/** The chat widget's public API (a subset — everything is feature-detected). */
interface AngrosistChatApi {
  open?: (opts: { message: string; vertical: string; intent: string }) => void
  init?: (opts: Record<string, unknown>) => void
}
declare global {
  interface Window {
    AngrosistChat?: AngrosistChatApi
  }
}

/**
 * Robust desktop/mobile split: treat a device as mobile when it has a coarse
 * pointer (or cannot hover) AND a narrow viewport. Falls back to a width check
 * when matchMedia is unavailable.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  const mm = window.matchMedia
  if (typeof mm !== 'function') return window.innerWidth <= 820
  const coarse = mm('(pointer: coarse)').matches
  const noHover = mm('(hover: none)').matches
  const narrow = mm('(max-width: 820px)').matches
  return (coarse || noHover) && narrow
}

/** Feature-detect and open the chat widget prefilled. Returns whether it opened. */
export function openInWidget(message: string, intent = 'buy'): boolean {
  const api = window.AngrosistChat
  if (api && typeof api.open === 'function') {
    api.open({ message, vertical: 'angrosist', intent })
    return true
  }
  return false
}

/** Build a wa.me deep link with the prefilled message. */
export function whatsappUrl(waNumber: string, message: string): string {
  const base = `https://wa.me/${waNumber}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/** Open WhatsApp in a new tab, falling back to same-tab navigation if blocked. */
function goToWhatsApp(waNumber: string, message: string): void {
  const url = whatsappUrl(waNumber, message)
  const win = window.open(url, '_blank', 'noopener')
  if (!win) window.location.href = url
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'

/**
 * The accessible mobile chooser sheet. Controls the [data-order-sheet] element:
 * opens as a modal dialog, traps focus, closes on Escape / backdrop, and restores
 * focus to the trigger.
 */
export class OrderSheet {
  private root: HTMLElement
  private waBtn: HTMLButtonElement | null
  private widgetBtn: HTMLButtonElement | null
  private label: HTMLElement | null
  private lastFocus: HTMLElement | null = null
  private onWhatsApp: (() => void) | null = null
  private onWidget: (() => void) | null = null

  constructor(root: HTMLElement) {
    this.root = root
    this.waBtn = root.querySelector('[data-order-whatsapp]')
    this.widgetBtn = root.querySelector('[data-order-widget]')
    this.label = root.querySelector('[data-order-product]')

    this.waBtn?.addEventListener('click', () => {
      const fn = this.onWhatsApp
      this.close()
      fn?.()
    })
    this.widgetBtn?.addEventListener('click', () => {
      const fn = this.onWidget
      this.close()
      fn?.()
    })
    root.querySelectorAll('[data-order-close]').forEach((el) =>
      el.addEventListener('click', () => this.close()),
    )
    root.addEventListener('keydown', (e) => this.onKeydown(e as KeyboardEvent))
  }

  open(opts: { productName: string; onWhatsApp: () => void; onWidget: () => void }): void {
    this.onWhatsApp = opts.onWhatsApp
    this.onWidget = opts.onWidget
    if (this.label) this.label.textContent = opts.productName
    this.lastFocus = document.activeElement as HTMLElement | null
    this.root.hidden = false
    // Force reflow so the CSS enter transition runs, then flag as open.
    void this.root.offsetHeight
    this.root.classList.add('is-open')
    document.body.style.overflow = 'hidden'
    this.waBtn?.focus()
  }

  close(): void {
    if (this.root.hidden) return
    this.root.classList.remove('is-open')
    document.body.style.overflow = ''
    const done = () => {
      this.root.hidden = true
      this.root.removeEventListener('transitionend', done)
    }
    // Hide after the transition (or immediately under reduced motion).
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
    const items = Array.from(this.root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
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

export interface OrderRequest {
  productName: string
  message: string
  waNumber: string
  intent: string
}

/**
 * Ask, then act. ALWAYS presents the chooser sheet (WhatsApp vs. in-page chat)
 * on every device so the user decides how to start the conversation — the
 * message is pre-filled either way. `sheet` may be null (no sheet in the DOM);
 * then we fall straight through to widget-or-WhatsApp.
 */
export function placeOrder(req: OrderRequest, sheet: OrderSheet | null): void {
  const { message, waNumber, intent, productName } = req

  const useWidgetOrWhatsApp = () => {
    if (!openInWidget(message, intent)) goToWhatsApp(waNumber, message)
  }

  if (sheet) {
    sheet.open({
      productName,
      onWhatsApp: () => goToWhatsApp(waNumber, message),
      onWidget: useWidgetOrWhatsApp,
    })
    return
  }

  useWidgetOrWhatsApp()
}

/**
 * Shared client behaviour, loaded once per page from BaseLayout.
 *  1. Scroll-reveal: a tiny IntersectionObserver adds `.in-view` to [data-reveal]
 *     elements so the CSS entrance animation fires (staggered via --i).
 *  2. GA event delegation (migrated from the old main.js): fires
 *     `vertical_redirect` on [data-ga-vertical] clicks and `chat_opened` when the
 *     floating widget launcher is clicked. Both are inert unless gtag exists
 *     (i.e. GA_MEASUREMENT_ID was configured and consent granted).
 */

/* ---- 1. Scroll reveal --------------------------------------------------- */
function initReveal(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]')
  if (!els.length) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in-view'))
    return
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
          obs.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
  )
  els.forEach((el) => io.observe(el))
}

/* ---- 2. GA event delegation -------------------------------------------- */
function gaEvent(name: string, params?: Record<string, unknown>): void {
  const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag
  if (typeof g === 'function') g('event', name, params || {})
}

function initGaEvents(): void {
  // vertical_redirect — fired when a visitor clicks a vertical link/card.
  document.addEventListener(
    'click',
    (event) => {
      const el = (event.target as HTMLElement).closest('[data-ga-vertical]')
      if (!el) return
      gaEvent('vertical_redirect', { vertical: el.getAttribute('data-ga-vertical') })
    },
    true,
  )

  // chat_opened — best-effort when the floating widget launcher (💬) is clicked.
  document.addEventListener(
    'click',
    (event) => {
      const btn = (event.target as HTMLElement).closest('#__angrosist_widget__ button')
      if (!btn) return
      if ((btn.textContent || '').indexOf('💬') === -1) return
      gaEvent('chat_opened', { channel: 'web_widget' })
    },
    true,
  )
}

initReveal()
initGaEvents()

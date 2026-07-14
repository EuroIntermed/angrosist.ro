/**
 * Open Graph card configuration for Angrosist.
 *
 * Single source of truth shared by:
 *  - the build-time generator (`src/pages/og/[...route].ts`), which emits one
 *    1200x630 PNG per card into `dist/og/<slug>.png`, and
 *  - `BaseLayout.astro`, which resolves the current page to a card slug and
 *    builds the absolute `og:image` URL from the env-driven `siteUrl`
 *    (Hard Rule #1 — no hardcoded host in the meta tags).
 *
 * Same template as the Euro-Intermed hub, swapped to the Angrosist TEAL accent:
 * the brand name (title) + a short tagline (description) on a pale ground, signed
 * with a teal left stripe. Type is self-hosted DM Sans (vendored TTF — no network
 * at build).
 */
import type { Locale } from '../i18n/ui'

type RGB = [number, number, number]

/** Brand shown as the card title. */
const BRAND = 'Angrosist'

/** Vertical accent — teal #0a7290. */
const ACCENT: RGB = [10, 114, 144]
const GROUND_TOP: RGB = [250, 249, 245] // #faf9f5 pale paper
const GROUND_BOTTOM: RGB = [231, 240, 243] // faint teal wash
const INK: RGB = [11, 46, 58] // deep teal title ink
const MUTED: RGB = [74, 91, 97] // muted tagline

/** Font vendored into the repo (loaded from disk at build — no network). */
const FONT_PATH = './src/assets/fonts/DMSans.ttf'

/** Shared template constants consumed by the OG endpoint's getImageOptions. */
export const ogTemplate = { ACCENT, GROUND_TOP, GROUND_BOTTOM, INK, MUTED, FONT_PATH }

export interface OgCard {
  /** Big line — the brand. */
  title: string
  /** Supporting tagline. */
  description: string
}

/**
 * Cards keyed by slug. The slug becomes the emitted filename (`<slug>.png`).
 * `default` is the RO brand card and the ultimate fallback; `*-en` mirror it in
 * English. Keep this in lockstep with `ogSlug()` below.
 */
export const ogCards: Record<string, OgCard> = {
  default: {
    title: BRAND,
    description: 'Sourcing B2B en-gros — cerere trimisă, partener verificat pe WhatsApp',
  },
  'home-en': {
    title: BRAND,
    description: 'B2B wholesale sourcing — send a request, get a CUI-verified partner',
  },
  contact: {
    title: BRAND,
    description: 'Contact — trimite cererea pe WhatsApp sau cu asistentul AI',
  },
  'contact-en': {
    title: BRAND,
    description: 'Contact — send your request on WhatsApp or via the AI assistant',
  },
  produse: {
    title: BRAND,
    description: 'Catalog en-gros — spui ce cauți, primești oferta potrivită',
  },
  'produse-en': {
    title: BRAND,
    description: 'Wholesale catalog — tell us what you need, get the right offer',
  },
  'cum-functioneaza': {
    title: BRAND,
    description: 'Cum funcționează — trei pași până la primul partener',
  },
  'cum-functioneaza-en': {
    title: BRAND,
    description: 'How it works — three steps to your first partner',
  },
}

/**
 * Resolve a page path + locale to a card slug. Locale-prefixed paths (`/en/...`)
 * are normalised first. Unknown routes (e.g. legal pages) fall back to the brand
 * card. Used by BaseLayout to pick the `og:image`; the endpoint emits exactly the
 * slugs referenced here.
 */
export function ogSlug(path: string, locale: Locale): string {
  const p = path.replace(/^\/en(?=\/|$)/, '').replace(/\/$/, '') || '/'
  const en = locale === 'en'
  const key =
    p === '/contact'
      ? 'contact'
      : p === '/produse'
        ? 'produse'
        : p === '/cum-functioneaza'
          ? 'cum-functioneaza'
          : null
  if (key) return en ? `${key}-en` : key
  // Home + any other page (legal, 404, ...) → brand card.
  return en ? 'home-en' : 'default'
}

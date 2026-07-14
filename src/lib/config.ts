/**
 * Central, build-time configuration reader for the Angrosist site.
 *
 * Every external URL / ID / feature flag is read from the environment here and
 * nowhere else (Hard Rule #1 — no hardcoded secrets or URLs in source). This
 * mirrors the Euro-Intermed hub's config so the two sites stay conventionally
 * identical; only the defaults differ (Angrosist origin, brand contact).
 *
 * The Astro build runs in Node on Vercel, so `.astro` frontmatter reads
 * `process.env` directly. We fall back to `import.meta.env` for PUBLIC_-prefixed
 * values that Vite may inline (these are the ones also read from CLIENT scripts).
 * Non-PUBLIC names (WIDGET_*, GA_MEASUREMENT_ID, SITE_URL) are read from
 * process.env and must NOT be renamed — they already exist on the Vercel projects.
 *
 * Env vars (set per Vercel project):
 *   WIDGET_ENABLED           "true" (default) embeds the chat widget; "false" removes it.
 *   WIDGET_BASE_URL          origin that serves widget.js (default dash.euro-intermed.com).
 *   GA_MEASUREMENT_ID        GA4 Measurement ID, e.g. "G-XXXXXXX". Empty/unset →
 *                            analytics + cookie banner are stripped entirely.
 *   SITE_URL / PUBLIC_SITE_URL  canonical site origin (also used by astro.config).
 *   PUBLIC_WHATSAPP_NUMBER   WhatsApp number (digits only) for wa.me routing.
 *   PUBLIC_CONTACT_EMAIL / PUBLIC_CONTACT_PHONE / PUBLIC_CALENDLY_URL  contact details.
 *   PUBLIC_PRODUCTS_URL      published Google Sheet / Excel exported as CSV or JSON
 *                            (the "Produse" catalog data source). Empty → the site
 *                            renders the bundled sample fallback instead.
 *   PUBLIC_URL_EURO_INTERMED / PUBLIC_URL_PALLETCLEARANCE / PUBLIC_URL_SKALYOU /
 *   PUBLIC_URL_READYMEAL     ecosystem cross-link destinations.
 */

const viteEnv = import.meta.env as Record<string, string | undefined>

/** Read an env var: process.env (Node, build time) first, then Vite's env. */
function read(key: string): string | undefined {
  const fromNode =
    typeof process !== 'undefined' && process.env ? process.env[key] : undefined
  return fromNode ?? viteEnv[key]
}

function str(key: string, fallback = ''): string {
  return (read(key) ?? fallback).toString().trim()
}

/** Widget is enabled unless the flag is explicitly "false". */
export const widgetEnabled: boolean =
  str('WIDGET_ENABLED', 'true').toLowerCase() !== 'false'

/** Origin that serves widget.js — trailing slashes stripped. */
export const widgetBaseUrl: string = str(
  'WIDGET_BASE_URL',
  'https://dash.euro-intermed.com',
).replace(/\/+$/, '')

/** GA4 Measurement ID. Empty string means analytics is OFF (no snippet, no banner). */
export const gaMeasurementId: string = str('GA_MEASUREMENT_ID', '')

/** True only when a GA id is configured — gates the GA snippet + cookie banner. */
export const analyticsEnabled: boolean = gaMeasurementId.length > 0

/** Canonical site origin (no trailing slash). */
export const siteUrl: string = (
  read('SITE_URL') ??
  read('PUBLIC_SITE_URL') ??
  (read('VERCEL_PROJECT_PRODUCTION_URL')
    ? `https://${read('VERCEL_PROJECT_PRODUCTION_URL')}`
    : 'https://angrosist.ro')
)
  .toString()
  .trim()
  .replace(/\/+$/, '')

/* ---- Public contact details (safe to expose; not secrets) ---------------
 * NOTE: there is intentionally NO contact-form POST endpoint. The site is
 * WhatsApp-first (wa.me deep links) + the AI chat widget; this is the standard
 * for all three ecosystem sites. Do not add a form-action env var back. */
export const whatsappNumber: string = str('PUBLIC_WHATSAPP_NUMBER', '40745799995')
export const contactEmail: string = str('PUBLIC_CONTACT_EMAIL', 'eurointermeds@gmail.com')
export const contactPhone: string = str('PUBLIC_CONTACT_PHONE', '+40745799995')
export const calendlyUrl: string = str('PUBLIC_CALENDLY_URL', 'https://calendly.com/eurointermeds')

/**
 * The Produse catalog data source — a published Google Sheet / Excel exported as
 * CSV (File → Share → Publish to web → CSV) or a JSON endpoint. Empty by default:
 * until the owner sets PUBLIC_PRODUCTS_URL the catalog renders the bundled sample
 * fallback (see src/lib/products.ts). Never hardcode the real URL here.
 */
export const productsUrl: string = str('PUBLIC_PRODUCTS_URL', '')

/**
 * Ecosystem deep-links — external URLs, env-overridable (Hard Rule #1). Angrosist
 * links BACK to the Euro-Intermed hub and across to the sibling verticals.
 */
export const verticalUrls = {
  hub: str('PUBLIC_URL_EURO_INTERMED', 'https://euro-intermed.ro'),
  palletclearance: str('PUBLIC_URL_PALLETCLEARANCE', 'https://palletclearance.com'),
  readymeal: str('PUBLIC_URL_READYMEAL', 'https://ready-meal.com'),
  skalyou: str('PUBLIC_URL_SKALYOU', 'https://skalyou.com'),
}

/** Build a wa.me deep link with a prefilled message. */
export function waLink(text?: string): string {
  const base = `https://wa.me/${whatsappNumber}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

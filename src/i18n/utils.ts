/**
 * Tiny typed i18n helper. RO is the default locale (served from `/`), EN is
 * mirrored under `/en/`. There is no runtime framework — pages import the
 * dictionary for their locale and pass it to components.
 */
import { ui, type Locale } from './ui'

export const locales: Locale[] = ['ro', 'en']
export const defaultLocale: Locale = 'ro'

/** Language attribute / OpenGraph locale codes. */
export const htmlLang: Record<Locale, string> = { ro: 'ro-RO', en: 'en' }
export const ogLocale: Record<Locale, string> = { ro: 'ro_RO', en: 'en_US' }

/** Dictionary accessor for a locale. */
export function t(locale: Locale) {
  return ui[locale]
}

/**
 * Prefix a root-relative path with the locale segment.
 * ro → "/contact", en → "/en/contact". Root "/" → "/" or "/en/".
 */
export function localizePath(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (locale === defaultLocale) return clean
  if (clean === '/') return '/en/'
  return `/en${clean}`
}

/**
 * Given the CURRENT pathname, return the equivalent path in the OTHER locale.
 * Used by the language toggle so it stays on the same page.
 */
export function switchLocalePath(pathname: string, to: Locale): string {
  // Normalise: strip a leading /en prefix to get the "root" path.
  let rootPath = pathname
  if (rootPath === '/en' || rootPath === '/en/') {
    rootPath = '/'
  } else if (rootPath.startsWith('/en/')) {
    rootPath = rootPath.slice(3) // remove "/en"
  }
  return localizePath(rootPath, to)
}

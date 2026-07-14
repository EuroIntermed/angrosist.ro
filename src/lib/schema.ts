/**
 * Reusable JSON-LD (schema.org) builders shared by BaseLayout and any page that
 * needs richer structured data. Pure functions — no I/O, no env reads here; the
 * caller passes already-resolved absolute URLs (built from the env-driven
 * siteUrl, Hard Rule #1). Output is plain objects; the caller serialises with
 * JSON.stringify into a <script type="application/ld+json">.
 *
 * Kept intentionally small and valid: every node passes the schema.org /
 * Google Rich Results validators.
 */

export interface FaqItem {
  q: string
  a: string
}

export interface Crumb {
  /** Localized breadcrumb label. */
  name: string
  /** Absolute URL for this crumb. */
  url: string
}

/**
 * FAQPage — one Question per FAQ item, each with an acceptedAnswer. Answers are
 * emitted as plain text (the FAQ copy is plain prose). Returns null when there
 * are no items so the caller can skip emitting an empty node.
 */
export function faqSchema(items: FaqItem[]) {
  if (!items || items.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.a,
      },
    })),
  }
}

/**
 * BreadcrumbList — ordered trail with 1-based positions and absolute item URLs.
 * Returns null for an empty trail.
 */
export function breadcrumbSchema(crumbs: Crumb[]) {
  if (!crumbs || crumbs.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  }
}

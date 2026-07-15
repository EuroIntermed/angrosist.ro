// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'

// Site URL comes from env (Hard Rule #1 — no hardcoded URLs). Read from
// process.env at build time (Vercel runs the build in Node). SITE_URL is the
// primary name; PUBLIC_SITE_URL is accepted as an alias. The literal fallback is
// used only to keep sitemap / canonical / hreflang tags well-formed when the env
// var is absent at build time.
const SITE_URL =
  process.env.SITE_URL ??
  process.env.PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://angrosist.ro')

// Per-language canonical origins for the sitemap — same env names + defaults as
// src/lib/config.ts (Hard Rule #1). EN (/en/*) pages consolidate to the English
// domain, RO (root) pages to the Romanian domain.
const CANON_RO = (process.env.PUBLIC_CANONICAL_RO || 'https://www.angrosist.ro').replace(/\/+$/, '')
const CANON_EN = (process.env.PUBLIC_CANONICAL_EN || 'https://www.angrosist.ro').replace(/\/+$/, '')

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  // RO is the default locale served from the root; EN is mirrored under /en/.
  i18n: {
    defaultLocale: 'ro',
    locales: ['ro', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'ro',
        locales: { ro: 'ro-RO', en: 'en' },
      },
      // Rewrite each entry's origin by page language: /en/* → EN canonical origin,
      // everything else → RO canonical origin (so the sitemap agrees with the
      // per-language <link rel="canonical"> emitted by BaseLayout).
      serialize(item) {
        const u = new URL(item.url)
        const isEn = u.pathname === '/en' || u.pathname.startsWith('/en/')
        item.url = (isEn ? CANON_EN : CANON_RO) + u.pathname
        return item
      },
    }),
  ],
  build: {
    // Emit /produse/index.html so the `cleanUrls` Vercel behaviour keeps working.
    format: 'directory',
  },
})

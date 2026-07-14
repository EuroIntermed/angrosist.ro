/**
 * robots.txt — generated at build so the `Sitemap:` directive is an ABSOLUTE
 * URL built from the env-driven site origin (Hard Rule #1 — no hardcoded host).
 * Static output: Astro prerenders this to /robots.txt.
 */
import type { APIRoute } from 'astro'
import { siteUrl } from '../lib/config'

export const GET: APIRoute = () => {
  const sitemap = new URL('/sitemap-index.xml', siteUrl).href
  const body = `User-agent: *
Allow: /

Sitemap: ${sitemap}
`
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

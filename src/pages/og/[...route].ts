/**
 * Build-time Open Graph image route.
 *
 * astro-og-canvas renders one 1200x630 PNG per entry in `ogCards`, emitted to
 * `dist/og/<slug>.png` during `astro build` (static output — no runtime, no
 * network: the DM Sans TTF is loaded from disk). BaseLayout references these via
 * an absolute URL built from the env-driven `siteUrl`.
 */
import { OGImageRoute } from 'astro-og-canvas'
import { ogCards, ogTemplate } from '../../lib/og'

export const { getStaticPaths, GET } = await OGImageRoute({
  // `pages` maps slug -> card; the endpoint is keyed by the [...route] param.
  pages: ogCards,
  getImageOptions: (_slug, card) => ({
    title: card.title,
    description: card.description,
    bgGradient: [ogTemplate.GROUND_TOP, ogTemplate.GROUND_BOTTOM],
    border: { color: ogTemplate.ACCENT, width: 24, side: 'inline-start' },
    padding: 90,
    font: {
      title: {
        color: ogTemplate.INK,
        size: 84,
        weight: 'Bold',
        lineHeight: 1.05,
        families: ['DM Sans'],
      },
      description: {
        color: ogTemplate.MUTED,
        size: 40,
        weight: 'Medium',
        lineHeight: 1.35,
        families: ['DM Sans'],
      },
    },
    fonts: [ogTemplate.FONT_PATH],
    format: 'PNG',
  }),
})

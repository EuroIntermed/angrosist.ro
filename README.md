# www.angrosist

Marketing site for **Angrosist.ro** — the **B2B sourcing** vertical of the Euro
Intermed ecosystem (raw materials, bulk products, FMCG, recurring supply). Built
on the **shared Euro-Intermed design system**, themed teal via a single
`data-vertical="angrosist"` attribute, plus a live **Produse catalog** driven by a
Google Sheet/Excel and a device-aware **Comandă** flow.

## Stack

- **[Astro](https://astro.build)** (static output) + **TypeScript**
- **@astrojs/mdx** — legal pages authored in MDX
- **@astrojs/sitemap** — `sitemap-index.xml`
- **@fontsource-variable/dm-sans** — self-hosted variable font (no Google Fonts CDN, GDPR)
- Deployed on **Vercel** (static; `main` = prod, `staging` = staging)

## Commands

```bash
npm install       # install deps (commit package-lock.json — Vercel uses it)
npm run dev       # local dev server
npm run build     # astro build → ./dist
npm run preview   # preview the production build
npm run check     # astro check (type + template diagnostics)
```

## Project structure

```
src/
  components/     # BaseLayout, Nav, Hero, HeroPanel, Section, Card, Button, FAQ,
                  # Footer, CookieBanner, LangToggle, ThemeToggle, Analytics,
                  # Widget, Home, HowItWorks, ContactPage, Catalog
  layouts/        # LegalLayout (for the MDX legal pages)
  i18n/           # ui.ts (RO/EN dictionary), utils.ts (locale routing helpers)
  lib/            # config.ts — the ONLY place env is read (Hard Rule #1)
                  # products.ts — catalog schema, CSV/JSON parser, sample fallback
  scripts/        # site.ts (scroll-reveal + GA), catalog.ts (catalog runtime),
                  # order.ts (device-aware Comandă flow)
  styles/         # global.css — shared design tokens (light/dark) + animations
  pages/          # ro at root, en mirrored under /en/
public/           # favicon.svg, robots.txt (copied verbatim into dist/)
astro.config.mjs  # site URL from env, i18n (ro default, en under /en/), sitemap, mdx
vercel.json       # framework/build/output + security headers + legacy redirects
```

## i18n

RO is the default locale (root paths); EN is mirrored under `/en/`. Copy lives in a
single typed dictionary (`src/i18n/ui.ts`); every page ships both locales with
`hreflang` alternates. `LangToggle` links to the equivalent page in the other locale.

## Theme — shared design system, teal accent

The **neutral / type / spacing / shadow / animation** layer in `src/styles/global.css`
is the exact system shared with the Euro-Intermed hub. Angrosist selects the **teal**
accent by setting **one attribute** on `<html>` (in `BaseLayout.astro`):

```html
<html data-vertical="angrosist">
```

That flips every `--ei-accent*` / `--ei-gold*` token to the teal-blue (`#0E7C86`,
dark `#2BB0BD`) + azure (`#2E7DB5`) pairing — WCAG-AA verified in light **and** dark
(the shared tokens already pass). No token surgery, no bespoke component CSS.

## Contact: WhatsApp-only (no forms)

There is **no HTML contact form and no form-POST endpoint** anywhere on the site
(design-system standard for all three ecosystem sites). The two intake channels are
the **AI chat widget** and **WhatsApp** — `/contact` shows an intent chooser that
pre-fills a `wa.me` message per B2B route, with email + phone as secondary options.

## Produse catalog (runtime, Google-Sheet driven)

`/produse` renders a prerendered shell (intro, category chips, a JSON-LD `ItemList`
and a sample product skeleton for SEO + no-JS) that the client runtime
(`src/scripts/catalog.ts`) upgrades: it **fetches the live sheet at runtime** from
`PUBLIC_PRODUCTS_URL`, parses it, groups by category, renders responsive cards with a
category filter, and handles **loading / empty / error** states. Without JS (or before
hydration) each sample card's "Comandă" is a real `wa.me` link; with JS it becomes the
device-aware chooser.

### Sheet schema

One product per row; a header row is required. Column names are matched
case- and diacritic-insensitively (`Categorie`, `categorie`, `CATEGORIE` all work):

| Column | Type | Notes |
|---|---|---|
| `categorie` | string | Grouping bucket, e.g. `Condimente, ierburi & mixuri` |
| `produs` | string | Product name |
| `descriere` | string | Short description |
| `unitate` | string | Sales unit, e.g. `kg`, `sac 25 kg`, `bax` |
| `pret` | string | **Optional** indicative price (free text, e.g. `12 RON`) |
| `imagine` | string | Image URL — a Google Drive share link is auto-converted to a `thumbnail` URL |
| `activ` | bool-ish | `true` / `da` / `1` / `yes` / `x` → shown; anything else → hidden |
| `ordine` | number | Sort order within its category (ascending) |

Only `activ` rows are shown; rows are grouped by `categorie` and sorted by `ordine`.
A **JSON** source is also accepted — an array of objects (or `{ "products": [...] }`)
using the same keys.

### Setting `PUBLIC_PRODUCTS_URL`

Set this env var (per Vercel project) to the catalog data source. Two options:

1. **Published CSV (simplest).** In Google Sheets: **File → Share → Publish to web →**
   choose the sheet, format **Comma-separated values (.csv)**, publish, and copy the
   generated URL (`https://docs.google.com/spreadsheets/d/e/…/pub?gid=0&single=true&output=csv`).
2. **JSON endpoint.** Any URL returning a JSON array with the columns above (e.g. a
   Sheets API export or an Apps Script web app).

The fetch is cached by the browser. If `PUBLIC_PRODUCTS_URL` is **unset**, the site
renders the bundled **sample fallback** (`src/lib/products.ts` → `sampleProducts`) with
a "demo catalog" note, so the page looks complete before the owner populates the sheet.
If the URL is set but the fetch fails, the page shows an error state with a **retry**.

> The real sheet URL is **never hardcoded** — it comes from `PUBLIC_PRODUCTS_URL` only.

## Comandă flow (device-aware)

Each product card's **"Comandă"** button builds a prefilled message (product, category,
a source tag) and continues in the agent, routed by device (`src/scripts/order.ts`):

- **Desktop →** opens the AI chat widget automatically, prefilled, via
  `window.AngrosistChat.open({ message, vertical: 'angrosist', intent: 'buy' })`
  (**feature-detected** — falls back to WhatsApp if the widget API is unavailable).
- **Mobile →** an accessible chooser sheet asks **WhatsApp** (`wa.me/<number>?text=…`)
  or **widget**. Focus-trapped, Escape/backdrop to close, restores focus.

Device detection is pointer/hover + width based (coarse-pointer or no-hover **and**
narrow ⇒ mobile), keyboard-accessible and reduced-motion-safe.

## Configuration (env only — no hardcoded URLs/IDs)

All external URLs / IDs / flags are read from the environment at build time in
`src/lib/config.ts` (and `astro.config.mjs` for the site URL):

| Var | Purpose | Default |
|---|---|---|
| `WIDGET_ENABLED` | `"false"` strips the chat widget | `true` |
| `WIDGET_BASE_URL` | origin serving `widget.js` | `https://dash.euro-intermed.com` |
| `GA_MEASUREMENT_ID` | GA4 id; empty → no GA snippet + no cookie banner | *(unset)* |
| `SITE_URL` / `PUBLIC_SITE_URL` | canonical origin | `https://angrosist.ro` |
| `PUBLIC_WHATSAPP_NUMBER` | wa.me number (digits) | `40745799995` |
| `PUBLIC_CONTACT_EMAIL` / `PUBLIC_CONTACT_PHONE` / `PUBLIC_CALENDLY_URL` | contact details | *(company defaults)* |
| `PUBLIC_PRODUCTS_URL` | catalog data source (published CSV or JSON) | *(unset → sample fallback)* |
| `PUBLIC_URL_EURO_INTERMED` | hub deep-link | `https://euro-intermed.ro` |
| `PUBLIC_URL_PALLETCLEARANCE` | PalletClearance deep-link | `https://palletclearance.com` |
| `PUBLIC_URL_SKALYOU` | SkalYou deep-link | `https://skalyou.com` |

GA4 uses **Consent Mode v2** — analytics storage stays `denied` until the visitor
accepts in the cookie banner (choice persisted in `localStorage['ei-analytics-consent']`).

## Accessibility & motion

WCAG AA: labels, visible focus, keyboard nav, AA+ contrast in light and dark. All
animation is CSS-first and wrapped in a `prefers-reduced-motion: reduce` off-switch.

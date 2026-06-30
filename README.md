# Angrosist.ro V1

Standalone Romanian-first B2B RFQ/sourcing website for Angrosist.ro.

## Structure

- `index.html` - static landing page and route-aware RFQ form.
- `css/styles.css` - scoped `ag-` visual system.
- `js/main.js` - route selection, WhatsApp updates, FAQ, mobile CTA.
- `vercel.json` - static deploy config (this folder is its own Vercel project).
- `robots.txt` - crawl defaults.

The AI chat widget (`#ai-widget-container`) is the single intake channel. The
old PHP `form-handler.php` email form has been removed — Vercel does not run PHP,
and lead capture now goes through the widget. WhatsApp / email / Calendly links
remain as passive contact fallbacks.

## Contact Defaults

V1 uses the shared Euro Intermed contact details until Angrosist-specific contact data is confirmed:

- Email: `eurointermeds@gmail.com`
- Phone / WhatsApp: `+40765934455`
- WhatsApp URL: `https://wa.me/40765934455`
- Calendly: `https://calendly.com/eurointermeds`

## Form Behavior

The first form question maps Angrosist intents to canonical ecosystem routes:

- `product-rfq` -> `sourcing-flow`
- `recurring-supply` -> `sourcing-flow`
- `product-list` -> `sourcing-flow`
- `standard-supplier` -> `seller-flow`
- `clearance-redirect` -> `seller-flow`, target `palletclearance`
- `other-b2b` -> `other-b2b-flow`

The qualification flow avoids high-friction company identifiers, document transfer, price negotiation details, stock media, and full commercial terms at first contact.

## Deploy & Widget

Static site — deploy this folder directly as its own Vercel project (no build
step; `vercel.json` sets clean URLs + security headers).

The AI widget is embedded before `</body>`:

```html
<script src="https://staging.euro-intermed.com/widget.js" defer></script>
<script>
  window.AngrosistChat.init({ containerId: "ai-widget-container",
    vertical: "angrosist", intent: "buy", lang: "ro",
    privacyUrl: "/privacy.html" });
</script>
```

`widget.js` is served by the deployed frontend project (the dashboard build now
bundles it). The backend API URL is **baked into `widget.js` at build time** from
the frontend's `VITE_API_URL` — the site does not pass `apiUrl`. To repoint the
backend, change `VITE_API_URL` in the frontend deploy and rebuild `widget.js`;
all embeds follow automatically. No URL is hardcoded in the sites.

## Production Blockers

- Final Angrosist email/phone/WhatsApp if different from Euro Intermed.
- Final privacy and terms URLs.
- Final decision on whether `palletclearance.eu` is live before public linking.

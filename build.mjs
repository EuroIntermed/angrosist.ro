// build.mjs — inject the chat-widget embed AND Google Analytics 4 at DEPLOY time
// from Vercel env vars.
//
// This is a static site, so env vars can't be read in the browser at runtime;
// instead we template index.html here (Vercel runs `node build.mjs` as the build
// command) and serve the result from ./dist.
//
// Env vars (set per Vercel project — staging vs prod):
//   WIDGET_ENABLED     "true" (default) embeds the widget; "false" removes it.
//   WIDGET_BASE_URL    origin that serves widget.js
//                      (default "https://dash.euro-intermed.com";
//                       set "https://dash.staging.euro-intermed.com" on staging).
//   GA_MEASUREMENT_ID  GA4 Measurement ID, e.g. "G-XXXXXXX". Empty/unset (the
//                      default for local/dev) → analytics is stripped out and the
//                      page ships with no GA snippet and no cookie banner.
//
// The widget block in index.html is delimited by <!-- WIDGET:START --> /
// <!-- WIDGET:END --> and uses the __WIDGET_BASE_URL__ placeholder for the
// script origin. The analytics block is delimited by <!-- GA:START --> /
// <!-- GA:END --> and the real gtag snippet (below) uses the
// __GA_MEASUREMENT_ID__ placeholder — so neither a widget URL nor a measurement
// ID is ever hardcoded in a committed file.
import { cpSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { relative, sep } from 'node:path'

const OUT = 'dist'
const enabled =
  (process.env.WIDGET_ENABLED ?? 'true').trim().toLowerCase() !== 'false'
const baseUrl = (process.env.WIDGET_BASE_URL ?? 'https://dash.euro-intermed.com')
  .trim()
  .replace(/\/+$/, '')
const gaId = (process.env.GA_MEASUREMENT_ID ?? '').trim()

// GA4 snippet injected only when GA_MEASUREMENT_ID is set. Google Consent Mode v2
// defaults analytics_storage to 'denied' (no analytics cookies before consent);
// a lightweight vanilla cookie banner flips it to 'granted' on Accept and
// persists the choice in localStorage. __GA_MEASUREMENT_ID__ is substituted with
// the env value at build time, so no real ID is committed.
const GA_SNIPPET = `<!-- Google Consent Mode v2 + GA4 — injected at build time from GA_MEASUREMENT_ID. -->
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      // Consent Mode v2: deny analytics storage until the visitor opts in (GDPR).
      gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500
      });
      // Restore a prior "granted" choice so returning visitors aren't re-prompted.
      try {
        if (localStorage.getItem('ei-analytics-consent') === 'granted') {
          gtag('consent', 'update', { analytics_storage: 'granted' });
        }
      } catch (e) {}
      gtag('js', new Date());
      gtag('config', '__GA_MEASUREMENT_ID__', { anonymize_ip: true });
    </script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=__GA_MEASUREMENT_ID__"></script>
    <script>
      // Lightweight cookie-consent banner (vanilla JS/CSS, no framework). Shown
      // only until the visitor chooses; the choice persists in localStorage.
      (function () {
        var KEY = 'ei-analytics-consent';
        var choice = null;
        try { choice = localStorage.getItem(KEY); } catch (e) {}
        if (choice === 'granted' || choice === 'denied') return;
        var en = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
        var COPY = en
          ? { msg: 'We use analytics cookies to understand traffic. They stay off until you agree.', accept: 'Accept', reject: 'Decline' }
          : { msg: 'Folosim cookie-uri de analiza pentru a intelege traficul. Nu se activeaza fara acordul tau.', accept: 'Accept', reject: 'Refuz' };
        function build() {
          if (document.getElementById('ei-consent-banner')) return;
          var bar = document.createElement('div');
          bar.id = 'ei-consent-banner';
          bar.setAttribute('role', 'dialog');
          bar.setAttribute('aria-live', 'polite');
          bar.setAttribute('aria-label', en ? 'Cookie consent' : 'Consimtamant cookie');
          bar.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:640px;margin:0 auto;background:#0d1a12;color:#e8f0ea;border:1px solid rgba(215,184,106,0.35);border-radius:12px;padding:16px 18px;box-shadow:0 12px 40px rgba(0,0,0,0.45);font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;';
          var txt = document.createElement('span');
          txt.style.cssText = 'flex:1 1 260px;min-width:220px;';
          txt.textContent = COPY.msg;
          var actions = document.createElement('div');
          actions.style.cssText = 'display:flex;gap:8px;flex:0 0 auto;';
          var reject = document.createElement('button');
          reject.type = 'button';
          reject.textContent = COPY.reject;
          reject.style.cssText = 'cursor:pointer;border:1px solid rgba(232,240,234,0.4);background:transparent;color:#e8f0ea;border-radius:8px;padding:8px 14px;font:inherit;';
          var accept = document.createElement('button');
          accept.type = 'button';
          accept.textContent = COPY.accept;
          accept.style.cssText = 'cursor:pointer;border:none;background:#d7b86a;color:#0d1a12;border-radius:8px;padding:8px 16px;font:inherit;font-weight:600;';
          function close() { if (bar.parentNode) bar.parentNode.removeChild(bar); }
          accept.addEventListener('click', function () {
            try { localStorage.setItem(KEY, 'granted'); } catch (e) {}
            gtag('consent', 'update', { analytics_storage: 'granted' });
            close();
          });
          reject.addEventListener('click', function () {
            try { localStorage.setItem(KEY, 'denied'); } catch (e) {}
            close();
          });
          actions.appendChild(reject);
          actions.appendChild(accept);
          bar.appendChild(txt);
          bar.appendChild(actions);
          document.body.appendChild(bar);
        }
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', build);
        } else {
          build();
        }
      })();
    </script>`

// Copy the static site into ./dist, excluding VCS/tooling and the output dir.
const SKIP = new Set([
  OUT,
  '.git',
  '.vercel',
  'node_modules',
  'build.mjs',
  'vercel.json',
  'README.md',
])
rmSync(OUT, { recursive: true, force: true })
cpSync('.', OUT, {
  recursive: true,
  filter: (src) => {
    const rel = relative('.', src)
    if (rel === '') return true
    const parts = rel.split(sep)
    return !SKIP.has(parts[0]) && !parts.some((p) => p === '.DS_Store')
  },
})

// Template the widget block in the copied index.html.
const FILE = `${OUT}/index.html`
let html = readFileSync(FILE, 'utf8')
const block = /<!-- WIDGET:START[\s\S]*?<!-- WIDGET:END -->/

if (!block.test(html)) {
  console.warn('build.mjs: no WIDGET:START/END markers in index.html — served as-is')
} else if (!enabled) {
  html = html.replace(block, '<!-- chat widget disabled (WIDGET_ENABLED=false) -->')
  console.log('build.mjs: widget DISABLED')
} else {
  html = html.replace(/__WIDGET_BASE_URL__/g, baseUrl)
  console.log(`build.mjs: widget ENABLED (base=${baseUrl})`)
}

// Template the analytics (GA4) block in the copied index.html.
const gaBlock = /<!-- GA:START[\s\S]*?<!-- GA:END -->/
if (!gaBlock.test(html)) {
  console.warn('build.mjs: no GA:START/END markers in index.html — analytics not templated')
} else if (!gaId) {
  html = html.replace(gaBlock, '<!-- analytics disabled (no GA_MEASUREMENT_ID) -->')
  console.log('build.mjs: analytics DISABLED (no GA_MEASUREMENT_ID)')
} else {
  const snippet = GA_SNIPPET.replace(/__GA_MEASUREMENT_ID__/g, gaId)
  html = html.replace(gaBlock, () => snippet)
  console.log(`build.mjs: analytics ENABLED (GA4 ${gaId})`)
}

writeFileSync(FILE, html)

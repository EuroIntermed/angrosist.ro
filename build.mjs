// build.mjs — inject the chat-widget embed at DEPLOY time from Vercel env vars.
//
// This is a static site, so env vars can't be read in the browser at runtime;
// instead we template index.html here (Vercel runs `node build.mjs` as the build
// command) and serve the result from ./dist.
//
// Env vars (set per Vercel project — staging vs prod):
//   WIDGET_ENABLED   "true" (default) embeds the widget; "false" removes it.
//   WIDGET_BASE_URL  origin that serves widget.js
//                    (default "https://dash.euro-intermed.com";
//                     set "https://dash.staging.euro-intermed.com" on staging).
//
// The widget block in index.html is delimited by <!-- WIDGET:START --> /
// <!-- WIDGET:END --> and uses the __WIDGET_BASE_URL__ placeholder for the
// script origin, so nothing about the widget URL is hardcoded.
import { cpSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { relative, sep } from 'node:path'

const OUT = 'dist'
const enabled =
  (process.env.WIDGET_ENABLED ?? 'true').trim().toLowerCase() !== 'false'
const baseUrl = (process.env.WIDGET_BASE_URL ?? 'https://dash.euro-intermed.com')
  .trim()
  .replace(/\/+$/, '')

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
writeFileSync(FILE, html)

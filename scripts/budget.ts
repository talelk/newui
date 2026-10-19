/**
 * Per-route JavaScript budget.
 *
 * Lighthouse measures one URL's *score*; this measures the thing the score is
 * downstream of — how much JavaScript a route actually downloads — for every
 * route, so "the site is small" stays a number rather than a claim.
 *
 * The measurement is deliberately the boring one: load the built site in a real
 * browser, record every `/assets/*.js` the browser requested, read those files
 * back off disk and gzip their sum. That counts shared chunks exactly once, the
 * way the network does, and it does not depend on whether the preview server
 * compresses (it does not) — so the numbers are gzip bytes, comparable to the
 * budgets in `scripts/size.ts`.
 *
 * Needs `pnpm build:playground` first; it starts its own `vite preview`.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'
import { chromium } from 'playwright'

import { startPreview } from './preview-server'

const PORT = 4181
const BASE = `http://localhost:${PORT}`
const ASSETS = path.join(process.cwd(), 'apps/playground/dist/assets')

interface RouteBudget {
  /** Path, as the browser requests it. */
  route: string
  /** gzip budget in kB. */
  budget: number
  unless?: string
  viewport?: { width: number; height: number }
}

/**
 * The budgets.
 *
 * `home` is the one that matters most: it is what a stranger pays before reading
 * a word. The old playground mounted every section on `/` and shipped 219 kB
 * gzip; the shell plus the router is now ~48.
 *
 * `atoms` is deliberately the loose one. It is the exhaustive variant matrix —
 * every atom, every axis, on a single page — so it loads the whole library by
 * definition, and splitting the demos into per-component modules re-cut the
 * shared chunks under it (+14 kB: it now fetches the eight chunks it used to
 * find already in the entry). It is the *reference* page, not a page anyone
 * lands on cold; `/components/<name>` is the route a reader arrives at, and that
 * is 66 kB. The `pnpm size` budget in `scripts/size.ts` is what protects a real
 * app's cost.
 *
 * Note on the entry chunk: every dynamic import in the app adds an entry to
 * Vite's preload map, which lives in the entry. 44 demos + 56 API slices is
 * ~3 kB gzip that every route pays. Worth knowing before adding a hundred more
 * lazy modules; not worth a build-plugin dance at this size.
 */
const ROUTES: RouteBudget[] = [
  {
    route: '/examples/discussions/fullscreen',
    budget: 100,
    viewport: { width: 390, height: 844 },
    unless: 'mobile composition; retained mobile budget',
  },
  ...[
    ['tasks', 260],
    ['mail', 210],
    ['files', 230],
    ['deals', 240],
    ['tickets', 230],
    ['accounting', 390],
    ['compose', 380],
    ['discussions', 200],
    ['analytics', 390],
    ['authentication', 200],
    ['cards', 210],
    ['settings', 160],
  ].map(([slug, budget]) => ({
    route: `/examples/${slug}`,
    budget: Number(budget),
    unless: 'responsive preview with documentation chrome',
  })),
  {
    route: '/architecture',
    budget: 80,
    unless: 'prose page; the ladder is data, not components',
  },
  {
    route: '/layouts',
    budget: 100,
    unless: 'the layout index, read from the registry',
  },
  {
    route: '/layouts/app-layout',
    budget: 240,
    unless: 'the frame demo: shell, sidebar, tooltips',
  },
  {
    route: '/layouts/pane-layout',
    budget: 110,
    unless: 'the split demo: two panes, badges and a list',
  },
  { route: '/charts', budget: 90 },
  { route: '/editors', budget: 90 },
  // 280.0 measured: the shell now carries the ladder's counts, and a budget
  // with no headroom turns the next honest shell addition into a red gate.
  { route: '/charts/bar-chart', budget: 285 },
  { route: '/editors/code-editor', budget: 280 },
  { route: '/blocks/page-toolbar', budget: 190 },
  {
    route: '/examples/patterns',
    budget: 80,
    unless: 'lightweight reference example directory',
  },
  {
    route: '/examples/patterns/carousel',
    budget: 120,
    unless: 'isolated carousel composition',
  },
  {
    route: '/examples/patterns/command',
    budget: 140,
    unless: 'Zag command search and dialog',
  },
  {
    route: '/examples/patterns/layout',
    budget: 100,
    unless: 'native resizable layouts',
  },
  {
    route: '/examples/patterns/navigation',
    budget: 150,
    unless: 'menus and responsive editors',
  },
  {
    route: '/examples/patterns/verification',
    budget: 100,
    unless: 'validated verification example',
  },
  {
    route: '/examples/patterns/analytics-widgets',
    budget: 110,
    unless: 'analytical status and list compositions',
  },
  {
    route: '/examples/accounting/fullscreen',
    budget: 340,
    unless: 'interactive accounting workspace in the shared rail frame',
  },

  {
    route: '/examples/files/fullscreen',
    budget: 170,
    unless: 'interactive files workspace',
  },

  {
    route: '/examples/tickets/fullscreen',
    budget: 170,
    unless: 'interactive tickets workspace',
  },

  {
    route: '/examples/deals/fullscreen',
    budget: 190,
    unless: 'interactive deals workspace in the shared rail frame',
  },

  {
    route: '/examples/mail/fullscreen',
    budget: 150,
    unless: 'interactive inbox and local composer',
  },

  {
    route: '/examples/compose/fullscreen',
    budget: 320,
    unless: 'rich-text editor and publication workflow',
  },

  {
    route: '/examples/settings/fullscreen',
    budget: 100,
    unless: 'isolated settings dialog composition',
  },
  {
    route: '/examples/cards/fullscreen',
    budget: 150,
    unless: 'eight interactive business cards',
  },
  {
    route: '/examples/authentication/fullscreen',
    budget: 140,
    unless: 'validated authentication flow',
  },
  {
    route: '/examples/tasks/fullscreen',
    budget: 200,
    unless: 'TanStack task workspace with typed table, forms and virtual feed',
  },

  {
    route: '/examples/analytics/fullscreen',
    budget: 345,
    unless: 'full analytics workspace with SVG charts in the shared rail frame',
  },
  {
    route: '/',
    budget: 60,
    unless: 'the shell, the router and the toast host',
  },
  { route: '/docs', budget: 62, unless: 'prose only' },
  { route: '/foundations', budget: 88, unless: 'token swatches' },
  {
    route: '/components',
    budget: 90,
    unless: 'the index: the registry plus its own sidebar',
  },
  {
    route: '/components/pagination',
    budget: 110,
    unless: 'one component: demo + its api slice + its contract',
  },
  {
    route: '/components/date-picker',
    budget: 180,
    unless: 'the heaviest single component (its date library)',
  },
  { route: '/blocks', budget: 170, unless: 'every block on one page' },
  {
    route: '/components/button',
    budget: 220,
    unless: 'the exhaustive matrix — ~45 components on one page',
  },
  { route: '/components/toast', budget: 120, unless: 'feedback surfaces' },
  { route: '/examples', budget: 80, unless: 'the examples index' },
  {
    route: '/spec',
    budget: 260,
    unless: 'the determinism harness renders ~45 components on purpose',
  },
  {
    route: '/examples/discussions/fullscreen',
    budget: 140,
    unless: 'a full desktop app screen',
  },
]

const preview = startPreview(PORT)

try {
  await preview.ready
  const browser = await chromium.launch({ channel: 'chrome' })
  const failures: string[] = []

  console.warn(
    '\nRoute JavaScript budget (gzip, every chunk the route fetches)\n',
  )

  for (const { route, budget, unless, viewport } of ROUTES) {
    const page = await browser.newPage({
      viewport: viewport ?? { width: 1440, height: 900 },
    })
    const files = new Set<string>()

    page.on('response', (response) => {
      const url = new URL(response.url())
      if (!url.pathname.startsWith('/assets/')) return
      if (!url.pathname.endsWith('.js')) return
      files.add(path.basename(url.pathname))
    })

    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60_000 })
    // A route may fetch a chunk after first paint (a lazily mounted overlay);
    // give in-flight work a beat to land so the count is not racy.
    await page.waitForTimeout(600)
    await page.close()

    let gzipBytes = 0
    for (const file of files) {
      gzipBytes += gzipSync(readFileSync(path.join(ASSETS, file))).length
    }
    const kb = gzipBytes / 1024
    const ok = kb <= budget
    if (!ok) {
      failures.push(
        `${route}: ${kb.toFixed(1)} kB exceeds ${budget} kB (${files.size} chunks)`,
      )
    }
    console.warn(
      `${ok ? 'ok  ' : 'FAIL'}  ${route.padEnd(34)} ${kb
        .toFixed(1)
        .padStart(
          6,
        )} kB  (budget ${String(budget).padEnd(3)} · ${files.size} chunks${
        unless ? ` · ${unless}` : ''
      })`,
    )
  }

  await browser.close()

  if (failures.length) {
    console.error('\nRoute budget failures:')
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exitCode = 1
  } else {
    console.warn('\nEvery route is within budget.\n')
  }
} finally {
  preview.stop()
}

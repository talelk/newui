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

/** The starter is an app, not a route: one dist, one budget, one page. */
const STARTER_PORT = 4182
const STARTER_BASE = `http://localhost:${STARTER_PORT}`
const STARTER_ASSETS = path.join(process.cwd(), 'apps/starter/dist/assets')

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
 * lands on cold; `/atoms/<name>` or `/molecules/<name>` is the route a reader
 * arrives at, and that
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
    route: '/pages/discussions/fullscreen',
    budget: 210,
    viewport: { width: 390, height: 844 },
    unless: 'the responsive AppShell drawer at mobile width',
  },
  ...[
    ['tasks', 260],
    ['mail', 210],
    ['files', 230],
    ['deals', 240],
    ['tickets', 230],
    ['accounting', 390],
    ['compose', 380],
    ['discussions', 215],
    ['analytics', 420],
    ['authentication', 200],
    ['cards', 210],
    ['settings', 160],
  ].map(([slug, budget]) => ({
    route: `/pages/${slug}`,
    budget: Number(budget),
    unless: 'responsive preview with documentation chrome',
  })),
  {
    route: '/architecture',
    budget: 80,
    unless: 'prose page; the ladder is data, not components',
  },
  {
    route: '/kit',
    budget: 90,
    unless: 'prose page: code samples, the file map, no live components',
  },
  {
    route: '/templates',
    budget: 100,
    unless: 'the template index, read from the registry',
  },
  {
    route: '/templates/app-shell',
    budget: 240,
    unless: 'the responsive shell demo: sidebar, drawer and tenant controls',
  },
  {
    route: '/templates/pane-layout',
    budget: 110,
    unless: 'the split demo: two panes, badges and a list',
  },
  {
    route: '/preview/app-shell',
    budget: 160,
    unless: 'the same-origin isolated template preview',
  },
  // 280.0 measured: the shell now carries the ladder's counts, and a budget
  // with no headroom turns the next honest shell addition into a red gate.
  // Re-raised to 290 when the registry grew by four more molecules.
  { route: '/organisms/bar-chart', budget: 290 },
  // 280.0 measured: the shell's registry counts grew with the new atoms and
  // molecules — same headroom rule as bar-chart above.
  { route: '/organisms/code-editor', budget: 285 },
  { route: '/organisms/page-toolbar', budget: 190 },
  {
    route: '/kit/recipes',
    budget: 100,
    unless: 'the recipe index and source examples directory',
  },
  { route: '/kit/recipes/forms', budget: 120 },
  { route: '/kit/recipes/overlays', budget: 130 },
  {
    route: '/kit/recipes/carousel',
    budget: 120,
    unless: 'isolated carousel composition',
  },
  {
    route: '/kit/recipes/command',
    budget: 140,
    unless: 'Zag command search and dialog',
  },
  {
    route: '/kit/recipes/layout',
    budget: 100,
    unless: 'native resizable layouts',
  },
  {
    route: '/kit/recipes/navigation',
    budget: 150,
    unless: 'menus and responsive editors',
  },
  {
    route: '/kit/recipes/verification',
    budget: 100,
    unless: 'validated verification example',
  },
  {
    route: '/kit/recipes/analytics-widgets',
    budget: 110,
    unless: 'analytical status and list compositions',
  },
  {
    route: '/pages/accounting/fullscreen',
    budget: 380,
    unless: 'interactive accounting workspace in the shared AppShell frame',
  },

  // The atomic package split and integrated AppShell add the real shared
  // navigation to each full-screen app. The application recipes now also carry
  // the shared DataTable/DataState/SelectionBar surfaces; these ceilings track
  // current browser measurements with room for normal route-level changes.
  {
    route: '/pages/files/fullscreen',
    budget: 200,
    unless: 'interactive files workspace',
  },

  {
    route: '/pages/tickets/fullscreen',
    budget: 195,
    unless: 'interactive tickets workspace',
  },

  {
    route: '/pages/deals/fullscreen',
    budget: 220,
    unless: 'interactive deals workspace in the shared AppShell frame',
  },

  {
    route: '/pages/mail/fullscreen',
    budget: 210,
    unless: 'interactive inbox, thread reading and local composer',
  },

  {
    route: '/pages/compose/fullscreen',
    budget: 350,
    unless: 'rich-text editor and publication workflow',
  },

  {
    route: '/pages/settings/fullscreen',
    budget: 160,
    unless: 'workspace settings landing and grouped settings dialog',
  },
  {
    route: '/pages/cards/fullscreen',
    budget: 150,
    unless: 'eight interactive business cards',
  },
  {
    route: '/pages/authentication/fullscreen',
    budget: 140,
    unless: 'validated authentication flow',
  },
  {
    route: '/pages/tasks/fullscreen',
    budget: 250,
    unless: 'TanStack task workspace with typed table, forms and virtual feed',
  },

  {
    route: '/pages/analytics/fullscreen',
    budget: 420,
    unless:
      'full analytics workspace with SVG charts in the shared AppShell frame',
  },
  {
    route: '/',
    budget: 60,
    unless: 'the shell, the router and the toast host',
  },
  { route: '/docs', budget: 62, unless: 'prose only' },
  { route: '/foundations', budget: 88, unless: 'token swatches' },
  {
    route: '/atoms',
    budget: 90,
    unless: 'the index: the registry plus its own sidebar',
  },
  {
    route: '/molecules',
    budget: 90,
    unless: 'the largest level index: same registry, more rows',
  },
  {
    route: '/molecules/pagination',
    budget: 110,
    unless: 'one component: demo + its api slice + its contract',
  },
  {
    route: '/molecules/date-picker',
    budget: 180,
    unless: 'the heaviest single component (its date library)',
  },
  {
    route: '/organisms',
    budget: 100,
    unless: 'every organism listed: page regions, chart widgets and editors',
  },
  {
    route: '/atoms/button',
    budget: 220,
    unless: 'the exhaustive matrix — ~45 components on one page',
  },
  { route: '/molecules/toast', budget: 120, unless: 'feedback surfaces' },
  { route: '/pages', budget: 80, unless: 'the examples index' },
  {
    route: '/spec',
    budget: 260,
    unless: 'the determinism harness renders ~45 components on purpose',
  },
  {
    route: '/pages/discussions/fullscreen',
    budget: 210,
    unless: 'a full discussions workspace with thread detail and settings',
  },
]

interface MeasureOptions {
  label: string
  base: string
  assets: string
  routes: RouteBudget[]
}

/** Load each route, record what it fetched, and sum the gzip of those files. */
async function measure(
  browser: import('playwright').Browser,
  options: MeasureOptions,
): Promise<string[]> {
  const { label, base, assets, routes } = options
  const failures: string[] = []
  console.warn(
    `\n${label} JavaScript budget (gzip, every chunk the route fetches)\n`,
  )

  for (const { route, budget, unless, viewport } of routes) {
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

    await page.goto(base + route, { waitUntil: 'networkidle', timeout: 60_000 })
    // A route may fetch a chunk after first paint (a lazily mounted overlay);
    // give in-flight work a beat to land so the count is not racy.
    await page.waitForTimeout(600)
    await page.close()

    let gzipBytes = 0
    for (const file of files) {
      gzipBytes += gzipSync(readFileSync(path.join(assets, file))).length
    }
    const kb = gzipBytes / 1024
    const ok = kb <= budget
    if (!ok) {
      failures.push(
        `${label} ${route}: ${kb.toFixed(1)} kB exceeds ${budget} kB (${files.size} chunks)`,
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
  return failures
}

const preview = startPreview(PORT)
const starterPreview = startPreview(STARTER_PORT, 'apps/starter')

try {
  await preview.ready
  await starterPreview.ready
  const browser = await chromium.launch({ channel: 'chrome' })

  const failures = [
    ...(await measure(browser, {
      label: 'Route',
      base: BASE,
      assets: ASSETS,
      routes: ROUTES,
    })),
    ...(await measure(browser, {
      label: 'Starter',
      base: STARTER_BASE,
      assets: STARTER_ASSETS,
      routes: [
        {
          route: '/',
          // 142.3 measured: the whole app — frame, router, data client, table
          // and form. There is no route splitting to hide behind at this size.
          budget: 170,
          unless: 'the complete starter on one page',
        },
      ],
    })),
  ]

  await browser.close()

  if (failures.length) {
    console.error('\nBudget failures:')
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exitCode = 1
  } else {
    console.warn('\nEvery measured app is within budget.\n')
  }
} finally {
  preview.stop()
  starterPreview.stop()
}

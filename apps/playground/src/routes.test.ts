import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { MASTHEAD, NAV, NAV_ORDER, sectionFor, siblingsFor } from './shell/nav'

/**
 * The site's two structural invariants.
 *
 * Both are read straight off the source rather than imported: `routes.tsx`
 * imports the provider and the toast host, so importing it into a jsdom test
 * drags the component graph in behind it. These are text checks about shape,
 * which is all they need to be — the same technique `tokens.test.ts` uses.
 *
 *  1. **Nav and routes agree, both ways.** A sidebar entry with no route is a
 *     404 one click from home; a route with no nav entry is a page nobody can
 *     find. Both directions have shipped broken in projects this size.
 *  2. **The route table is where pages are declared lazily.** Every
 *     `import('./pages/...')` in `routes.tsx` must sit inside a `page(...)`
 *     call, so a page cannot be pulled into the shell's eager chunk by a stray
 *     top-level import — the mistake that made the old playground's home route
 *     219 kB gzip.
 */
const ROUTES_FILE = readFileSync(
  path.join(process.cwd(), 'apps/playground/src/routes.tsx'),
  'utf8',
)

/** `path="/x"` literals the router actually renders, in file order. */
const jsxPaths = [...ROUTES_FILE.matchAll(/\spath="([^"]+)"/g)].map(
  (match) => match[1] ?? '',
)

/** The exported `ROUTES` table's paths, in order. */
const tablePaths = [...ROUTES_FILE.matchAll(/\{\s*path:\s*'([^']+)'/g)].map(
  (match) => match[1] ?? '',
)

/** Every dynamic page import, with the call it sits in. */
const pageImports = [
  ...ROUTES_FILE.matchAll(/import\('(\.\/pages\/[^']+)'\)/g),
].map((match) => match[1] ?? '')

describe('site structure', () => {
  it('declares every rendered route in the ROUTES table', () => {
    const declared = new Set(tablePaths)
    // `*` is the catch-all: it is not a destination, so it is not in the table.
    const missing = jsxPaths.filter((p) => p !== '*' && !declared.has(p))
    expect(missing).toEqual([])
  })

  it('renders every route it declares', () => {
    const rendered = new Set(jsxPaths)
    const orphans = tablePaths.filter((p) => !rendered.has(p))
    expect(orphans).toEqual([])
  })

  it('every sidebar and masthead entry resolves to a route', () => {
    const declared = new Set(tablePaths)
    const entries = [...MASTHEAD, ...NAV_ORDER]
    const dangling = entries
      .map((item) => item.href.split('?')[0] ?? item.href)
      .filter((href) => !declared.has(href))
    expect(dangling).toEqual([])
  })

  it('every destination route is reachable from the navigation', () => {
    const linked = new Set(
      [...MASTHEAD, ...NAV_ORDER].map(
        (item) => item.href.split('?')[0] ?? item.href,
      ),
    )
    // The two harness routes are reached by URL and by test, deliberately not
    // by a nav entry, but they are still listed so they cannot 404.
    const harness = new Set(['/spec', '/play'])
    const unreachable = tablePaths.filter(
      (p) => !linked.has(p) && !harness.has(p),
    )
    expect(unreachable).toEqual([])
  })

  it('imports every page lazily', () => {
    expect(pageImports.length).toBeGreaterThan(0)
    for (const specifier of pageImports) {
      // `page(() => import('./pages/X'), 'X')` is the only sanctioned shape.
      const call = ROUTES_FILE.slice(
        ROUTES_FILE.indexOf(`import('${specifier}')`) - 24,
        ROUTES_FILE.indexOf(`import('${specifier}')`),
      )
      expect(call, `${specifier} must be inside page(...)`).toContain('page(')
    }
  })

  it('has no eager import of a page module', () => {
    const eager = [...ROUTES_FILE.matchAll(/^import .*from '\.\/pages\//gm)]
    expect(eager).toEqual([])
  })

  it('keeps the flat reading order in step with the tree', () => {
    expect(NAV_ORDER).toEqual(NAV.flatMap((section) => section.items))
  })

  it('keeps next/prev contiguous and section lookup stable', () => {
    // Every item in the flat order has a neighbour relationship that a
    // prev/next footer can render without a second lookup.
    expect(NAV_ORDER.length).toBeGreaterThan(2)
    for (const item of NAV_ORDER) {
      const { previous, next } = siblingsFor(
        item.href.split('?')[0] ?? item.href,
      )
      const isEnd = item === NAV_ORDER[0] || item === NAV_ORDER.at(-1)
      if (!isEnd) expect(Boolean(previous) || Boolean(next)).toBe(true)
    }
    expect(sectionFor('/docs')?.title).toBe('Overview')
    expect(sectionFor('/nope')).toBeUndefined()
  })

  it('keeps the sorted nav free of dead anchors', () => {
    // A href that is only a fragment is a link to nowhere once the page it
    // pointed at stops being a single-page showcase.
    const fragments = [...MASTHEAD, ...NAV_ORDER].filter((item) =>
      item.href.startsWith('#'),
    )
    expect(fragments).toEqual([])
  })
})

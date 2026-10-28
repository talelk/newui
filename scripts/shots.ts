/**
 * Screenshots, on demand.
 *
 * Not a visual-regression suite: nothing here is committed and nothing asserts.
 * It is the loop the design work runs on — render the built site, write one PNG
 * per (route, theme, width) to `test-results/shots/`, and let a human (or the
 * agent that just changed a recipe) look at them. The repo's *asserted* visual
 * checks are elsewhere: deterministic snapshots in `e2e/visual.spec.ts`, axe on real CSS in `e2e/a11y.spec.ts`, box metrics in
 * `e2e/interaction.spec.ts`, and the component-level browser tests.
 *
 * Usage
 *   pnpm shots                        # every route + story spot-check, both
 *                                     # themes, 1440 + 768 + 390
 *   pnpm shots /organisms /pages      # only these routes
 *   pnpm shots story:Accordion        # only this story, on Storybook's origin
 *   pnpm shots --all-stories          # every story and state, not only spot-checks
 *   pnpm shots --theme=dark           # one theme
 *   pnpm shots --width=390,1440       # selected viewport widths
 *   pnpm shots --dir=/tmp/compare     # somewhere else (e.g. a before/after pair)
 *
 * The examples use local data and avatar initials. A run waits for the local
 * brand image and webfonts to settle before capturing a deterministic view.
 */

import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { chromium, type Page } from 'playwright'
import { EXAMPLES } from '../apps/playground/src/lib/examples'
import { PATTERNS } from '../apps/playground/src/lib/reference-examples'

import { startPreview } from './preview-server'
import { STORYBOOK_PORT, serveStorybook } from './serve-storybook'

const PORT = 4182
const BASE = `http://localhost:${PORT}`
const STORYBOOK_BASE = `http://localhost:${STORYBOOK_PORT}`

/**
 * The site bakes Storybook's origin into its preview iframes at build time.
 * Rebuild against the static origin this script serves, otherwise the site may
 * point at the dev server's 6006 and every component/template screenshot is an
 * empty placeholder.
 */
function buildSite(): void {
  const result = spawnSync('pnpm', ['--filter', 'playground', 'build'], {
    stdio: 'inherit',
    env: { ...process.env, VITE_STORYBOOK_BASE: STORYBOOK_BASE },
  })
  if (result.status !== 0)
    throw new Error(`site build failed with code ${result.status}`)
}

/**
 * The story spot-checks — the families the design loop watches while working
 * on recipes. Stories are the unit now: `story:<Component>` selects one, and
 * each picture is `iframe.html?id=…` with the theme as a URL global.
 */
const STORY_CHECKS = [
  'Button',
  'Combobox',
  'DatePicker',
  'Tree',
  'Accordion',
  'Collapsible',
  'EmptyState',
  'Pagination',
  'ProgressCircle',
  'Timeline',
  'ToggleGroup',
]

/** Read Storybook's index once and resolve each name to its `Default` story. */
const storyIndex = JSON.parse(
  readFileSync(
    path.join(process.cwd(), 'apps/playground/src/generated/stories.json'),
    'utf8',
  ),
) as { stories: Array<{ id: string; title: string; name: string }> }

function storyIdFor(component: string): string {
  const titled = storyIndex.stories.filter(
    (story) => story.title.split('/').at(-1) === component,
  )
  const story =
    titled.find((candidate) => candidate.name === 'Default') ?? titled[0]
  if (!story) throw new Error(`no story documents “${component}”`)
  return story.id
}

function storyHref(id: string, theme: string): string {
  return `${STORYBOOK_BASE}/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`
}

const args = process.argv.slice(2)
const flag = (name: string): string | undefined =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1]

const themeFilter = flag('theme')
const widthFilter = flag('width')
const outDir = path.resolve(process.cwd(), flag('dir') ?? 'test-results/shots')
const routeArgs = args.filter((arg) => arg.startsWith('/'))
const allStories = args.includes('--all-stories')

/** Every route worth a picture, in nav order, plus the harness surfaces. */
const ROUTES = [
  '/',
  '/docs',
  '/foundations',
  '/changelog',
  '/architecture',
  '/kit',
  '/atoms',
  '/atoms/button',
  '/molecules',
  '/molecules/toaster',
  '/molecules/pagination',
  '/molecules/date-picker',
  '/organisms',
  '/templates',
  '/pages',
  '/kit/recipes',
  ...PATTERNS.map((pattern) => `/kit/recipes/${pattern.slug}`),
  ...EXAMPLES.flatMap((example) => [
    example.href,
    `${example.href}/fullscreen`,
  ]),
  '/spec',
]

const THEMES = themeFilter ? [themeFilter] : ['light', 'dark']
const WIDTHS = widthFilter
  ? widthFilter
      .split(',')
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0)
  : [1440, 768, 390]
if (WIDTHS.length === 0) throw new Error('--width needs positive pixel widths')
const storyArgs = args
  .filter((arg) => arg.startsWith('story:'))
  .map((arg) => arg.slice('story:'.length))
// A filter narrows both surfaces: route args select site routes, `story:` args
// select stories. With no filter, everything runs.
const selectedRoutes =
  routeArgs.length > 0
    ? routeArgs
    : storyArgs.length > 0 || allStories
      ? []
      : ROUTES
const selectedStories = allStories
  ? storyIndex.stories.map((story) => ({ id: story.id, slug: story.id }))
  : (storyArgs.length > 0
      ? storyArgs
      : routeArgs.length > 0
        ? []
        : STORY_CHECKS
    ).map((component) => ({ id: storyIdFor(component), slug: component }))

function storyFileName(slug: string, theme: string, width: number) {
  const normalized = slug.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  return `story-${normalized}-${theme}-${width}.png`
}

function fileName(route: string, theme: string, width: number): string {
  const slug = route
    .replace(/^\//, '')
    .replace(/[/?=&]/g, '-')
    .replace(/-+$/, '')
  return `${(slug || 'home').replace(/^-/, '')}-${theme}-${width}.png`
}

buildSite()
const preview = startPreview(PORT)
const storybook = serveStorybook({ port: STORYBOOK_PORT })

/**
 * Wait for the page to be *still*: fonts loaded, images settled, no pending
 * request. `networkidle` alone fires before a late CDN avatar has painted, which
 * makes two runs of the same route differ by a grey circle.
 */
async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    const images = [...document.querySelectorAll('img')]
    await Promise.all(
      images.map((image) =>
        image.complete
          ? undefined
          : new Promise<void>((resolve) => {
              const done = () => resolve()
              image.addEventListener('load', done, { once: true })
              image.addEventListener('error', done, { once: true })
              setTimeout(done, 3000)
            }),
      ),
    )
  })
  // Two frames: one for the last paint to commit, one to prove it settled.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  )
}

try {
  await preview.ready
  await storybook.ready
  mkdirSync(outDir, { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome' })
  let written = 0

  for (const width of WIDTHS) {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width, height: width > 500 ? 900 : 844 },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
        colorScheme: theme === 'dark' ? 'dark' : 'light',
      })
      // The site reads its scheme from this key, not from the media query.
      await context.addInitScript((value) => {
        localStorage.setItem('theme', value)
      }, theme)

      const page = await context.newPage()
      for (const route of selectedRoutes) {
        await page.goto(BASE + route, {
          waitUntil: 'networkidle',
          timeout: 60_000,
        })
        await settle(page)
        const file = fileName(route, theme, width)
        await page.screenshot({
          path: path.join(outDir, file),
          fullPage: true,
        })
        written += 1
        console.warn(`  ${file}`)
      }
      for (const story of selectedStories) {
        await page.goto(storyHref(story.id, theme), {
          waitUntil: 'networkidle',
          timeout: 60_000,
        })
        await settle(page)
        const file = storyFileName(story.slug, theme, width)
        await page.screenshot({
          path: path.join(outDir, file),
          fullPage: true,
        })
        written += 1
        console.warn(`  ${file}`)
      }
      await context.close()
    }
  }

  await browser.close()
  console.warn(
    `\n${written} screenshots → ${path.relative(process.cwd(), outDir)}\n`,
  )
} finally {
  preview.stop()
  storybook.stop()
}

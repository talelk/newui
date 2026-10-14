/**
 * Screenshots, on demand.
 *
 * Not a visual-regression suite: nothing here is committed and nothing asserts.
 * It is the loop the design work runs on — render the built site, write one PNG
 * per (route, theme, width) to `test-results/shots/`, and let a human (or the
 * agent that just changed a recipe) look at them. The repo's *asserted* visual
 * checks are elsewhere: axe on real CSS in `e2e/a11y.spec.ts`, box metrics in
 * `e2e/interaction.spec.ts`, and the component-level browser tests.
 *
 * Usage
 *   pnpm shots                        # every route, both themes, 1440 + 390
 *   pnpm shots /blocks /examples      # only these routes
 *   pnpm shots --theme=dark           # one theme
 *   pnpm shots --dir=/tmp/compare     # somewhere else (e.g. a before/after pair)
 *
 * The examples use remote avatars on purpose (`i.pravatar.cc`, GitHub), so a run
 * waits for every image to settle *and* for the webfonts, with a timeout — an
 * offline run still writes the shots, it just shows the fallback initials.
 */
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { chromium, type Page } from 'playwright'

const PORT = 4182
const BASE = `http://localhost:${PORT}`

const args = process.argv.slice(2)
const flag = (name: string): string | undefined =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1]

const themeFilter = flag('theme')
const outDir = path.resolve(process.cwd(), flag('dir') ?? 'test-results/shots')
const routeArgs = args.filter((arg) => arg.startsWith('/'))

/** Every route worth a picture, in nav order, plus the harness surfaces. */
const ROUTES = [
  '/',
  '/docs',
  '/foundations',
  '/components/atoms',
  '/components/feedback',
  '/blocks',
  '/examples',
  '/examples/discussions/desktop',
  '/examples/discussions/mobile',
  '/spec',
  '/play?c=Button',
  '/play?c=Combobox',
  '/play?c=DatePicker',
  '/play?c=Tree',
]

const THEMES = themeFilter ? [themeFilter] : ['light', 'dark']
const WIDTHS = [1440, 390]
const selected = routeArgs.length > 0 ? routeArgs : ROUTES

function fileName(route: string, theme: string, width: number): string {
  const slug = route
    .replace(/^\//, '')
    .replace(/[/?=&]/g, '-')
    .replace(/-+$/, '')
  return `${(slug || 'home').replace(/^-/, '')}-${theme}-${width}.png`
}

const server = spawn(
  'pnpm',
  ['--filter', 'playground', 'preview', '--port', String(PORT), '--strictPort'],
  { stdio: 'ignore', detached: true },
)

function stopServer() {
  try {
    process.kill(-server.pid)
  } catch {
    server.kill()
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(BASE)
      if (response.ok) return
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`preview did not come up at ${BASE}`)
}

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
  await waitForServer()
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
      for (const route of selected) {
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
      await context.close()
    }
  }

  await browser.close()
  console.warn(
    `\n${written} screenshots → ${path.relative(process.cwd(), outDir)}\n`,
  )
} finally {
  stopServer()
}

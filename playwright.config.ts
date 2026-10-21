import { defineConfig, devices } from '@playwright/test'

/**
 * Browser harness on Chrome.
 *
 * Behaviour checks and a small deterministic visual suite. These specs
 * assert behaviour that only a real browser can: computed focus rings, keyboard
 * navigation, focus trapping, axe on real CSS (colour contrast), responsive
 * overflow, RTL, and performance budgets (LCP/CLS/interaction latency).
 *
 * The page under test is the deterministic `/spec` route, which renders a fixed
 * set of components (no avatars, no network) so the measurements are stable.
 */
const port = process.env['NEWUI_E2E_PORT'] ?? '4173'
/** Storybook's static origin: the docs embed it, and every sweep drives it. */
const storybookPort = process.env['NEWUI_STORYBOOK_PORT'] ?? '6007'
const storybookBase = `http://localhost:${storybookPort}`

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  // Stable memory use and screenshot timing on large development hosts.
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // The flake reporter makes retries visible instead of invisible: a test that
  // fails once and passes on retry is printed as flaky, not quietly green.
  reporter: [
    ...(process.env.CI
      ? [['github'] as const, ['list'] as const]
      : [['list'] as const]),
    ['./e2e/flake-reporter.ts' as const],
  ],
  use: {
    baseURL: `http://localhost:${port}`,
    headless: true,
    trace: 'retain-on-failure',
  },
  /**
   * Playwright's bundled Chromium, not the machine's Chrome.
   *
   * `channel: 'chrome'` was convenient — the runner ships one — but it makes the
   * pixels depend on *which* Chrome is installed. A version apart is 17 pixels
   * on a screenshot and zero on every assertion, which is how a visual suite
   * turns into a different result on every machine while claiming to be a
   * regression test. The bundled build is pinned by the Playwright version, so
   * the same input renders the same image on CI and on a laptop.
   */
  // Chrome is the budget and visual baseline engine — CI runs
  // `pnpm test:e2e` (chrome only). `pnpm test:e2e:all` adds WebKit and
  // Firefox: the overlay/scroll classes the harness guards are exactly where
  // Safari and Firefox diverge, so they run locally and on the nightly.
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: /visual\.spec\.ts/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: /visual\.spec\.ts/,
    },
    {
      // Touch points, not a synthesized mouse: the mobile drawer and the
      // kanban drag are finger surfaces, and tap/hover semantics differ.
      name: 'touch',
      use: { ...devices['Pixel 7'], hasTouch: true },
      testMatch: /responsive\.spec\.ts|site-shell\.spec\.ts/,
    },
  ],
  webServer: [
    {
      // The site build is told where Storybook answers, so its "Open in
      // Storybook" links and block previews resolve to the static origin the
      // harness serves — never a guessed port.
      command: `VITE_STORYBOOK_BASE=${storybookBase} pnpm --filter playground build && pnpm --filter playground preview --port ${port} --strictPort`,
      url: `http://localhost:${port}/spec`,
      reuseExistingServer: !process.env.CI && !process.env['NEWUI_E2E_PORT'],
      timeout: 180_000,
    },
    {
      // The starter is a second application: a separate origin, so its smoke
      // tests can run the real frame, router and data layer rather than a
      // facsimile inside the docs site. Serve the production bundle: a Vite
      // dev server compiles on first request, and nine smoke tests hitting a
      // cold one under a loaded runner time out before the first paint.
      command:
        'pnpm build:starter && pnpm --filter starter preview --port 4183 --strictPort',
      url: 'http://localhost:4183/',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      // The story build is the other half of the surface: `iframe.html?id=…`
      // on its own origin, exactly what a docs embed or a deep link loads.
      command: `pnpm storybook:serve --port ${storybookPort} --build`,
      url: `${storybookBase}/iframe.html`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
  ],
})

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

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  // Stable memory use and screenshot timing on large development hosts.
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
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
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm --filter playground build && pnpm --filter playground preview --port ${port} --strictPort`,
    url: `http://localhost:${port}/spec`,
    reuseExistingServer: !process.env.CI && !process.env['NEWUI_E2E_PORT'],
    timeout: 180_000,
  },
})

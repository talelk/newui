import { defineConfig, devices } from '@playwright/test'

/**
 * Browser harness on Chrome.
 *
 * Deliberately not a screenshot suite — no visual regression here. These specs
 * assert behaviour that only a real browser can: computed focus rings, keyboard
 * navigation, focus trapping, axe on real CSS (colour contrast), responsive
 * overflow, RTL, and performance budgets (LCP/CLS/interaction latency).
 *
 * The page under test is the deterministic `/spec` route, which renders a fixed
 * set of components (no avatars, no network) so the measurements are stable.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    channel: 'chrome',
    headless: true,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command:
      'pnpm --filter playground build && pnpm --filter playground preview --port 4173 --strictPort',
    url: 'http://localhost:4173/spec',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})

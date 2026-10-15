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
    channel: 'chrome',
    headless: true,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm --filter playground build && pnpm --filter playground preview --port ${port} --strictPort`,
    url: `http://localhost:${port}/spec`,
    reuseExistingServer: !process.env.CI && !process.env['NEWUI_E2E_PORT'],
    timeout: 180_000,
  },
})

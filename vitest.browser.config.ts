import tailwindcss from '@tailwindcss/vite'
import { playwright } from '@vitest/browser-playwright'
import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'

/**
 * browser — real Chrome with the **real stylesheet**, for the per-component
 * checks a class-name assertion cannot make (box metrics, computed colours,
 * focus rings). The Solid counterpart of frappe-ui's Cypress component tests.
 *
 * Run with `pnpm test:browser`; it needs a browser, so it runs in the e2e CI
 * job, not the fast checks job. It reuses the system Chrome the e2e harness
 * uses (`channel: 'chrome'`), so no `playwright install` step is required.
 */
export default defineConfig({
  plugins: [solid(), tailwindcss()],
  resolve: {
    // Preserve Vite's module condition: tslib exposes its native ESM helpers
    // there; the import-only branch wraps CommonJS and cannot run unbundled.
    conditions: ['module', 'development', 'browser'],
    dedupe: ['solid-js', 'solid-js/web'],
  },
  optimizeDeps: {
    include: ['@solidjs/testing-library'],
  },
  test: {
    globals: true,
    // Serial files retain isolation and bound browser resource usage.
    fileParallelism: false,
    setupFiles: ['./vitest.browser.setup.ts'],
    include: ['packages/**/src/**/*.browser.test.{ts,tsx}'],
    browser: {
      enabled: true,
      // The bundled Chromium, pinned by the Playwright version — the same
      // reason the e2e harness pins it. These tests measure real geometry, and
      // geometry that depends on text metrics depends on *which* Chrome: the
      // tab indicator was 2.03px away from its tab on the runner's Chrome and
      // inside 2px everywhere else.
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
})

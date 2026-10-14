import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'

/**
 * unit — jsdom, logic + ARIA wiring (the default `pnpm test`).
 *
 * The real-browser component project lives in `vitest.browser.config.ts`
 * (`pnpm test:browser`): it needs the stylesheet and a browser, so it is kept a
 * separate config rather than a `test.projects` entry — a projects array
 * changes how Vite resolves `solid-js` for the jsdom project and pulls in the
 * server build.
 */
export default defineConfig({
  plugins: [solid()],
  resolve: {
    conditions: ['development', 'browser'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'packages/**/src/**/*.test.{ts,tsx}',
      'apps/**/src/**/*.test.{ts,tsx}',
      'package.test.ts',
      'ci.test.ts',
    ],
    exclude: ['**/node_modules/**', '**/*.browser.test.*', '**/*.ssr.test.*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.ssr.test.{ts,tsx}',
        '**/*.browser.test.{ts,tsx}',
        '**/*.d.ts',
        '**/index.ts',
      ],
      thresholds: {
        statements: 90,
        lines: 90,
        functions: 88,
        branches: 85,
      },
    },
  },
})

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
    // `@tanstack/solid-form` ships its Solid component as an untransformed
    // `.jsx` dist, which Node's ESM loader rejects; inlining it lets Vite
    // compile it like our own sources.
    server: { deps: { inline: ['@tanstack/solid-form'] } },
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'packages/**/src/**/*.test.{ts,tsx}',
      'apps/**/src/**/*.test.{ts,tsx}',
      'scripts/**/*.test.ts',
      'package.test.ts',
      'ci.test.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/*.browser.test.*',
      '**/*.ssr.test.*',
      '**/*.sweep.test.*',
    ],
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
      // The current measured floor after the atomic split (89.03 / 91.16 /
      // 89.94 / 76.13). These are a ratchet: raise a number when its gap
      // closes, never lower it to absorb new untested code.
      thresholds: {
        statements: 88,
        lines: 90,
        functions: 89,
        branches: 75,
      },
    },
  },
})

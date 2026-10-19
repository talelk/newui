import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'

/**
 * The quadratic sweep config (`pnpm test:sweep`).
 *
 * The sweep file is excluded from the default `pnpm test` run — that is the
 * point, so the expensive all-pairs closure leaves the per-change loop — and
 * this config pulls it back in explicitly, the way the browser and SSR suites
 * get their own configs.
 */
export default defineConfig({
  plugins: [solid()],
  resolve: {
    conditions: ['development', 'browser'],
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/tw-merge.sweep.test.ts'],
  },
})

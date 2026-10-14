import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'

/** Solid SSR smoke tests: renderToString + no server-only crashes. */
export default defineConfig({
  plugins: [solid({ ssr: true })],
  resolve: {
    conditions: ['node', 'development'],
  },
  test: {
    name: 'ssr',
    environment: 'node',
    include: ['packages/**/src/**/*.ssr.test.{ts,tsx}'],
  },
})

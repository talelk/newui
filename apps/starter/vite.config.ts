import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

/**
 * The starter's build is deliberately the boring one.
 *
 * The playground inlines its stylesheet and hand-groups its chunks because it is
 * a site with one stylesheet and a hundred routes; an app owns its own asset
 * pipeline, and a starter that shipped a bespoke one would teach the wrong
 * thing. What it *does* inherit is the library's cost, which `pnpm size` and
 * `pnpm budget` keep honest.
 */
export default defineConfig({
  plugins: [solid(), tailwindcss()],
})

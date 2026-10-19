import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import type { StorybookConfig } from 'storybook-solidjs-vite'

const here = path.dirname(fileURLToPath(import.meta.url))

/**
 * The site's build inlines its one stylesheet into `index.html` (removing a
 * render-blocking request). Storybook's build uses a relative base and emits
 * fonts under `assets/`, so an inlined sheet resolves `url(…)` against the
 * wrong directory — the Inter faces 404 and the previews render in a fallback.
 * Storybook owns its asset pipeline; the app-only step is filtered out here.
 */
function withoutInlineCss(plugins: unknown[]): unknown[] {
  return plugins
    .flat(Infinity)
    .filter(
      (plugin) =>
        !(
          typeof plugin === 'object' &&
          plugin !== null &&
          'name' in plugin &&
          (plugin as { name?: unknown }).name === 'newui:inline-css'
        ),
    )
}

/**
 * Storybook is the kit's isolated surface (`spec/kit.md`, W1): every component,
 * block, chart and composition renders here on its own origin, one story per
 * state. The site embeds the same story modules (`src/stories.ts`), so a demo
 * is still written once.
 */
const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: 'storybook-solidjs-vite',
    options: {},
  },
  async viteFinal(vite) {
    vite.plugins = withoutInlineCss(vite.plugins ?? []) as typeof vite.plugins
    vite.plugins = [...(vite.plugins ?? []), tailwindcss()]
    vite.server = {
      ...vite.server,
      // Stories import workspace packages, and `spec/` lives outside this
      // app's root; the parent directory is exactly what must be allowed.
      fs: { allow: [path.resolve(here, '../..')] },
    }
    vite.optimizeDeps = {
      ...vite.optimizeDeps,
      // Workspace packages are served as source, as in `vite.config.ts`.
      exclude: [
        ...(vite.optimizeDeps?.exclude ?? []),
        '@newui/ui',
        '@newui/tailwind',
        '@newui/tokens',
      ],
    }
    return vite
  },
}

export default config

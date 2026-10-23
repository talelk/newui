import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import solid from 'vite-plugin-solid'

/**
 * Inline the emitted CSS into `index.html` at build time.
 *
 * The app ships exactly one small stylesheet (Tailwind's output), and a
 * blocking `<link rel="stylesheet">` delays first paint by a full round trip.
 * Inlining it removes that request; there is nothing to key a separate HTTP
 * cache on, and the HTML is compressed alongside it. An async load would trade
 * the round trip for a flash of unstyled content, which is worse.
 *
 * This is an app-level optimisation. A library must not do it — consumers own
 * their own asset pipeline.
 */
function inlineCss(): Plugin {
  return {
    name: 'newui:inline-css',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      const bundle = ctx.bundle
      if (!bundle) return html

      // `flatMap` narrows to the asset branch without a type predicate import.
      const cssAssets = Object.values(bundle).flatMap((asset) =>
        asset.type === 'asset' && asset.fileName.endsWith('.css')
          ? [asset]
          : [],
      )
      if (cssAssets.length === 0) return html

      const styles = cssAssets
        .map(
          (asset) =>
            `<style data-inlined-css>${String(asset.source).trim()}</style>`,
        )
        .join('\n')

      for (const asset of cssAssets) delete bundle[asset.fileName]

      return html
        .replace(/<link[^>]+rel="stylesheet"[^>]*>/g, '')
        .replace('</head>', `${styles}\n  </head>`)
    },
  }
}

const base = (process.env['VITE_BASE'] || '/').replace(/\/?$/, '/')

export default defineConfig({
  base,
  plugins: [solid(), tailwindcss(), inlineCss()],
  build: {
    // One stylesheet is inlined into the document by `inlineCss`; keeping CSS
    // in the entry output means lazy chunks never preload a file the plugin
    // deliberately removes.
    cssCodeSplit: false,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              // All routes already need the entry's static dependencies. Keep
              // them together to avoid repeating long preload dependency maps.
              name: 'shell',
              tags: ['$initial'],
              includeDependenciesRecursively: false,
              priority: 10,
            },
            {
              // Keep chart modules in their own groups so Rolldown cannot
              // place shared namespace helpers inside an ECharts payload.
              // Entry-aware groups retain tree shaking between chart families.
              name: 'charts',
              test: /(?:node_modules[\\/](?:echarts|zrender)|packages[\\/]charts)[\\/]/,
              entriesAware: true,
              includeDependenciesRecursively: false,
            },
          ],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: [
      '@talelk/newui-atoms',
      '@talelk/newui-molecules',
      '@talelk/newui-organisms',
      '@talelk/newui-templates',
      '@talelk/newui-tailwind',
      '@talelk/newui-tokens',
    ],
  },
  server: {
    fs: {
      // The component contracts live in `spec/`, outside this app's root, and
      // `lib/specs.ts` reads them with `import.meta.glob(..., '?raw')`. The dev
      // server refuses to serve files above the root by default; the parent
      // directory is exactly what needs to be allowed, and nothing wider.
      allow: [path.resolve(import.meta.dirname, '../..')],
    },
  },
})

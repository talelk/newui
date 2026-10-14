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

export default defineConfig({
  plugins: [solid(), tailwindcss(), inlineCss()],
  optimizeDeps: {
    exclude: ['@newui/ui', '@newui/tailwind', '@newui/tokens'],
  },
})

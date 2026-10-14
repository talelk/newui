import fs from 'node:fs'
import path from 'node:path'
import plugin from 'tailwindcss/plugin'

/**
 * Exposes every SVG in `iconsDir` as a `<prefix>-<name>` utility that masks the
 * icon with the current text color:
 *
 *   <span class="lucide-menu size-4 text-ink-gray-6" />
 *
 * Tailwind v4 removed `matchComponents`, so this registers as a normal utility
 * (`matchUtilities`). The icon utility deliberately sets NO width/height — the
 * call site always pairs it with a `size-*` — which dodges the layer-order race
 * v3 solved by putting icons in the components layer.
 *
 * @param {object} options
 * @param {string} options.prefix
 * @param {string} options.iconsDir
 * @param {number} [options.normalizeStrokeWidth]
 * @param {string} [options.defaultColor]
 */
export function iconPackPlugin({
  prefix,
  iconsDir,
  normalizeStrokeWidth,
  defaultColor,
}) {
  if (!prefix) throw new Error('iconPackPlugin: `prefix` is required')
  if (!iconsDir) throw new Error('iconPackPlugin: `iconsDir` is required')

  const cache = new Map()

  function encode(name) {
    if (cache.has(name)) return cache.get(name)
    const file = path.join(iconsDir, `${name}.svg`)
    let uri = null
    if (fs.existsSync(file)) {
      let svg = fs.readFileSync(file, 'utf8')
      if (normalizeStrokeWidth != null) {
        svg = svg.replace(
          /stroke-width="[^"]+"/g,
          `stroke-width="${normalizeStrokeWidth}"`,
        )
      }
      svg = svg.replace(/\s+/g, ' ').trim()
      uri = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
    }
    cache.set(name, uri)
    return uri
  }

  function available() {
    try {
      return fs
        .readdirSync(iconsDir)
        .filter((f) => f.endsWith('.svg'))
        .map((f) => f.slice(0, -4))
    } catch {
      return []
    }
  }

  return plugin(({ matchUtilities }) => {
    const values = Object.fromEntries(available().map((n) => [n, n]))
    matchUtilities(
      {
        [prefix]: (value) => {
          const mask = encode(value)
          if (!mask) return {}
          return {
            display: 'block',
            'background-color': defaultColor ?? 'currentColor',
            '-webkit-mask-image': mask,
            'mask-image': mask,
            '-webkit-mask-repeat': 'no-repeat',
            'mask-repeat': 'no-repeat',
            '-webkit-mask-position': 'center',
            'mask-position': 'center',
            '-webkit-mask-size': 'contain',
            'mask-size': 'contain',
          }
        },
      },
      { values },
    )
  })
}

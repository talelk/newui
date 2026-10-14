/**
 * Lucide icons, the optional third of the plugin.
 *
 * Two ways in, matching `frappe-ui/vite`:
 *
 * - `import ArrowRight from '~icons/lucide/arrow-right'` resolves to a Solid
 *   component built from `lucide-static`'s SVG (no per-icon install).
 * - A bare `<LucideArrowRight />` tag in a `.tsx`/`.jsx` file gets its import
 *   injected by the `transform` hook.
 *
 * `lucide-static` is an optional peer: when it is absent the resolver still
 * answers, rendering a visible placeholder and warning once per icon. The SVG
 * → module rendering is pure and unit-tested; only `load` touches the disk.
 */
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import type { Plugin } from 'vite'

/** The public specifier prefix: `~icons/lucide/<kebab-name>`. */
export const LUCIDE_VIRTUAL_PREFIX = '~icons/lucide/'

const RESOLVED_PREFIX = '\0newui-lucide:'

/** Options for the `lucideIcons` sub-plugin. */
export interface LucideIconsOptions {
  /**
   * Directory of lucide `.svg` files.
   * @default lucide-static/icons, when lucide-static is installed
   */
  iconsDir?: string
  /**
   * Inject imports for bare `<LucideName />` tags.
   * @default true
   */
  autoImport?: boolean
  /**
   * Files the auto-import transform applies to.
   * @default /\.[jt]sx?$/
   */
  include?: RegExp
  /**
   * Files the auto-import transform skips.
   * @default /node_modules/
   */
  exclude?: RegExp
}

/**
 * Resolve `lucide-static/icons`, or `null` when the package is not installed.
 * The name is assembled at runtime so the optional dependency is not mistaken
 * for a hard one by tooling.
 */
export function resolveIconsDir(): string | null {
  try {
    const nodeRequire = createRequire(import.meta.url)
    const pkg = ['lucide', 'static'].join('-')
    return path.join(
      path.dirname(nodeRequire.resolve(`${pkg}/package.json`)),
      'icons',
    )
  } catch {
    return null
  }
}

// Lucide's own "circle-help", so a missing icon is recognisable on the page.
const FALLBACK_INNER_HTML =
  '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>'

/** `ArrowRight` → `arrow-right`, `BarChart2` → `bar-chart-2`. */
export function pascalToKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Za-z])(\d)/g, '$1-$2')
    .toLowerCase()
}

/** The inner markup of an `<svg>` document, with inter-tag whitespace collapsed. */
export function svgToInnerHtml(svg: string): string {
  const match = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/)
  const inner = match?.[1] ?? svg
  return inner.replace(/>\s+</g, '><').trim()
}

/**
 * The source of a Solid icon component for `innerHtml`. Uses `solid-js/h`, so
 * the generated module is plain JS — it needs no JSX transform and no build
 * plugin beyond resolving `solid-js`.
 */
export function generateIconModule(innerHtml: string): string {
  return renderIconModule({ componentName: 'NewuiLucideIcon', innerHtml })
}

/** The source of the placeholder component shown for an unknown icon. */
export function generateFallbackModule(iconName: string): string {
  const safe = iconName.replace(/[^a-zA-Z0-9_]/g, '_')
  return renderIconModule({
    componentName: `NewuiLucideMissing_${safe}`,
    innerHtml: FALLBACK_INNER_HTML,
    attributes: { 'data-lucide-missing': iconName },
  })
}

interface IconModuleParts {
  componentName: string
  innerHtml: string
  attributes?: Record<string, string | number>
}

function renderIconModule(parts: IconModuleParts): string {
  const attributes: Record<string, string | number> = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '1em',
    height: '1em',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 1.5,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    ...parts.attributes,
  }
  const lines = Object.entries(attributes).map(
    ([key, value]) => `      ${JSON.stringify(key)}: ${JSON.stringify(value)},`,
  )

  return [
    "import h from 'solid-js/h'",
    '',
    `export default function ${parts.componentName}(props) {`,
    '  return h(',
    "    'svg',",
    '    {',
    ...lines,
    '      ...props,',
    `      innerHTML: ${JSON.stringify(parts.innerHtml)},`,
    '    },',
    '  )',
    '}',
    '',
  ].join('\n')
}

const TAG_PATTERN = /<([A-Z][A-Za-z0-9]*)\b/g

/**
 * The import statements for every bare `<LucideName />` tag in `code`, or
 * `null` when there is nothing to inject. Already-imported icons are left
 * alone (the guard is on the `~icons/lucide/` specifier).
 */
export function generateLucideImports(code: string): string | null {
  if (code.includes(`from '${LUCIDE_VIRTUAL_PREFIX}`)) return null

  const tags = new Set<string>()
  for (const match of code.matchAll(TAG_PATTERN)) {
    const tag = match[1]
    if (tag?.startsWith('Lucide') && tag.length > 'Lucide'.length) {
      tags.add(tag)
    }
  }
  if (tags.size === 0) return null

  const imports = [...tags].sort().map((tag) => {
    const icon = pascalToKebab(tag.slice('Lucide'.length))
    return `import ${tag} from '${LUCIDE_VIRTUAL_PREFIX}${icon}'`
  })
  return `${imports.join('\n')}\n`
}

/** The `lucideIcons` Vite plugin: `~icons/lucide/*` plus bare-tag auto-import. */
export function lucideIcons(options: LucideIconsOptions = {}): Plugin {
  const iconsDir = options.iconsDir ?? resolveIconsDir()
  const autoImport = options.autoImport ?? true
  const include = options.include ?? /\.[jt]sx?$/
  const exclude = options.exclude ?? /node_modules/
  const warned = new Set<string>()

  return {
    name: 'newui:lucide-icons',

    resolveId(id) {
      if (id.startsWith(LUCIDE_VIRTUAL_PREFIX)) {
        return RESOLVED_PREFIX + id.slice(LUCIDE_VIRTUAL_PREFIX.length)
      }
      return null
    },

    load(id) {
      if (!id.startsWith(RESOLVED_PREFIX)) return null
      const iconName = id.slice(RESOLVED_PREFIX.length)
      const svg = iconsDir ? readIcon(iconsDir, iconName) : null

      if (!svg) {
        if (!warned.has(iconName)) {
          warned.add(iconName)
          const hint = iconsDir
            ? 'not found in lucide-static'
            : 'lucide-static is not installed'
          this.warn(
            `[newui/vite] icon "${iconName}" ${hint}. Rendering a placeholder.`,
          )
        }
        return generateFallbackModule(iconName)
      }

      return generateIconModule(svgToInnerHtml(svg))
    },

    transform(code, id) {
      if (!autoImport) return null
      const clean = id.split('?', 1)[0] ?? id
      if (!include.test(clean) || exclude.test(clean)) return null

      const imports = generateLucideImports(code)
      if (!imports) return null
      return { code: `${imports}${code}`, map: null }
    },
  }
}

function readIcon(iconsDir: string, iconName: string): string | null {
  const file = path.join(iconsDir, `${iconName}.svg`)
  return existsSync(file) ? readFileSync(file, 'utf8') : null
}

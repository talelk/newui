import { describe, expect, it } from 'vitest'
import {
  generateFallbackModule,
  generateIconModule,
  generateLucideImports,
  pascalToKebab,
  svgToInnerHtml,
} from './lucide'

describe('pascalToKebab', () => {
  it('converts PascalCase to kebab-case', () => {
    expect(pascalToKebab('ArrowRight')).toBe('arrow-right')
  })

  it('puts a dash before trailing digits', () => {
    expect(pascalToKebab('BarChart2')).toBe('bar-chart-2')
    expect(pascalToKebab('ChartNoAxesColumn3')).toBe('chart-no-axes-column-3')
  })
})

describe('svgToInnerHtml', () => {
  it('extracts the inner markup and collapses whitespace between tags', () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n' +
      '  <path d="M1 2" />\n  <circle cx="1" />\n</svg>'
    expect(svgToInnerHtml(svg)).toBe('<path d="M1 2" /><circle cx="1" />')
  })
})

describe('generateIconModule', () => {
  it('emits a solid-js/h component carrying the icon markup', () => {
    const source = generateIconModule('<path d="M1 2" />')
    expect(source).toContain("import h from 'solid-js/h'")
    expect(source).toContain('export default function NewuiLucideIcon(props)')
    expect(source).toContain('innerHTML: "<path d=\\"M1 2\\" />"')
    expect(source).toContain('"stroke-width": 1.5')
  })
})

describe('generateFallbackModule', () => {
  it('names the component and tags the placeholder with the icon name', () => {
    const source = generateFallbackModule('arrow-right')
    expect(source).toContain('NewuiLucideMissing_arrow_right')
    expect(source).toContain('"data-lucide-missing": "arrow-right"')
  })
})

describe('generateLucideImports', () => {
  it('injects an import for a bare Lucide tag', () => {
    const code = 'const x = <LucideArrowRight class="size-4" />\n'
    expect(generateLucideImports(code)).toBe(
      "import LucideArrowRight from '~icons/lucide/arrow-right'\n",
    )
  })

  it('is null when there is nothing to import', () => {
    expect(generateLucideImports('const x = 1\n')).toBeNull()
  })

  it('leaves files that already import an icon alone', () => {
    const code = "import X from '~icons/lucide/x'\nconst y = <LucideStar />\n"
    expect(generateLucideImports(code)).toBeNull()
  })

  it('sorts multiple tags and ignores non-Lucide tags', () => {
    const code = '<Button /><LucideStar /><LucideArrowRight />'
    expect(generateLucideImports(code)).toBe(
      "import LucideArrowRight from '~icons/lucide/arrow-right'\n" +
        "import LucideStar from '~icons/lucide/star'\n",
    )
  })
})

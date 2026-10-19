import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

/**
 * Token discipline, at computed-style time.
 *
 * `tokens.test.ts` proves the recipes *reference* semantic tokens; this proves
 * the browser *resolves* them. A raw palette value that reaches the stylesheet
 * (a stray `text-blue-500`, a gradient, a hand-written colour in a ported
 * component) has the same pixels as a token and a different future — the whole
 * theming contract is "override `--surface-*` / `--ink-*` / `--outline-*` and
 * the app re-skins". So on the deterministic `/spec` page, every visible
 * text/colour pair must be one of the token palette's colours (modulo the
 * alpha channel) in both themes.
 *
 * The token *names* come from the generated theme (the emitter's own contract);
 * the *values* are read back through `getComputedStyle`, so what is asserted is
 * the browser's answer, not a fixture's.
 */

const TOKEN_NAMES = [
  ...new Set(
    [
      ...readFileSync(
        path.join(process.cwd(), 'packages/tailwind/src/generated/tokens.css'),
        'utf8',
      ).matchAll(/--(surface|ink|outline)-[a-z0-9-]+/g),
    ].map((m) => m[0]),
  ),
]

/**
 * Resolve every semantic token to the sRGB triple the browser actually paints.
 * Tokens are raw `oklch(...)` and modern computed styles keep that color space
 * when serialising, so string parsing would lie. The canvas converts: every
 * colour we assert and every colour we compare gets the same treatment.
 */
const CANVAS_RGB = `(value) => {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d')
  try {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 1, 1)
    ctx.fillStyle = value
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    return \`\${d[0]},\${d[1]},\${d[2]}\`
  } catch {
    return null
  }
}`

async function paletteOf(
  page: import('@playwright/test').Page,
): Promise<string[]> {
  return page.evaluate(
    ({ names, toRgb }) => {
      const probe = document.createElement('span')
      probe.style.display = 'none'
      document.body.appendChild(probe)
      const toRgbFn = new Function(`return (${toRgb})`)()
      const out: string[] = []
      for (const name of names) {
        probe.style.color = `var(${name})`
        const computed = getComputedStyle(probe).color
        const rgb = toRgbFn(computed)
        if (rgb) out.push(rgb)
      }
      probe.remove()
      return [...new Set(out)]
    },
    { names: TOKEN_NAMES, toRgb: CANVAS_RGB },
  )
}

for (const theme of ['light', 'dark']) {
  test(`/spec stays inside the token palette (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(`/spec?theme=${theme}`)
    await expect(page.locator('main *').first()).toBeVisible()

    const palette = new Set(await paletteOf(page))
    expect(palette.size, 'no semantic tokens resolved').toBeGreaterThan(20)

    const leaks = await page.evaluate(
      ({ paletteTriples, toRgb }) => {
        const set = new Set(paletteTriples)
        const toRgbFn = new Function(`return (${toRgb})`)()

        const offenders: string[] = []
        const seen = new Map<string, number>()
        const isStateCarrier = (el: HTMLElement) =>
          el.tagName === 'INPUT' &&
          (() => {
            const style = getComputedStyle(el)
            // Zag-styled inputs (checkbox/radio/range…) are state carriers: the
            // visible ink is drawn by the component, the native input paints
            // nothing (appearance: none / sr-only), and its `color` is the UA's
            // AccentColor in dark schemes — not a token we ever paint.
            return style.appearance !== 'auto' || Number(style.opacity) < 1
          })()
        for (const el of document.querySelectorAll<HTMLElement>(
          'main *, main',
        )) {
          if (!el.getClientRects().length) continue
          if (isStateCarrier(el)) continue
          const style = getComputedStyle(el)
          if (style.backgroundImage !== 'none') continue // gradients are a different contract
          for (const prop of [
            'color',
            'backgroundColor',
            'borderColor',
            'borderTopColor',
            'borderBottomColor',
            'borderLeftColor',
            'borderRightColor',
          ] as const) {
            const value = style[prop]
            if (value === 'transparent' || value === 'currentcolor') continue
            const triple = toRgbFn(value)
            if (!triple) continue
            if (set.has(triple)) continue
            const key = `${prop}:${triple}`
            const count = (seen.get(key) ?? 0) + 1
            seen.set(key, count)
            if (count <= 3) {
              const slot = [
                el.getAttribute('data-slot'),
                el.getAttribute('type') ?? '',
                el.className?.toString().slice(0, 50),
              ]
                .filter(Boolean)
                .join(' ')
              offenders.push(`${key} (${slot})`)
            }
          }
        }
        return offenders
      },
      { paletteTriples: [...palette], toRgb: CANVAS_RGB },
    )

    expect(
      leaks.slice(0, 20).join('\n'),
      `raw (non-token) colours resolved on /spec — the theming contract says these must come from --surface-*/--ink-*/--outline-*:`,
    ).toBe('')
  })
}

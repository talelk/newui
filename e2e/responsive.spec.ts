import { expect, type Page, test } from '@playwright/test'

/**
 * Layout robustness: no horizontal overflow at phone/tablet/desktop widths, and
 * none when the writing direction flips to RTL.
 *
 * Two lessons are baked into the helper below, both from a CI-only failure that
 * could not be reproduced locally:
 *
 *  1. **Measure the settled page.** A run that measures before the webfont has
 *     landed measures the *fallback* metrics, which are wider — an element that
 *     fits in Inter can overflow in the system font. So: fonts ready, then two
 *     frames, then read.
 *  2. **Say what overflowed.** The first version reported only a number, and a
 *     number tells you nothing about which element to fix. The helper now names
 *     the widest offenders, their box and their `data-slot`, so the next failure
 *     is actionable from the CI log alone.
 */

interface OverflowReport {
  width: number
  clientWidth: number
  scrollWidth: number
  overflow: number
  offenders: { what: string; right: number; width: number; text: string }[]
}

/** The widest elements past the client edge, named well enough to find. */
async function measureOverflow(page: Page): Promise<OverflowReport> {
  return page.evaluate(async () => {
    await document.fonts.ready
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    )

    const doc = document.documentElement
    const offenders = [...document.querySelectorAll('*')]
      .map((el) => ({ el, rect: el.getBoundingClientRect() }))
      .filter(({ rect }) => rect.right > doc.clientWidth + 1 && rect.width > 0)
      .sort((a, b) => b.rect.right - a.rect.right)
      .slice(0, 6)
      .map(({ el, rect }) => ({
        what:
          el.getAttribute('data-slot') ??
          `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0] ?? ''}`,
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        text: (el.textContent ?? '').trim().slice(0, 40),
      }))

    return {
      width: window.innerWidth,
      clientWidth: doc.clientWidth,
      scrollWidth: doc.scrollWidth,
      overflow: doc.scrollWidth - doc.clientWidth,
      offenders,
    }
  })
}

function describe(report: OverflowReport): string {
  const lines = [
    `overflow ${report.overflow}px (scrollWidth ${report.scrollWidth} > clientWidth ${report.clientWidth}, viewport ${report.width})`,
  ]
  for (const o of report.offenders) {
    lines.push(`  ${o.what}  right=${o.right} w=${o.width}  "${o.text}"`)
  }
  return lines.join('\n')
}

for (const width of [320, 768, 1280]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/spec')
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()

    const report = await measureOverflow(page)
    expect(report.overflow, describe(report)).toBeLessThanOrEqual(1)
  })
}

test('no horizontal overflow in RTL', async ({ page }) => {
  await page.goto('/spec')
  await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'))

  const report = await measureOverflow(page)
  expect(report.overflow, describe(report)).toBeLessThanOrEqual(1)
})

test('content reflows at 200% text zoom without clipping', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/spec')
  // Emulate a 200% text-size increase (WCAG 1.4.4).
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px'
  })

  const report = await measureOverflow(page)
  expect(report.overflow, describe(report)).toBeLessThanOrEqual(1)
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()
})

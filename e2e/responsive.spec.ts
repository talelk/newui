import { expect, test } from '@playwright/test'

/**
 * Layout robustness: no horizontal overflow at phone/tablet/desktop widths, and
 * none when the writing direction flips to RTL.
 */
for (const width of [320, 768, 1280]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/spec')
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })
}

test('no horizontal overflow in RTL', async ({ page }) => {
  await page.goto('/spec')
  await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'))
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

test('content reflows at 200% text zoom without clipping', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/spec')
  // Emulate a 200% text-size increase (WCAG 1.4.4).
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px'
  })

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()
})

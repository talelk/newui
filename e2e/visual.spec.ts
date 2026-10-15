import { expect, test } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })

// Deliberate baseline updates require inspecting the resulting images.
for (const theme of ['light', 'dark']) {
  for (const width of [390, 768, 1440]) {
    test(`analytics visual ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto('/examples/analytics/fullscreen')
      await page.getByRole('button', { name: theme, exact: true }).click()
      await expect(
        page.locator('[data-slot="chart-card"] svg').first(),
      ).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      await expect(page).toHaveScreenshot(`analytics-${theme}-${width}.png`, {
        fullPage: true,
        animations: 'disabled',
      })
    })
  }
  test(`reference and states visual ${theme}`, async ({ page }) => {
    await page.goto('/components/button')
    await page.getByRole('button', { name: theme, exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Solid', exact: true }),
    ).toBeVisible()
    await expect(page).toHaveScreenshot(`reference-${theme}.png`, {
      animations: 'disabled',
    })
    await page.goto(`/spec?theme=${theme}`)
    await expect(
      page.getByRole('button', { name: 'Save', exact: true }),
    ).toBeVisible()
    await expect(
      page.locator('[data-slot="visual-form-states"]'),
    ).toHaveScreenshot(`form-states-${theme}.png`)
    await page.getByRole('button', { name: 'Open dialog', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    const background = await page
      .getByRole('dialog')
      .evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(background).not.toBe('rgba(0, 0, 0, 0)')
    await expect(page).toHaveScreenshot(`overlay-${theme}.png`, {
      animations: 'disabled',
    })
  })
}

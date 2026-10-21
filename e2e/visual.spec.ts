import { expect, type Page, test } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })

/**
 * Wait until the charts stop moving.
 *
 * `reducedMotion: 'reduce'` already turns echarts' own animation off (the
 * wrapper honours it), but a chart still re-renders once more when its container
 * settles — and on a loaded runner that lands *after* the screenshot. The
 * numbers say so: the same snapshot differed by 12965 pixels on one attempt and
 * 22489 on the retry, which no committed baseline can match. So the shot waits
 * for the chart boxes to stop changing, and the comparison is given a bounded
 * tolerance for what is left. Structural drift moves far more than 3% of a page.
 */
async function settledCharts(page: Page) {
  await page.evaluate(async () => {
    const boxes = () =>
      [...document.querySelectorAll('[data-slot="chart-card"]')]
        .map((element) => {
          const rect = element.getBoundingClientRect()
          return `${Math.round(rect.width)}x${Math.round(rect.height)}`
        })
        .join('|')
    let previous = ''
    for (let frame = 0; frame < 40; frame += 1) {
      const current = boxes()
      if (current === previous && current !== '') return
      previous = current
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
    }
  })
  await page.evaluate(() => document.fonts.ready)
}

/** The tolerance chart-bearing shots need; see `settledCharts`. */
const CHART_NOISE = { maxDiffPixelRatio: 0.03 }

/**
 * And the tolerance everything else needs: a handful of pixels.
 *
 * The runner and a developer machine rasterise a couple of glyph edges
 * differently — 17 pixels on a 1280×720 page, and identical on every run on each
 * machine, so it is not noise to be waited out. Bounded in *pixels*, not as a
 * ratio: 60 pixels cannot hide a moved element or a changed colour, which is
 * what these snapshots are for.
 */
const RASTERISATION = { maxDiffPixels: 60 }

// Deliberate baseline updates require inspecting the resulting images.
for (const theme of ['light', 'dark']) {
  for (const width of [390, 768, 1440]) {
    test(`analytics visual ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto('/pages/analytics/fullscreen')
      await page.getByRole('button', { name: theme, exact: true }).click()
      await expect(
        page.locator('[data-slot="chart-card"] svg').first(),
      ).toBeVisible()
      await settledCharts(page)
      await expect(page).toHaveScreenshot(`analytics-${theme}-${width}.png`, {
        fullPage: true,
        animations: 'disabled',
        ...CHART_NOISE,
      })
    })
  }
  test(`reference and states visual ${theme}`, async ({ page }) => {
    await page.goto('/atoms/button')
    await page.getByRole('button', { name: theme, exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Solid', exact: true }),
    ).toBeVisible()
    await expect(page).toHaveScreenshot(`reference-${theme}.png`, {
      animations: 'disabled',
      ...RASTERISATION,
    })
    await page.goto(`/spec?theme=${theme}`)
    await expect(
      page.getByRole('button', { name: 'Save', exact: true }),
    ).toBeVisible()
    await expect(
      page.locator('[data-slot="visual-form-states"]'),
    ).toHaveScreenshot(`form-states-${theme}.png`, RASTERISATION)
    await page.getByRole('button', { name: 'Open dialog', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    const background = await page
      .getByRole('dialog')
      .evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(background).not.toBe('rgba(0, 0, 0, 0)')
    await expect(page).toHaveScreenshot(`overlay-${theme}.png`, {
      animations: 'disabled',
      ...RASTERISATION,
    })
  })
}

test('collapsed application sidebar keeps one aligned content column', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/pages/analytics/fullscreen')
  const sidebar = page.locator('[data-slot="app-shell-sidebar"]')
  const content = page.locator('[data-slot="app-shell-content"]')
  await expect(sidebar).toBeVisible()
  await expect(page).toHaveScreenshot('app-shell-expanded.png', CHART_NOISE)

  await sidebar.getByRole('button', { name: 'Collapse' }).click()
  await expect(sidebar).toHaveCSS('width', '56px')
  await expect
    .poll(() =>
      content.evaluate((element) => element.getBoundingClientRect().left),
    )
    .toBe(56)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    ),
  ).toBeLessThanOrEqual(1)
  await expect(page).toHaveScreenshot('app-shell-collapsed.png', CHART_NOISE)
})

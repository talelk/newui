import { expect, test } from '@playwright/test'

const WIDTHS = [320, 390, 768, 1024, 1280, 1440]

test('filter controls, KPI cards and the page grid keep one rhythm across widths', async ({
  page,
}) => {
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/pages/analytics/fullscreen')

    const filters = page.locator('[data-slot="filter-bar"]')
    await expect(filters).toBeVisible()
    // Field peers share the sm field height. The bar's Switch also stamps
    // data-size (hook uniformity), but a toggle row is label-height, not a
    // field-height peer — pin its hook, exclude it from the height parity.
    await expect(
      filters.locator('[data-slot="switch-root"][data-size="sm"]'),
    ).toHaveCount(1)
    const controls = filters.locator(
      '[data-size="sm"]:not([data-slot="switch-root"])',
    )
    await expect(controls).toHaveCount(3)
    const demo = page
      .locator('[data-slot="app-shell-header"]')
      .locator('[data-slot="select-control"]')
    await expect(demo).toBeVisible()
    const heights = await controls.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().height),
    )
    heights.push(
      await demo.evaluate((element) => element.getBoundingClientRect().height),
    )
    expect(
      Math.max(...heights) - Math.min(...heights),
      `${width}px control height drift`,
    ).toBeLessThanOrEqual(1)

    const cards = page.locator('[data-slot="number-card"]')
    expect(await cards.count()).toBeGreaterThanOrEqual(4)
    const widths = await cards.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().width),
    )
    const minimumKpiWidth = width >= 360 && width < 640 ? 150 : 180
    expect(Math.min(...widths), `${width}px KPI width`).toBeGreaterThanOrEqual(
      minimumKpiWidth,
    )
    if (width === 390) {
      const tops = await cards.evaluateAll((elements) =>
        elements
          .slice(0, 2)
          .map((element) => element.getBoundingClientRect().top),
      )
      expect(tops[0], 'phone KPIs share a two-up row').toBe(tops[1])
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow, `${width}px page overflow`).toBeLessThanOrEqual(1)
  }
})

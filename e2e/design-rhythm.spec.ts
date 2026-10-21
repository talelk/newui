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
    const controls = filters.locator('[data-size="sm"]')
    await expect(controls).toHaveCount(4)
    const heights = await controls.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().height),
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
    expect(Math.min(...widths), `${width}px KPI width`).toBeGreaterThanOrEqual(
      180,
    )

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow, `${width}px page overflow`).toBeLessThanOrEqual(1)
  }
})

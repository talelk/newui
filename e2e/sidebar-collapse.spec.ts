import { expect, test } from '@playwright/test'
import { gotoStory, storyIdFor } from './_lib/stories'

/**
 * Sidebar collapse, exercised where it can actually break: in rendered CSS.
 *
 * The unit tests prove the state machine (toggle → `onCollapsedChange`,
 * ⌘B). What they cannot see is the failure that shipped once already — the
 * state flipping while no width anywhere changed: the examples composed
 * `SidebarItem` rows without a `Sidebar` root, and `AppSidebar` never
 * rendered a toggle, so "collapse" had no visible cause or effect outside
 * the component demo. These tests click the real buttons and measure the
 * rendered column.
 */

const widthOf = (locator: import('@playwright/test').Locator) =>
  locator.evaluate((el) => el.getBoundingClientRect().width)

test.describe('sidebar collapse', () => {
  test('the component demo collapses to icons', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await gotoStory(page, storyIdFor('Sidebar'))

    const nav = page.locator('[data-slot="sidebar"]').first()
    await expect(nav).toBeVisible()
    expect(await widthOf(nav)).toBeGreaterThan(200)

    await page.getByRole('button', { name: 'Collapse', exact: true }).click()
    await expect(nav).toHaveAttribute('data-state', 'collapsed')
    await expect.poll(() => widthOf(nav), { timeout: 2000 }).toBeLessThan(64)
  })

  test('AppSidebar carries a working toggle (Discussions)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/pages/discussions/fullscreen')

    const nav = page.locator(
      '[data-slot="app-shell-sidebar"] [data-slot="sidebar"]',
    )
    await expect(nav).toBeVisible()
    expect(await widthOf(nav)).toBeGreaterThan(200)

    await page.getByRole('button', { name: 'Collapse', exact: true }).click()
    await expect(nav).toHaveAttribute('data-state', 'collapsed')
    await expect.poll(() => widthOf(nav), { timeout: 2000 }).toBeLessThan(64)
  })

  test('an example workspace sidebar folds and expands by button', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/pages/deals/fullscreen')

    const nav = page.locator(
      '[data-slot="app-shell-sidebar"] [data-slot="sidebar"]',
    )
    await expect(nav).toBeVisible()
    const column = nav.locator('..')
    const content = page.locator('[data-slot="app-shell-content"]')
    expect(await widthOf(column)).toBeGreaterThan(180)
    await expect(nav.getByText('Pinned views', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Collapse', exact: true }).click()
    await expect(nav).toHaveAttribute('data-state', 'collapsed')
    await expect(nav.getByText('Pinned views', { exact: true })).toHaveCount(0)
    await expect(nav.getByText('Notifications', { exact: true })).toHaveClass(
      /sr-only/,
    )
    await expect.poll(() => widthOf(column), { timeout: 2000 }).toBeLessThan(90)
    await expect
      .poll(() =>
        content.evaluate((element) => element.getBoundingClientRect().left),
      )
      .toBeCloseTo(56, 0)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBeLessThanOrEqual(1)

    await page.getByRole('button', { name: 'Expand', exact: true }).click()
    await expect(nav).toHaveAttribute('data-state', 'expanded')
    await expect
      .poll(() => widthOf(column), { timeout: 2000 })
      .toBeGreaterThan(180)
  })

  test('the drawer below lg stays expanded and offers no fold', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/pages/deals/fullscreen')

    await page
      .getByRole('button', { name: 'Open application navigation' })
      .click()
    const drawer = page.locator('[data-slot="app-shell-drawer"]')
    await expect(drawer).toBeVisible()

    const nav = drawer.locator('[data-slot="sidebar"]')
    await expect(nav).toHaveAttribute('data-state', 'expanded')
    await expect(
      drawer.getByRole('button', { name: 'Deals', exact: true }),
    ).toBeVisible()
    await expect(
      drawer.getByRole('button', { name: 'Close navigation', exact: true }),
    ).toBeVisible()
    await expect(drawer.getByRole('button', { name: 'Collapse' })).toHaveCount(
      0,
    )
  })
})

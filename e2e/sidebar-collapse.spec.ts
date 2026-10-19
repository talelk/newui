import { expect, test } from '@playwright/test'

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
  test('the component demo folds to its rail', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/play?c=Sidebar')

    const nav = page.locator('[data-slot="sidebar"]')
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
    await page.goto('/examples/discussions/fullscreen')

    const nav = page.locator('[data-slot="sidebar"]')
    await expect(nav).toBeVisible()
    expect(await widthOf(nav)).toBeGreaterThan(200)

    await page.getByRole('button', { name: 'Collapse', exact: true }).click()
    await expect(nav).toHaveAttribute('data-state', 'collapsed')
    await expect.poll(() => widthOf(nav), { timeout: 2000 }).toBeLessThan(64)
  })

  test('an example workspace sidebar folds, by button and by Ctrl+B', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/examples/deals/fullscreen')

    const nav = page.locator('[data-slot="sidebar"]')
    await expect(nav).toBeVisible()
    const column = nav.locator('..')
    expect(await widthOf(column)).toBeGreaterThan(180)

    await page.getByRole('button', { name: 'Collapse', exact: true }).click()
    await expect(nav).toHaveAttribute('data-state', 'collapsed')
    await expect.poll(() => widthOf(column), { timeout: 2000 }).toBeLessThan(90)

    // Back open by keyboard, then folded again — the shortcut the fix is for.
    await page.keyboard.press('Control+b')
    await expect(nav).toHaveAttribute('data-state', 'expanded')
    await expect
      .poll(() => widthOf(column), { timeout: 2000 })
      .toBeGreaterThan(180)
  })

  test('the drawer below lg stays expanded and offers no fold', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/examples/deals/fullscreen')

    await page
      .getByRole('button', { name: 'Toggle workspace navigation' })
      .click()
    const drawer = page.locator('[data-slot="responsive-shell-drawer"]')
    await expect(drawer).toBeVisible()

    const nav = drawer.locator('[data-slot="sidebar"]')
    await expect(nav).toHaveAttribute('data-state', 'expanded')
    await expect(
      drawer.getByRole('button', { name: 'Deals', exact: true }),
    ).toBeVisible()
    await expect(
      drawer.getByRole('button', { name: 'Collapse', exact: true }),
    ).toBeHidden()
  })
})

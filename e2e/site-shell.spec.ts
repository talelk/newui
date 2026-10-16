import { expect, test } from '@playwright/test'

/**
 * The site's own chrome: the sidebar's fold, and ⌘K.
 *
 * The sidebar is markup rather than the library's `Sidebar` (the shell renders
 * on every route, so the parts it uses are paid for by the home page), which
 * means the behaviour it borrows has to be checked here rather than assumed.
 */

test('the sidebar folds to a rail and back, and remembers', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/components/button')

  const sidebar = page.locator('[data-slot="site-sidebar"]')
  await expect(sidebar).toHaveAttribute('data-collapsed', 'false')
  await expect(page.getByText('Documentation', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  await expect(sidebar).toHaveAttribute('data-collapsed', 'true')
  // A rail: the section names are gone, their icons are not.
  await expect(page.getByText('Documentation', { exact: true })).toBeHidden()
  await expect(page.getByRole('button', { name: 'Components' })).toBeVisible()

  await page.reload()
  await expect(sidebar).toHaveAttribute('data-collapsed', 'true')

  await page.getByRole('button', { name: 'Expand sidebar' }).click()
  await expect(sidebar).toHaveAttribute('data-collapsed', 'false')
})

test('⌘B folds the sidebar, and ⌘K opens the commands', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/components/button')

  const sidebar = page.locator('[data-slot="site-sidebar"]')
  await page.keyboard.press('Meta+b')
  await expect(sidebar).toHaveAttribute('data-collapsed', 'true')
  await page.keyboard.press('Meta+b')
  await expect(sidebar).toHaveAttribute('data-collapsed', 'false')

  await page.keyboard.press('Meta+k')
  const field = page.getByRole('combobox', { name: 'Find a page' })
  await expect(field).toBeFocused()

  await field.fill('kanban')
  await expect(page.getByRole('option', { name: /KanbanBoard/ })).toBeVisible()
  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(/\/blocks\/kanban-board$/)
  await expect(
    page.getByRole('heading', { name: 'KanbanBoard', level: 1 }),
  ).toBeVisible()
})

test('the commands reach actions as well as pages', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/docs')

  await page.keyboard.press('Meta+k')
  await page.getByRole('combobox', { name: 'Find a page' }).fill('dark')
  await page.getByRole('option', { name: 'Switch to dark' }).click()

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('the registry sections bring one filter, not two', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  // The mobile drawer renders the same tree, so every query is scoped to the
  // desktop sidebar.
  const sidebar = page.locator('[data-slot="site-sidebar"]')

  // Components ships its own index filter; the shell's page filter would sit
  // directly above it.
  await page.goto('/components/button')
  await expect(sidebar.getByPlaceholder('Filter pages')).toBeHidden()
  await expect(sidebar.getByPlaceholder('Filter…')).toBeVisible()

  // A section without an index keeps the shell's filter.
  await page.goto('/docs')
  await sidebar.getByPlaceholder('Filter pages').fill('tokens')
  await expect(
    sidebar.getByRole('link', { name: 'Design tokens' }),
  ).toBeVisible()
})

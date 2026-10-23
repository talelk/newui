import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * The starter is a second application on its own origin, so these tests name it
 * by URL rather than using the site's `baseURL`. What they assert is the promise
 * the skeleton makes: a collection that loads, a validated create, an optimistic
 * status change, a destructive action that asks, a demo session and a settings
 * form — every one of them assembled only from public kit surfaces.
 */
const STARTER = process.env['NEWUI_STARTER_URL'] ?? 'http://localhost:4183'

const rows = (page: import('@playwright/test').Page) =>
  page.locator('[data-slot="data-table"] tbody tr')

test('the starter loads its collection inside the app frame', async ({
  page,
}) => {
  await page.goto(`${STARTER}/`)
  await expect(
    page.getByRole('heading', { name: 'Projects, at a glance' }),
  ).toBeVisible()
  await expect(rows(page)).toHaveCount(8)
  await expect(page.getByText('24 results')).toBeVisible()
  // One integrated sidebar contains the starter's workspace destinations.
  await expect(
    page.getByRole('navigation', { name: 'Starter navigation' }).first(),
  ).toBeVisible()
})

test('the app shell is one collapsed sidebar at desktop width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(`${STARTER}/`)
  const sidebar = page.locator('[data-slot="app-shell-sidebar"]')
  await expect(sidebar).toBeVisible()
  await expect(page.locator('[data-slot="app-shell-drawer"]')).toBeHidden()
  await expect(sidebar).toContainText('Acme workspace')
  await expect(sidebar).toContainText('Acme · Production')
  await expect(sidebar).toContainText('Settings')
  await expect(sidebar).toContainText('Guest')
  await expect(page.locator('[data-slot="sidebar-rail"]')).toHaveCount(0)

  await sidebar.getByRole('button', { name: 'Collapse' }).click()
  await expect(sidebar).toHaveCSS('width', '56px')
  await expect(sidebar.getByRole('link', { name: 'Projects' })).toHaveAttribute(
    'aria-label',
    'Projects',
  )
  await expect(
    sidebar.getByRole('button', { name: 'Switch tenant' }),
  ).toBeVisible()
})

test('the same sidebar opens expanded as a mobile drawer with its tenant picker', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${STARTER}/`)
  await expect(page.locator('[data-slot="app-shell-sidebar"]')).toHaveCount(0)
  await expect(page.locator('[data-slot="app-shell-drawer"]')).toBeHidden()
  await page
    .getByRole('button', { name: 'Open application navigation' })
    .click()
  const drawer = page.getByRole('dialog', { name: 'Starter navigation' })
  await expect(drawer).toBeVisible()
  await expect(drawer).toContainText('Acme workspace')
  await expect(drawer).toContainText('Projects')
  await expect(drawer).toContainText('Settings')
  await expect(drawer).toContainText('Guest')
  await expect(page.locator('[data-slot="sidebar-rail"]')).toHaveCount(0)

  await drawer.getByRole('button', { name: /Acme · Production/ }).click()
  await page.getByRole('menuitem', { name: 'Acme · Staging' }).click()
  await expect(drawer).toBeVisible()
  await expect(drawer).toContainText('Projects')

  await drawer.getByRole('button', { name: 'Close navigation' }).click()
  await expect(drawer).toBeHidden()
})

test('creates a project through the validated form', async ({ page }) => {
  await page.goto(`${STARTER}/`)
  await expect(rows(page)).toHaveCount(8)

  await page.getByRole('button', { name: 'New project' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('New project')

  // An empty submit is refused by the field, not by the browser.
  await dialog.getByRole('button', { name: 'Create project' }).click()
  await expect(dialog).toContainText('Give the project a name.')

  await dialog.getByLabel('Name').fill('New audit trail')
  await dialog.getByLabel('Budget').fill('12000')
  await dialog.getByRole('button', { name: 'Create project' }).click()

  await expect(dialog).toBeHidden()
  await expect(page.getByText('New audit trail was created.')).toBeVisible()
  await page
    .getByRole('searchbox', { name: 'Search projects' })
    .fill('New audit')
  await expect(rows(page)).toHaveCount(1)
  await expect(rows(page).first()).toContainText('New audit trail')
  await expect(rows(page).first()).toContainText('$12,000')
})

test('changes a status optimistically and deletes after confirming', async ({
  page,
}) => {
  await page.goto(`${STARTER}/`)
  await expect(rows(page)).toHaveCount(8)
  await page.getByRole('searchbox', { name: 'Search projects' }).fill('Ledger')
  await expect(rows(page)).toHaveCount(1)

  await rows(page)
    .first()
    .getByRole('button', { name: 'Ledger migration' })
    .click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('PRJ-001')

  await dialog.getByRole('combobox', { name: 'Status' }).click()
  await page.getByRole('option', { name: 'Paused', exact: true }).click()
  await dialog.getByRole('button', { name: 'Save status' }).click()

  await expect(dialog).toBeHidden()
  await expect(rows(page).first()).toContainText('Paused')

  await rows(page)
    .first()
    .getByRole('button', { name: 'Ledger migration' })
    .click()
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Delete this project' }).click()
  await dialog.getByRole('button', { name: 'Delete forever' }).click()
  await expect(dialog).toBeHidden()
  await expect(rows(page)).toHaveCount(0)
  await expect(page.getByText('Ledger migration was deleted.')).toBeVisible()
})

test('filters by status and clears the filter', async ({ page }) => {
  await page.goto(`${STARTER}/`)
  await expect(rows(page)).toHaveCount(8)

  await page.getByRole('combobox', { name: 'Status' }).click()
  await page.getByRole('option', { name: 'Paused', exact: true }).click()
  await expect(page.getByText('8 results')).toBeVisible()
  await expect(page.getByText('Status: Paused')).toBeVisible()

  await page.getByRole('button', { name: 'Clear all' }).click()
  await expect(page.getByText('24 results')).toBeVisible()
})

test('signs in through the demo session and out again', async ({ page }) => {
  await page.goto(`${STARTER}/sign-in`)
  await expect(
    page.getByRole('heading', { name: 'Sign in to Acme' }),
  ).toBeVisible()

  const form = page.locator('form')
  await form.getByRole('button', { name: 'Sign in' }).click()
  await expect(form).toContainText('Use at least 8 characters.')

  await form.locator('input[type="password"]').fill('supersecret')
  await form.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(`${STARTER}/`)
  await page.getByRole('button', { name: 'Rhea Kapoor' }).click()
  await page.getByRole('menuitem', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(`${STARTER}/sign-in`)
})

test('saves the settings form', async ({ page }) => {
  await page.goto(`${STARTER}/settings`)
  await expect(
    page.getByRole('heading', { name: 'Workspace settings' }),
  ).toBeVisible()

  const name = page.getByLabel('Workspace name')
  await name.fill('')
  await page.getByRole('button', { name: 'Save settings' }).click()
  await expect(page.getByText('Name the workspace.')).toBeVisible()

  await name.fill('Acme Labs')
  await page.getByRole('button', { name: 'Save settings' }).click()
  await expect(page.getByText('Settings saved.')).toBeVisible()
})

test('the production starter ships no devtools UI or source annotations', async ({
  page,
}) => {
  await page.goto(`${STARTER}/`)
  await expect(
    page.getByRole('heading', { name: 'Projects, at a glance' }),
  ).toBeVisible()

  // `@tanstack/devtools-vite` defaults to removing the adapter import, its JSX
  // and the panel imports from a build. A trigger or a `data-tsd-source`
  // attribute in the production bundle means that stripping regressed.
  await expect(
    page.getByRole('button', { name: 'Open TanStack Devtools' }),
  ).toHaveCount(0)
  await expect(page.getByText('Acme runtime')).toHaveCount(0)
  await expect(page.locator('[data-tsd-source]')).toHaveCount(0)
})

test('the starter is accessible and does not overflow a phone', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${STARTER}/`)
  await expect(rows(page)).toHaveCount(8)

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1)

  const results = await new AxeBuilder({ page }).analyze()
  expect(
    results.violations.filter(
      (violation) =>
        violation.impact === 'serious' || violation.impact === 'critical',
    ),
  ).toEqual([])
})

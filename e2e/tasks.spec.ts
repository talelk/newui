import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('mobile task lists paginate the scale fixture, sort and open the final record', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/pages/tasks/fullscreen')
  const list = page.locator('[data-slot="mobile-task-list"]')
  await expect(list.locator('li').first()).toContainText('TASK-1001')
  await list.getByRole('button', { name: 'Next page', exact: true }).click()
  await expect(list.locator('li').first()).toContainText('TASK-1031')
  await page.getByRole('combobox', { name: 'Sort task list' }).click()
  await page.getByRole('option', { name: 'Title', exact: true }).click()
  await expect(list).toContainText('1–30 of 1000')
  await page
    .getByRole('searchbox', { name: 'Find tasks', exact: true })
    .fill('TASK-2000')
  await expect(list.locator('li')).toHaveCount(1)
  await list.locator('li button').click()
  await expect(page.getByRole('dialog')).toContainText('TASK-2000')
})

test('task table filters, sorts, paginates, hides columns and completes selected rows', async ({
  page,
}) => {
  await page.goto('/pages/tasks/fullscreen')
  const rows = page.locator('[data-slot="data-table"] tbody tr')
  await expect(rows).toHaveCount(10)
  const first = await rows.first().innerText()
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await expect(rows.first()).not.toHaveText(first)
  await page.getByRole('searchbox', { name: 'Find tasks' }).fill('TASK-1001')
  await expect(rows).toHaveCount(1)
  await page
    .getByRole('checkbox', { name: 'Select TASK-1001', exact: true })
    .check()
  await page.getByRole('button', { name: 'Complete selected (1)' }).click()
  await expect(rows.first()).toContainText('Done')
  await expect(
    page.getByText('1 task marked complete.', { exact: true }),
  ).toBeVisible()
  await page.getByRole('searchbox', { name: 'Find tasks' }).fill('')
  await page.getByRole('button', { name: 'Title', exact: true }).click()
  await expect(
    page.getByRole('columnheader', { name: 'Title', exact: true }),
  ).toHaveAttribute('aria-sort', 'ascending')
  await page.getByText('Columns', { exact: true }).click()
  await page.getByRole('checkbox', { name: 'owner', exact: true }).uncheck()
  await expect(
    page.getByRole('columnheader', { name: 'Assignee', exact: true }),
  ).toHaveCount(0)
})

test('task creation validates before saving and survives query reloads', async ({
  page,
}) => {
  await page.goto('/pages/tasks/fullscreen')
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await page.getByRole('button', { name: 'New task', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Create task', exact: true }).click()
  await expect(dialog.getByRole('alert')).toContainText('at least 3 characters')
  await dialog
    .getByRole('textbox', { name: 'Task title', exact: false })
    .fill('Validate the launch checklist')
  await dialog.getByRole('button', { name: 'Create task', exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(page.locator('tbody tr').first()).toContainText(
    'Validate the launch checklist',
  )
  await page.getByRole('button', { name: 'Refresh', exact: true }).click()
  await expect(page.locator('tbody tr').first()).toContainText(
    'Validate the launch checklist',
  )
  await page
    .getByText('Explore loading and error states', { exact: true })
    .click()
  await page.getByRole('button', { name: 'Simulate service error' }).click()
  await expect(
    page.getByText('Could not load tasks', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await expect(page.locator('tbody tr').first()).toContainText(
    'Validate the launch checklist',
  )
})

test('the activity stream keeps a bounded DOM while reaching all 1000 tasks', async ({
  page,
}) => {
  await page.goto('/pages/tasks/fullscreen')
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await page.getByRole('radio', { name: 'Activity', exact: true }).click()
  const feed = page.locator('[data-slot="virtual-list"]')
  await expect(feed.locator('li').first()).toBeVisible()
  expect(await feed.locator('li').count()).toBeLessThan(30)
  await feed.focus()
  await page.keyboard.press('End')
  await expect(feed).toContainText('TASK-2000')
  expect(await feed.locator('li').count()).toBeLessThan(30)
})

for (const theme of ['light', 'dark']) {
  test(`task workspace is accessible at 390px in ${theme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto('/pages/tasks/fullscreen')
    await expect(page.locator('tbody tr')).toHaveCount(10)
    await page.evaluate(
      (value) => document.documentElement.setAttribute('data-theme', value),
      theme,
    )
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1)
    const result = await new AxeBuilder({ page }).analyze()
    expect(result.violations).toEqual([])
  })
}

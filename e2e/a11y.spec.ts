import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Accessibility on real CSS.
 *
 * Unlike the jsdom axe run, this one has layout and computed styles, so the
 * colour-contrast rules are active — it is the end-to-end check on the contrast
 * contract the token tests assert in isolation.
 */
for (const theme of ['light', 'dark'] as const) {
  test(`no serious axe violations (${theme})`, async ({ page }) => {
    await page.goto(`/spec?theme=${theme}`)
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()

    const results = await new AxeBuilder({ page }).analyze()
    const serious = results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id} (${v.nodes.length})`)

    expect(serious).toEqual([])
  })
}

test('every interactive control has an accessible name', async ({ page }) => {
  await page.goto('/spec')
  const results = await new AxeBuilder({ page })
    .withRules(['button-name', 'label', 'aria-input-field-name'])
    .analyze()
  expect(results.violations).toEqual([])
})

test('the open combobox listbox is named', async ({ page }) => {
  await page.goto('/spec')
  // The listbox only exists while open, so its accessible name needs its own
  // pass — the page-load axe run never sees it.
  await page.getByRole('combobox', { name: 'Assignee' }).click()
  await expect(page.getByRole('option').first()).toBeVisible()

  const results = await new AxeBuilder({ page })
    .withRules(['aria-input-field-name'])
    .analyze()
  expect(results.violations).toEqual([])
})

test('the open date-picker calendar has no serious violations', async ({
  page,
}) => {
  await page.goto('/spec')
  await page.getByRole('textbox', { name: 'Due date' }).click()
  await expect(page.getByRole('grid')).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()
  const serious = results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id} (${v.nodes.length})`)
  expect(serious).toEqual([])
})

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('discussion account actions mutate local communities and retain settings while resizing', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/examples/discussions/fullscreen')
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('tab', { name: 'Communities', exact: true }).click()
  await page.getByRole('button', { name: 'New community', exact: true }).click()
  const action = page.getByRole('dialog').filter({
    has: page.getByRole('heading', { name: 'New community', exact: true }),
  })
  await action
    .getByRole('textbox', { name: 'Community name' })
    .fill('Customer success')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(
    action.getByRole('textbox', { name: 'Community name' }),
  ).toHaveValue('Customer success')
  await action.getByRole('button', { name: 'Save local changes' }).click()
  await expect(
    page.getByRole('button', {
      name: 'Community options for Customer success',
    }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Community options for Customer success' })
    .click()
  await page
    .getByRole('button', { name: 'Archive community', exact: true })
    .click()
  await expect(
    page.getByRole('button', {
      name: 'Community options for Customer success',
    }),
  ).toHaveCount(0)
})

for (const layout of ['desktop', 'mobile']) {
  test(`discussions ${layout} creates, searches, replies and reads local conversations`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: layout === 'mobile' ? 390 : 1440,
      height: 900,
    })
    await page.goto('/examples/discussions/fullscreen')
    await page
      .getByRole('button', {
        name: layout === 'desktop' ? 'Add new' : 'New discussion',
        exact: true,
      })
      .click()
    await page
      .getByRole('button', { name: 'Post discussion', exact: true })
      .click()
    await expect(page.getByRole('alert')).toHaveCount(2)
    await page
      .getByRole('textbox', { name: 'Discussion title' })
      .fill('Plan the October release')
    await page
      .getByRole('textbox', { name: 'Discussion message' })
      .fill('Let us review the release checklist together.')
    await page
      .getByRole('button', { name: 'Post discussion', exact: true })
      .click()
    await expect(page.getByRole('dialog')).toBeHidden()
    if (layout === 'mobile')
      await page.getByRole('button', { name: 'Search', exact: true }).click()
    // Desktop searches through the FilterBar (a searchbox); mobile keeps a
    // labelled TextInput (a textbox).
    await page
      .getByRole(layout === 'mobile' ? 'textbox' : 'searchbox', {
        name: 'Search discussions',
      })
      .fill('October release')
    await page
      .getByRole('button', { name: 'Plan the October release', exact: true })
      .click()
    await page
      .getByRole('textbox', { name: 'Discussion reply' })
      .fill('I will prepare the accessibility review.')
    await page.getByRole('button', { name: 'Post reply', exact: true }).click()
    await expect(page.getByRole('dialog')).toContainText(
      'I will prepare the accessibility review.',
    )
    expect(
      (await new AxeBuilder({ page }).include('[role="dialog"]').analyze())
        .violations,
    ).toEqual([])
    await page.keyboard.press('Escape')
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    if (layout === 'mobile') {
      await page
        .getByRole('button', { name: 'Notifications', exact: true })
        .click()
      await page.getByRole('button', { name: 'Mark all as read' }).click()
      await expect(
        page.getByText('No discussions match this space and filter.'),
      ).toBeVisible()
    }
  })
}

test('workspace settings validates, saves, discards edits and retains notification choice', async ({
  page,
}) => {
  await page.goto('/examples/settings/fullscreen')
  await page.getByRole('button', { name: 'Open settings' }).click()
  await page.getByRole('textbox', { name: 'Display name' }).fill('')
  await page
    .getByRole('textbox', { name: 'Email', exact: true })
    .fill('invalid')
  await page.getByRole('button', { name: 'Save profile' }).click()
  await expect(page.getByRole('alert')).toHaveCount(2)
  await page.getByRole('textbox', { name: 'Display name' }).fill('Jordan Lee')
  await page
    .getByRole('textbox', { name: 'Email', exact: true })
    .fill('jordan@example.com')
  await page.getByRole('button', { name: 'Save profile' }).click()
  await expect(page.getByRole('status')).toContainText('Profile saved locally')
  await page.getByRole('tab', { name: /Profile$/ }).focus()
  await page.keyboard.press('ArrowDown')
  await expect(
    page.getByRole('tab', { name: 'Notifications' }),
  ).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('switch', { name: 'Email digests' }).press('Space')
  await page.getByRole('tab', { name: /Profile$/ }).click()
  await page
    .getByRole('textbox', { name: 'Display name' })
    .fill('Discard this edit')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Open settings' }).click()
  await expect(page.getByRole('textbox', { name: 'Display name' })).toHaveValue(
    'Jordan Lee',
  )
  await page.getByRole('tab', { name: 'Notifications' }).click()
  await expect(
    page.getByRole('switch', { name: 'Email digests' }),
  ).not.toBeChecked()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

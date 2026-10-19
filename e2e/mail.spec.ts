import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('desktop mail navigation collapses and pane resizing preserves the inbox', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/examples/mail/fullscreen')
  const navigation = page.getByRole('navigation', {
    name: 'Mailboxes',
    exact: true,
  })
  await expect(navigation).toBeVisible()
  await page.getByRole('button', { name: 'Toggle mail navigation' }).click()
  await expect(navigation).toBeHidden()
  const list = page.getByRole('region', { name: 'Conversation list' })
  const before = await list.boundingBox()
  const handle = page.getByRole('slider', { name: 'Inbox pane width' })
  await handle.focus()
  await page.keyboard.press('End')
  await expect(handle).toHaveAttribute('aria-valuenow', '70')
  expect((await list.boundingBox())?.width).toBeGreaterThan(before?.width ?? 0)
  await expect(list).toContainText('September launch checklist')
})

test('account switching preserves each inbox and mobile mailbox sheets navigate', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/examples/mail/fullscreen')
  const account = page.getByRole('combobox', { name: 'Mail account' })
  await account.click()
  await page.getByRole('option', { name: 'team@acme.com', exact: true }).click()
  await expect(
    page.getByRole('region', { name: 'Conversation list' }),
  ).toContainText('Team:')
  await page.getByRole('button', { name: 'Mailboxes · Inbox' }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /^Drafts/ })
    .click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(
    page.getByRole('button', { name: 'Mailboxes · Drafts' }),
  ).toBeVisible()
  await account.click()
  await page.getByRole('option', { name: 'rhea@acme.com', exact: true }).click()
  await expect(
    page.getByRole('region', { name: 'Conversation list' }),
  ).not.toContainText('Team:')
})

test('mail filters, stars, replies, archives and undoes local changes', async ({
  page,
}) => {
  await page.goto('/examples/mail/fullscreen')
  const search = page.getByRole('searchbox', { name: 'Search conversations' })
  await search.fill('launch checklist')
  const starred = page.getByRole('button', {
    name: 'Unstar September launch checklist',
    exact: true,
  })
  await expect(starred).toHaveAttribute('aria-pressed', 'true')
  const selectedColor = await starred.evaluate(
    (el) => getComputedStyle(el).color,
  )
  await starred.click()
  await expect(
    page.getByRole('button', {
      name: 'Star September launch checklist',
      exact: true,
    }),
  ).toHaveAttribute('aria-pressed', 'false')
  await expect
    .poll(() =>
      page
        .getByRole('button', {
          name: 'Star September launch checklist',
          exact: true,
        })
        .evaluate((el) => getComputedStyle(el).color),
    )
    .not.toBe(selectedColor)
  await expect(
    page.getByRole('list', { name: 'Conversations' }).getByRole('listitem'),
  ).toHaveCount(1)
  await page
    .getByRole('button', {
      name: /^Open .*September launch checklist/,
    })
    .click()
  await page
    .getByRole('textbox', { name: 'Reply message' })
    .fill('Reviewed and ready for Thursday.')
  await page.getByRole('button', { name: 'Send demo reply' }).click()
  await expect(
    page.getByRole('region', { name: 'Reading pane' }),
  ).toContainText('Reviewed and ready for Thursday.')
  await page.getByRole('button', { name: 'Archive conversation' }).click()
  await expect(page.getByRole('status')).toContainText('moved to archive')
  await page.getByRole('button', { name: 'Undo mail action' }).click()
  await expect(
    page.getByRole('button', {
      name: /^Open .*September launch checklist/,
    }),
  ).toBeVisible()
  await search.fill('no matching mail')
  await expect(
    page.getByText('No conversations here', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clear mail filters' }).click()
  await expect(
    page.getByRole('list', { name: 'Conversations' }).getByRole('listitem'),
  ).toHaveCount(12)
})

test('mail saves a draft and validates before sending it locally', async ({
  page,
}) => {
  await page.goto('/examples/mail/fullscreen')
  await page.getByRole('button', { name: 'Compose email' }).click()
  await page.getByRole('button', { name: 'Send demo email' }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await page
    .getByRole('textbox', { name: 'To', exact: false })
    .fill('ana@example.com')
  await page
    .getByRole('textbox', { name: 'Subject', exact: false })
    .fill('A quick hello')
  await page
    .getByRole('textbox', { name: 'Email message', exact: false })
    .fill('Looking forward to our next workshop.')
  await page.getByRole('button', { name: 'Save email draft' }).click()
  await page
    .getByRole('navigation', { name: 'Mailboxes' })
    .getByRole('button', { name: /^Drafts/ })
    .click()
  await page.getByRole('button', { name: /^Open .*A quick hello/ }).click()
  await expect(
    page.getByRole('textbox', { name: 'To', exact: false }),
  ).toHaveValue('ana@example.com')
  await page.getByRole('button', { name: 'Send demo email' }).click()
  await expect(page.getByRole('status')).toContainText(
    'No email left this page',
  )
  await page
    .getByRole('navigation', { name: 'Mailboxes' })
    .getByRole('button', { name: /^Sent/ })
    .click()
  await expect(
    page.getByRole('button', { name: /^Open .*A quick hello/ }),
  ).toBeVisible()
})

for (const theme of ['light', 'dark']) {
  test(`mail has accessible list and detail at 390px in ${theme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto('/examples/mail/fullscreen')
    await page.getByRole('button', { name: theme, exact: true }).click()
    await expect(
      page.getByRole('heading', { name: 'Your inbox, in focus' }),
    ).toBeVisible()
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    await page
      .getByRole('button', {
        name: /^Open .*September launch checklist/,
      })
      .click()
    await expect(
      page.getByRole('textbox', { name: 'Reply message' }),
    ).toBeVisible()
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight - innerHeight,
      ),
    ).toBeLessThan(1200)
    await page.getByRole('button', { name: 'Back to conversations' }).click()
    await expect(
      page.getByRole('searchbox', { name: 'Search conversations' }),
    ).toBeVisible()
  })
}

test('forward validates its recipient and creates a separate sent message', async ({
  page,
}) => {
  await page.goto('/examples/mail/fullscreen')
  await page
    .getByRole('button', {
      name: /^Open .*September launch checklist/,
    })
    .click()
  await page.getByRole('tab', { name: 'Forward', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Forward message' })
    .fill('Please review this checklist.')
  await page.getByRole('button', { name: 'Forward demo email' }).click()
  await expect(page.getByRole('alert')).toContainText('valid recipient')
  await page
    .getByRole('textbox', { name: 'Forward to' })
    .fill('reviewer@example.com')
  await page.getByRole('button', { name: 'Forward demo email' }).click()
  await page
    .getByRole('navigation', { name: 'Mailboxes' })
    .getByRole('button', { name: /^Sent/ })
    .click()
  await page
    .getByRole('button', { name: /^Open .*Fwd: September launch checklist/ })
    .click()
  const pane = page.getByRole('region', { name: 'Reading pane' })
  await expect(pane).toContainText('reviewer@example.com')
  await expect(pane).toContainText('Please review this checklist.')
  await expect(pane).toContainText('Forwarded message')
})

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('compose saves and restores a draft, previews, exports and publishes locally', async ({
  page,
}) => {
  await page.goto('/pages/compose/fullscreen')
  const title = page.getByRole('textbox', { name: 'Post title', exact: false })
  await title.fill('September product update')
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await title.fill('Unsaved change')
  await page.getByRole('button', { name: 'Restore saved draft' }).click()
  await expect(title).toHaveValue('September product update')
  await page.getByRole('tab', { name: 'Preview', exact: true }).click()
  await expect(
    page.getByRole('article', { name: 'Post preview' }),
  ).toContainText('A clearer way to work')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export Markdown' }).click()
  expect((await download).suggestedFilename()).toBe('acme-workspace-post.md')
  await page.getByRole('button', { name: 'Publish demo', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText(
    'September product update',
  )
  await page.getByRole('button', { name: 'Confirm publication' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(
    page.getByRole('status').filter({ hasText: 'published locally' }),
  ).toBeVisible()
})

test('segmented controls reverse horizontal keyboard movement in RTL', async ({
  page,
}) => {
  await page.goto('/pages/authentication/fullscreen')
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl'
  })
  const first = page.getByRole('tab', { name: 'Sign in', exact: true })
  await first.focus()
  await page.keyboard.press('ArrowRight')
  await expect(
    page.getByRole('tab', { name: 'Email link', exact: true }),
  ).toHaveAttribute('aria-selected', 'true')
})

for (const theme of ['light', 'dark']) {
  test(`mobile compose is accessible in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto('/pages/compose/fullscreen')
    await expect(
      page.getByRole('heading', { name: 'Compose a post' }),
    ).toBeVisible()
    await page.getByRole('button', { name: theme, exact: true }).click()
    await expect(page.getByRole('textbox', { name: 'Post body' })).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1)
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  })
}

test('publication requires content and keeps the draft editable after validation', async ({
  page,
}) => {
  await page.goto('/pages/compose/fullscreen')
  const body = page.getByRole('textbox', { name: 'Post body' })
  await body.fill('')
  await page.getByRole('button', { name: 'Publish demo', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Write some post content')
  await expect(page.getByRole('dialog')).toBeHidden()
  await body.fill('A short announcement for our team.')
  await page.getByRole('button', { name: 'Publish demo', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

for (const width of [390, 768, 1440]) {
  test(`compose edits links and restores them through history at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/pages/compose/fullscreen')
    const body = page.getByRole('textbox', { name: 'Post body' })
    await body.fill('Project brief')
    await body.press('ControlOrMeta+a')
    page.once('dialog', (dialog) => dialog.accept('https://example.com/brief'))
    await page.getByRole('button', { name: 'Link', exact: true }).click()
    await expect(body.locator('a')).toHaveAttribute(
      'href',
      'https://example.com/brief',
    )
    await page.getByRole('button', { name: 'Undo', exact: true }).click()
    await expect(body.locator('a')).toHaveCount(0)
    await page.getByRole('button', { name: 'Redo', exact: true }).click()
    await expect(body.locator('a')).toHaveAttribute(
      'href',
      'https://example.com/brief',
    )
    await page.getByRole('button', { name: 'Save draft', exact: true }).click()
    await body.fill('Unsaved edit')
    await page.getByRole('button', { name: 'Restore saved draft' }).click()
    await expect(body.locator('a')).toHaveAttribute(
      'href',
      'https://example.com/brief',
    )
  })
}

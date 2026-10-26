import { expect, test } from '@playwright/test'
import { gotoStory, storyIdFor } from './_lib/stories'

test.use({ reducedMotion: 'reduce' })

test('application preview preserves editing, comments and its document across all presets', async ({
  page,
}) => {
  await page.goto('/pages/tasks?viewport=mobile')
  const iframe = page.locator('iframe[title="Tasks preview"]')
  const app = page.frameLocator('iframe[title="Tasks preview"]')
  await expect(iframe).toHaveAttribute('width', '390')
  await expect(iframe).toHaveAttribute('height', '844')
  await app
    .getByRole('searchbox', { name: 'Find tasks', exact: true })
    .fill('TASK-1001')
  const task = app.getByRole('button', { name: 'Review the revenue dashboard' })
  // Activate from the keyboard: at this width the row sits below the fold
  // of the frame's inner scroller, where a synthesized click cannot land.
  await task.focus()
  await task.press('Enter')
  const title = app.getByRole('textbox', { name: 'Task title', exact: false })
  await title.fill('Review the shared task workflow')
  // Enter submits `task-detail-form`: at the mobile preset the dialog's Save
  // button sits below the preview stage's fold, where a synthesized click
  // cannot land — the keyboard path a real user has on the same form.
  await title.press('Enter')
  // Saving the detail returns to the table; reopen the renamed task to comment.
  await app
    .getByRole('button', { name: 'Review the shared task workflow' })
    .click()
  await app
    .getByRole('textbox', { name: 'Add comment' })
    .fill('Keep this comment when resizing.')
  // Tab exposes the next action through the host scrollport of the tall frame.
  await app.getByRole('textbox', { name: 'Add comment' }).press('Tab')
  await app.getByRole('button', { name: 'Post comment', exact: true }).click()
  await expect(app.getByRole('dialog')).toContainText(
    'Keep this comment when resizing.',
  )
  const frame = page
    .frames()
    .find((frame) => frame.url().includes('/tasks/fullscreen'))
  await frame?.evaluate(() => {
    ;(window as unknown as { previewIdentity: string }).previewIdentity =
      'persistent'
  })
  for (const [label, width, height] of [
    ['Tablet', 768, 900],
    ['Desktop', 1440, 900],
    ['Mobile', 390, 844],
  ] as const) {
    await page.getByRole('button', { name: label, exact: true }).click()
    await expect(iframe).toHaveAttribute('width', String(width))
    await expect(iframe).toHaveAttribute('height', String(height))
    await expect(app.getByRole('dialog')).toContainText(
      'Keep this comment when resizing.',
    )
    expect(
      await frame?.evaluate(
        () =>
          (window as unknown as { previewIdentity: string }).previewIdentity,
      ),
    ).toBe('persistent')
    expect(await frame?.evaluate(() => innerWidth)).toBe(width)
  }
  await page.evaluate(() => {
    document.documentElement.dataset['theme'] = 'dark'
    document.documentElement.dir = 'rtl'
  })
  await expect(app.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(app.locator('html')).toHaveAttribute('dir', 'rtl')
  await page.getByRole('button', { name: 'Source', exact: true }).click()
  await expect(page.locator('pre')).toContainText('TasksWorkspace')
  await page
    .getByRole('combobox', { name: 'Source file' })
    .selectOption('examples/tasks-data.ts')
  await expect(page.locator('pre')).toContainText('createTaskRepository')
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: 'Copy source', exact: true }).click()
  await expect(
    page.getByRole('status', { name: 'Source clipboard' }),
  ).toHaveText('Source copied')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'createTaskRepository',
  )
  await page.getByRole('button', { name: 'Copy all files' }).click()
  await expect(
    page.getByRole('status', { name: 'Source clipboard' }),
  ).toHaveText('All files copied')
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toContain('// pages/Tasks.tsx')
  expect(copied).toContain('// examples/tasks-data.ts')
  expect(copied).toContain('// examples/ActivityList.tsx')
  // The table and virtual list are organisms; the copied app uses their
  // package surface instead of carrying the library's implementation source.
  expect(copied).not.toContain('// examples/DataTable.tsx')
  expect(copied).toContain('@talelk/newui-organisms')
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(app.getByRole('dialog')).toContainText(
    'Keep this comment when resizing.',
  )
  await expect(
    page.getByRole('link', { name: 'Open fullscreen' }),
  ).toHaveAttribute('href', '/pages/tasks/fullscreen')
  await expect(page).toHaveURL(/viewport=mobile/)
  await page.getByRole('button', { name: 'Source', exact: true }).click()
  await expect(page.getByRole('combobox', { name: 'Source file' })).toHaveValue(
    'examples/tasks-data.ts',
  )
})

test('application source shows one responsive screen and settings', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/pages/discussions')
  await page.getByRole('button', { name: 'Source', exact: true }).click()
  const files = page.getByRole('combobox', { name: 'Source file' })
  for (const file of [
    'pages/Discussions.tsx',
    'pages/DiscussionsDesktop.tsx',
    'examples/DiscussionSettings.tsx',
  ]) {
    await files.selectOption(file)
    await expect(page.locator('pre')).toContainText('export function')
  }
  await expect(
    files.locator('option[value="pages/DiscussionsMobile.tsx"]'),
  ).toHaveCount(0)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1)
})

test('a source download failure leaves the application session usable', async ({
  page,
}) => {
  await page.goto('/pages/tasks')
  const app = page.frameLocator('iframe[title="Tasks preview"]')
  const search = app.getByRole('searchbox', { name: 'Find tasks', exact: true })
  await search.fill('TASK-1001')
  await page.route(/\/assets\/tasks-[^/]+\.js$/, (route) => route.abort())
  await page.getByRole('button', { name: 'Source', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText(
    'Source could not be loaded',
  )
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(search).toHaveValue('TASK-1001')
  await expect(
    app.getByRole('button', {
      name: 'Review the revenue dashboard',
      exact: true,
    }),
  ).toBeVisible()
})

test('block preview has an exact viewport and keeps its overlays in the frame', async ({
  page,
}) => {
  await page.goto('/organisms/auth-card?viewport=tablet')
  const iframe = page.locator('iframe')
  await expect(iframe).toHaveAttribute('src', /\/preview\/auth-card/)
  await expect(iframe).toHaveAttribute('width', '768')
  await expect(iframe).toHaveAttribute('height', '900')
  await page.getByRole('button', { name: 'Mobile', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(iframe).toHaveAttribute('width', '390')
  await expect(
    page.frameLocator('iframe').getByRole('textbox').first(),
  ).toBeVisible({ timeout: 15_000 })
})

test('bottom sheet supports drag threshold, cancellation and dismissal', async ({
  page,
}) => {
  await gotoStory(page, storyIdFor('BottomSheet'))
  await page.getByRole('button', { name: 'Open preferences drawer' }).click()
  const handle = page.locator('[data-slot="bottom-sheet-handle"]')
  const box = await handle.boundingBox()
  if (!box) throw new Error('Sheet handle did not render')
  await page.mouse.move(box.x + box.width / 2, box.y + 6)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, box.y + 46, { steps: 5 })
  await page.mouse.up()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.mouse.move(box.x + box.width / 2, box.y + 6)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, box.y + 126, { steps: 10 })
  await handle.dispatchEvent('pointercancel', { pointerId: 1 })
  await page.mouse.up()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.mouse.move(box.x + box.width / 2, box.y + 6)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, box.y + 126, { steps: 10 })
  await page.mouse.up()
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('sheet touch gestures respect scrolling, cancellation and dismissible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await gotoStory(page, storyIdFor('BottomSheet'))
  const session = await page.context().newCDPSession(page)
  const touch = (
    type: 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel',
    y = 0,
  ) =>
    session.send('Input.dispatchTouchEvent', {
      type,
      touchPoints:
        type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x: 180, y }],
    })
  await page.getByRole('button', { name: 'Open preferences drawer' }).click()
  const body = page.locator('[data-slot="bottom-sheet-body"]')
  await body.evaluate((element) => {
    element.scrollTop = 180
  })
  await touch('touchStart', 350)
  await touch('touchMove', 490)
  await touch('touchEnd')
  await expect(page.getByRole('dialog')).toBeVisible()
  await body.evaluate((element) => {
    element.scrollTop = 0
  })
  await touch('touchStart', 350)
  await touch('touchMove', 490)
  await touch('touchCancel')
  await expect(page.getByRole('dialog')).toBeVisible()
  await touch('touchStart', 350)
  await touch('touchMove', 490)
  await touch('touchEnd')
  await expect(page.getByRole('dialog')).toBeHidden()
  await page.getByRole('button', { name: 'Open preferences drawer' }).click()
  const handle = await page
    .locator('[data-slot="bottom-sheet-handle"]')
    .boundingBox()
  if (!handle) throw new Error('Missing touch drag handle')
  await touch('touchStart', handle.y + 6)
  await touch('touchMove', handle.y + 146)
  await touch('touchEnd')
  await expect(page.getByRole('dialog')).toBeHidden()
  await page.getByText('Allow sheet dismissal', { exact: true }).click()
  await expect(
    page.getByRole('switch', { name: 'Allow sheet dismissal' }),
  ).not.toBeChecked()
  await page.getByRole('button', { name: 'Open preferences drawer' }).click()
  await touch('touchStart', 350)
  await touch('touchMove', 530)
  await touch('touchEnd')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeVisible()
  await session.detach()
})

test('inline source browsing retains the demo and reports clipboard failure', async ({
  page,
}) => {
  await page.goto('/atoms/text-input')
  const input = page.getByRole('textbox', { name: 'Full name' })
  await input.fill('Retain this draft')
  await input.evaluate((element) => {
    element.dataset['identity'] = 'retained'
  })
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('Denied')) },
      configurable: true,
    }),
  )
  await page.getByRole('button', { name: 'Source', exact: true }).click()
  await expect(page.locator('pre').first()).toContainText('TextInput')
  await page.getByRole('button', { name: 'Copy source', exact: true }).click()
  await expect(
    page.getByRole('status', { name: 'Source clipboard' }),
  ).toContainText('Copy failed')
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(input).toHaveValue('Retain this draft')
  await expect(input).toHaveAttribute('data-identity', 'retained')
  await page.getByRole('button', { name: 'Source', exact: true }).click()
  await page
    .locator('[data-slot="site-sidebar"]')
    .getByRole('link', { name: 'Textarea', exact: true })
    .click()
  await expect(page.locator('pre').first()).toContainText('Textarea')
})

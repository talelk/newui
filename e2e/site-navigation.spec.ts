import { expect, test } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })

test('sidebar rail remembers its preference and reference navigation keeps context', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/components/button')
  const sidebar = page.locator('[data-slot="site-sidebar"]')
  await expect(sidebar).toHaveCSS('width', '224px')
  await expect(
    sidebar.getByRole('link', { name: 'Button', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
  await expect(
    page.getByRole('navigation', { name: 'Breadcrumbs' }),
  ).toContainText('Components')
  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  await expect(sidebar).toHaveCSS('width', '48px')
  // A rail is its section icons: the leaf links are gone, the rows are not.
  await expect(
    sidebar.getByRole('button', { name: 'Examples', exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect(sidebar).toHaveAttribute('data-collapsed', 'true')
  await page.getByRole('button', { name: 'Expand sidebar' }).click()
  await sidebar
    .getByRole('searchbox', { name: 'Filter', exact: true })
    .fill('TextInput')
  await sidebar.getByRole('link', { name: 'TextInput', exact: true }).click()
  await expect(page).toHaveURL('/components/text-input')
  await page
    .getByRole('navigation', { name: 'On this page' })
    .getByRole('link', { name: 'Props', exact: true })
    .click()
  await expect(page.locator('#props')).toBeInViewport()
})

test('mobile navigation traps focus, restores its trigger and closes after navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/components/button')
  const trigger = page.getByRole('button', { name: 'Open navigation' })
  await trigger.click()
  const drawer = page.getByRole('dialog', { name: 'Documentation navigation' })
  await expect(drawer).toBeVisible()
  await expect(
    drawer.getByRole('searchbox', { name: 'Filter', exact: true }),
  ).toBeVisible()
  for (let index = 0; index < 100; index += 1) {
    await page.keyboard.press('Tab')
    expect(
      await drawer.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  await expect(trigger).toBeFocused()
  await trigger.click()
  // A section row navigates to the section's first page and closes the drawer.
  await drawer.getByRole('button', { name: 'Examples', exact: true }).click()
  await expect(page).toHaveURL('/examples')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(
    page.getByRole('heading', { name: 'Examples', exact: true }),
  ).toBeVisible()
})

test('page finder loads reference metadata on demand and supports keyboard selection', async ({
  page,
}) => {
  await page.goto('/')
  const button = page.getByRole('button', { name: 'Find a page', exact: true })
  await button.focus()
  await page.keyboard.press('Control+k')
  const finder = page.getByRole('dialog', { name: 'Find a page', exact: true })
  const field = finder.getByRole('combobox')
  await expect(field).toBeFocused()
  await field.fill('DateRangePicker')

  // The option is announced as the active one without focus leaving the field.
  await expect(
    finder.getByRole('option', { name: /DateRangePicker/ }),
  ).toBeVisible()
  await expect(field).toHaveAttribute('aria-activedescendant', /date-range/i)

  await page.keyboard.press('Escape')
  await expect(finder).toBeHidden()
  await expect(button).toBeFocused()

  await button.click()
  await field.fill('DateRangePicker')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/components/date-range-picker')
})

test('embedded documentation links leave the frame while application anchors retain the session', async ({
  page,
}) => {
  await page.goto('/examples/analytics?viewport=mobile')
  const app = page.frameLocator('iframe')
  await app.getByRole('button', { name: 'Toggle workspace navigation' }).click()
  // The frame's section nav scrolls inside the frame: the host page (and its
  // URL) does not move, and the section it names is what comes into view.
  await app.getByRole('button', { name: /^Transactions/ }).click()
  await expect(page).toHaveURL('/examples/analytics?viewport=mobile')
  await expect(
    app.getByRole('heading', { name: 'Transactions', exact: true }),
  ).toBeVisible()
  // A documentation link (the breadcrumb back to the workspace index) still
  // leaves the frame: the host navigates and the embed is gone.
  await app.getByRole('link', { name: 'Workspace', exact: true }).click()
  await expect(page).toHaveURL('/examples')
  await expect(page.locator('iframe')).toHaveCount(0)
  await page.goto('/examples/authentication?viewport=mobile')
  await app.getByRole('button', { name: 'GitHub demo', exact: true }).click()
  await app
    .getByRole('link', { name: 'Open the dashboard', exact: true })
    .click()
  await expect(page).toHaveURL('/examples/authentication?viewport=mobile')
  await expect(
    app.getByRole('heading', { name: 'Revenue overview', exact: true }),
  ).toBeVisible()
})

for (const width of [320, 768]) {
  test(`compact catalogs fit ${width}px, RTL and actual doubled text`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/components')
    await page.evaluate(() => {
      document.documentElement.dir = 'rtl'
      document.documentElement.style.fontSize = '200%'
    })
    await expect(
      page.getByRole('heading', { name: 'Components', exact: true }),
    ).toHaveCSS('font-size', '48px')
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1)
    await page
      .getByRole('searchbox', { name: 'Filter components' })
      .fill('Button')
    await page
      .locator('main')
      .getByRole('link', { name: /^Button.*part/ })
      .click()
    await expect(page).toHaveURL('/components/button')
  })
}

test('a reference section opens its own index in the sidebar', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/layouts/app-layout')
  const sidebar = page.locator('[data-slot="site-sidebar"]')
  // The layouts used to fall through to the site tree: no index, and a page
  // filter stacked over nothing. They are a reference section like the rest.
  await expect(
    sidebar.getByRole('button', { name: 'Layouts', exact: true }),
  ).toHaveAttribute('aria-expanded', 'true')
  await expect(
    sidebar.getByRole('link', { name: 'All layouts', exact: true }),
  ).toBeVisible()
  await expect(
    sidebar.getByRole('link', { name: 'AppLayout', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
  // The count is the registry's, not a second hand-written list.
  await expect(
    sidebar.getByRole('button', { name: 'Layouts', exact: true }),
  ).toContainText('1')
})

test('the mobile drawer is never a rail, even when the desk is folded', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('newui-sidebar-collapsed', 'true'),
  )
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/components/button')
  await page.getByRole('button', { name: 'Open navigation' }).click()
  const drawer = page.getByRole('dialog', { name: 'Documentation navigation' })
  // The fold is a preference about a column beside the content. A drawer of
  // bare icons is no navigation at all, and the reader cannot see the control
  // that would unfold it.
  await expect(
    drawer.getByRole('link', { name: 'Button', exact: true }),
  ).toBeVisible()
  await expect(
    drawer.getByRole('button', { name: 'Components', exact: true }),
  ).toBeVisible()
})

test('folding the section you are in does not navigate away', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/docs')
  const overview = page
    .locator('[data-slot="site-sidebar"]')
    .getByRole('button', { name: 'Overview', exact: true })
  await expect(overview).toHaveAttribute('aria-expanded', 'true')

  await overview.click()
  await expect(overview).toHaveAttribute('aria-expanded', 'false')
  // Closing a level used to also jump to its first page, so the reader could
  // not fold the section they were reading without leaving it.
  await expect(page).toHaveURL('/docs')
})

test('the architecture page states the ladder and links every level', async ({
  page,
}) => {
  await page.goto('/architecture')
  await expect(
    page.getByRole('heading', { name: 'Architecture', level: 1 }),
  ).toBeVisible()
  for (const level of [
    'Foundations',
    'Components',
    'Blocks',
    'Layouts',
    'Applications',
  ]) {
    await expect(
      page.getByRole('heading', { name: level, exact: true, level: 3 }),
    ).toBeVisible()
  }
  await expect(
    page.getByRole('link', { name: 'Browse layouts', exact: true }),
  ).toHaveAttribute('href', '/layouts')
})

test('an entry reached from the wrong section says where it lives', async ({
  page,
}) => {
  await page.goto('/components/app-layout')
  // The generated page is shared by five route groups; `/components/app-layout`
  // is the same content under the wrong breadcrumb, so it points at the one
  // canonical URL instead of rendering a duplicate.
  await expect(
    page.getByRole('heading', { name: 'AppLayout is a layout', level: 1 }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Open AppLayout under layouts' }).click()
  await expect(page).toHaveURL('/layouts/app-layout')
})

test('the command palette links a layout to its own section', async ({
  page,
}) => {
  await page.goto('/')
  await page.keyboard.press('Meta+k')
  await page.getByRole('combobox', { name: 'Find a page' }).fill('app-layout')
  await page.getByRole('option', { name: /AppLayout/ }).click()
  await expect(page).toHaveURL('/layouts/app-layout')
})

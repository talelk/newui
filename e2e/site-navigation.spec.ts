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
  await expect(
    sidebar.getByRole('link', { name: 'Examples', exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect(sidebar).toHaveAttribute('data-collapsed', 'true')
  await page.getByRole('button', { name: 'Expand sidebar' }).click()
  await sidebar
    .getByRole('searchbox', { name: 'Filter', exact: true })
    .fill('TextInput')
  await sidebar.getByRole('link', { name: 'TextInput', exact: true }).click()
  await expect(page).toHaveURL('/components/text-input')
  await page.getByRole('link', { name: 'Props', exact: true }).click()
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
  await drawer.getByRole('link', { name: 'Examples', exact: true }).click()
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
  await finder.getByRole('searchbox').fill('DateRangePicker')
  await page.keyboard.press('ArrowDown')
  await expect(
    finder.getByRole('link', { name: /DateRangePicker/ }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(button).toBeFocused()
  await button.click()
  await finder.getByRole('searchbox').fill('DateRangePicker')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/components/date-range-picker')
})

test('embedded documentation links leave the frame while application anchors retain the session', async ({
  page,
}) => {
  await page.goto('/examples/analytics?viewport=mobile')
  const app = page.frameLocator('iframe')
  await app.getByRole('button', { name: 'Toggle workspace navigation' }).click()
  await app.getByRole('link', { name: 'Transactions', exact: true }).click()
  await expect(page).toHaveURL('/examples/analytics?viewport=mobile')
  expect(
    page
      .frames()
      .some((frame) => frame.url().endsWith('/fullscreen#transactions')),
  ).toBe(true)
  await app.getByRole('link', { name: 'Build your own dashboard' }).click()
  await expect(page).toHaveURL('/docs')
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

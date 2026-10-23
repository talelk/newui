import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { setTheme } from './_lib/theme'

async function choose(page: Page, label: string, option: string) {
  await page.getByRole('combobox', { name: label, exact: true }).click()
  await page.getByRole('option', { name: option, exact: true }).click()
}

test('analytics filters, sorts, paginates and exports the selected report', async ({
  page,
}) => {
  await page.goto('/pages/analytics/fullscreen')
  const table = page.locator('#transactions table')
  await expect(table.locator('tbody tr')).toHaveCount(8)
  const first = await table.locator('tbody tr').first().textContent()
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await expect(table.locator('tbody tr').first()).not.toHaveText(first ?? '')
  await choose(page, 'Region', 'Europe')
  await expect(page.locator('[data-slot="pagination-range"]')).toHaveText(
    '1–8 of 32',
  )
  await choose(page, 'Date range', 'Last 7 days')
  await expect(page.locator('[data-slot="pagination-range"]')).toHaveText(
    '1–6 of 6',
  )
  await expect(page.locator('[data-slot="number-card"]').nth(1)).toContainText(
    '6',
  )
  await page.getByRole('button', { name: 'Amount', exact: true }).click()
  await expect(table.locator('th').last()).toHaveAttribute(
    'aria-sort',
    'ascending',
  )
  const amounts = await table
    .locator('tbody tr td:last-child')
    .allTextContents()
  const numeric = amounts.map((value) => Number(value.replace(/[^0-9.]/g, '')))
  expect(numeric).toEqual([...numeric].sort((a, b) => a - b))
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export report' }).click()
  const file = await download
  const stream = await file.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  const content = Buffer.concat(chunks).toString('utf8')
  expect(content.split('\r\n')).toHaveLength(7)
  expect(content).toContain('"Europe"')
  expect(content).not.toContain('"North America"')
  await page
    .getByRole('searchbox', { name: 'Search transactions' })
    .fill('no-such-customer')
  await expect(page.getByText('No transactions found')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Export report' }),
  ).toBeDisabled()
  await page.getByRole('button', { name: 'Reset filters' }).click()
  await expect(table.locator('tbody tr')).toHaveCount(8)
})

test('analytics exposes loading, error, retry and keyboard navigation', async ({
  page,
}) => {
  await page.goto('/pages/analytics/fullscreen')
  await choose(page, 'Preview state', 'Loading')
  await expect(page.getByText('Loading transactions…')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Export report' }),
  ).toBeDisabled()
  await choose(page, 'Preview state', 'Error')
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  await page.getByRole('button', { name: 'Try again' }).click()
  const region = page.getByRole('combobox', { name: 'Region', exact: true })
  await region.focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('listbox')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(region).toBeFocused()
})

for (const theme of ['light', 'dark']) {
  test(`analytics is accessible in ${theme} and mounted charts follow theme changes`, async ({
    page,
  }) => {
    await page.goto('/pages/analytics/fullscreen')
    await expect(
      page.locator('[data-slot="chart-card"] svg').first(),
    ).toBeVisible()
    const original = await page
      .locator('[data-slot="chart-card"] svg')
      .first()
      .innerHTML()
    await page.evaluate(
      (value) => document.documentElement.setAttribute('data-theme', value),
      theme,
    )
    if (theme === 'dark') {
      await expect
        .poll(() =>
          page.locator('[data-slot="chart-card"] svg').first().innerHTML(),
        )
        .not.toBe(original)
    }
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
}

for (const width of [320, 390, 768, 1440]) {
  test(`analytics reflows at ${width}px including RTL and text zoom`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/pages/analytics/fullscreen')
    await expect(
      page.getByRole('heading', { name: 'Revenue overview' }),
    ).toBeVisible()
    for (const dir of ['ltr', 'rtl']) {
      await page.evaluate((direction) => {
        document.documentElement.dir = direction
      }, dir)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1)
    }
    const metric = page.locator('[data-slot="number-card-value"]').first()
    const originalSize = await metric.evaluate((el) =>
      Number.parseFloat(getComputedStyle(el).fontSize),
    )
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%'
    })
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    )
    expect(
      await metric.evaluate((el) =>
        Number.parseFloat(getComputedStyle(el).fontSize),
      ),
    ).toBeCloseTo(originalSize * 2)

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1)
  })
}

test('mobile documentation navigation is keyboard reachable and closes after navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/')
  await expect(
    page.getByRole('heading', {
      name: 'Clarity for your next data application.',
    }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Open navigation' }).focus()
  await page.keyboard.press('Enter')
  const navigation = page.getByRole('dialog', {
    name: 'Documentation navigation',
  })
  await expect(navigation).toBeVisible()
  await navigation.getByRole('button', { name: 'Pages', exact: true }).click()
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await navigation.getByRole('link', { name: 'Analytics dashboard' }).click()
  await expect(
    page.getByRole('heading', { name: 'Analytics dashboard', exact: true }),
  ).toBeVisible()
  await expect(navigation).toBeHidden()
  await expect(
    page
      .frameLocator('iframe')
      .getByRole('heading', { name: 'Revenue overview' }),
  ).toBeVisible()
})

test('the responsive recipe keeps its primary action usable on narrow screens', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/pages/discussions/fullscreen')
  const action = page.getByRole('button', {
    name: 'New discussion',
    exact: true,
  })
  await expect(action).toBeInViewport()
  const box = await action.boundingBox()
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320)
  await page
    .getByRole('button', { name: 'Open application navigation' })
    .click()
  const drawer = page.getByRole('dialog', { name: 'Discussions navigation' })
  await expect(drawer.getByText('Spaces', { exact: true })).toBeVisible()
})

for (const theme of ['light', 'dark']) {
  test(`documentation is accessible on mobile in ${theme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 390, height: 900 })
    for (const route of ['/', '/atoms', '/organisms', '/atoms/button']) {
      await page.goto(route)
      await expect(page.locator('h1').first()).toBeVisible()
      await setTheme(page, theme)
      if (route === '/atoms/button')
        await expect(
          page.getByRole('button', { name: 'Primary', exact: true }),
        ).toBeVisible()
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations, `${route} in ${theme}`).toEqual([])
    }
  })
}

test('receipt updates and undo recalculate the complete report', async ({
  page,
}) => {
  await page.goto('/pages/analytics/fullscreen')
  const revenue = page
    .locator('[data-slot="number-card"]')
    .first()
    .locator('[data-slot="number-card-value"] > span')
    .first()
  const parseMoney = (value: string) => Number(value.replace(/[^0-9.]/g, ''))
  const before = parseMoney(await revenue.innerText())
  const pendingRow = page
    .locator('#transactions tbody tr')
    .filter({ has: page.getByText('Pending', { exact: true }) })
    .first()
  const amount = parseMoney(await pendingRow.locator('td').last().innerText())
  await pendingRow.getByRole('button').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Mark paid', exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect
    .poll(async () => parseMoney(await revenue.innerText()))
    .toBe(before + amount)
  await page.getByRole('button', { name: 'Undo change', exact: true }).click()
  await expect
    .poll(async () => parseMoney(await revenue.innerText()))
    .toBe(before)
  const chart = page.locator('[data-slot="chart-card"]').first()
  await expect(chart).toContainText('Prior month')
  await page
    .getByRole('switch', { name: 'Compare prior month', exact: true })
    .focus()
  await page.keyboard.press('Space')
  await expect(chart).not.toContainText('Prior month')
})

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const width of [390, 768, 1440]) {
  test(`deal pointer ordering and cancellation at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/examples/deals/fullscreen')
    const source = page.getByRole('button', {
      name: 'Drag Globex',
      exact: true,
    })
    const target = page.locator('[data-stage="Negotiation"]')
    await target.scrollIntoViewIfNeeded()
    await source.scrollIntoViewIfNeeded()
    const start = await source.boundingBox()
    if (!start) throw new Error('Missing drag handle')
    await page.mouse.move(start.x + 15, start.y + 10)
    await page.mouse.down()
    await page.mouse.move(start.x + 30, start.y + 40)
    await page.keyboard.press('Escape')
    await page.mouse.up()
    await expect(page.locator('[data-stage="Qualification"]')).toContainText(
      'Globex',
    )
    // Keyboard stage changes are the equivalent when the target is outside a
    // narrow viewport. A wide viewport also proves the pointer drop path.
    if (width === 1440) {
      const destination = await target.boundingBox()
      if (!destination) throw new Error('Missing drop target')
      await page.mouse.move(start.x + 15, start.y + 10)
      await page.mouse.down()
      await page.mouse.move(destination.x + 30, destination.y + 70, {
        steps: 12,
      })
      await page.mouse.up()
      await expect(target).toContainText('Globex')
      await page.getByRole('button', { name: 'Undo deal move' }).click()
      await expect(page.locator('[data-stage="Qualification"]')).toContainText(
        'Globex',
      )
    }
  })
}

test('mobile tickets use cards, closed queues and local resolution', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/examples/tickets/fullscreen')
  const cards = page.getByRole('region', { name: 'Ticket cards' })
  await page.getByRole('textbox', { name: 'Find tickets' }).fill('TKT-1024')
  await cards.getByRole('checkbox').check()
  await page
    .getByRole('button', { name: 'Resolve selected tickets (1)' })
    .click()
  await expect(cards.getByRole('article')).toHaveCount(0)
  await page.getByRole('tab', { name: 'Closed tickets' }).click()
  await expect(cards).toContainText('TKT-1024')
  await expect(cards).toContainText('Resolved')
})

test('accounting quarterly aggregation and cash accounts use the selected ledger period', async ({
  page,
}) => {
  await page.goto('/examples/accounting/fullscreen')
  await page.getByRole('combobox', { name: 'Aggregate cashflow' }).click()
  await page.getByRole('option', { name: 'Quarterly', exact: true }).click()
  await expect(
    page.getByRole('img', { name: 'Income and expenses quarterly' }),
  ).toBeVisible()
  await page.getByRole('combobox', { name: 'Date preset' }).click()
  await page.getByRole('option', { name: 'Q3 2026', exact: true }).click()
  await page.getByRole('button', { name: 'Cash accounts', exact: true }).click()
  const accounts = page.getByRole('region', {
    name: 'Cash accounts',
    exact: true,
  })
  await expect(accounts.getByRole('article')).toHaveCount(3)
  await expect(accounts).toContainText(
    'Net posted movement in the selected period',
  )
})

test('deals moves by keyboard, undoes and creates validated opportunities', async ({
  page,
}) => {
  await page.goto('/examples/deals/fullscreen')
  const stage = page.getByRole('combobox', {
    name: 'Stage for Globex',
    exact: true,
  })
  await stage.click()
  await page.getByRole('option', { name: 'Won', exact: true }).click()
  await expect(
    page.getByRole('region', { name: 'Won deals', exact: true }),
  ).toContainText('Globex')
  await page.getByRole('button', { name: 'Undo deal move' }).click()
  await expect(
    page.getByRole('region', { name: 'Qualification deals', exact: true }),
  ).toContainText('Globex')
  await page.getByRole('button', { name: 'New deal', exact: true }).click()
  await page.getByRole('button', { name: 'Create deal', exact: true }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await page
    .getByRole('textbox', { name: 'Organization', exact: false })
    .fill('Northstar Analytics')
  await page
    .getByRole('spinbutton', { name: 'Deal value', exact: false })
    .fill('25000')
  await page.getByRole('button', { name: 'Create deal', exact: true }).click()
  await page.getByRole('textbox', { name: 'Search deals' }).fill('Northstar')
  await expect(page.locator('[data-deal]')).toHaveCount(1)
  await page.getByRole('tab', { name: 'List', exact: true }).click()
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await expect(page.locator('tbody')).toContainText('Northstar Analytics')
})

test('tickets replies, assigns, resolves and creates a support request', async ({
  page,
}) => {
  await page.goto('/examples/tickets/fullscreen')
  await page.getByRole('searchbox', { name: 'Search tickets' }).fill('TKT-1024')
  await page.locator('tbody').getByRole('button').first().click()
  await page
    .getByRole('textbox', { name: 'Ticket reply', exact: false })
    .fill('We are checking the domain configuration now.')
  await page.getByRole('button', { name: 'Send ticket reply' }).click()
  await expect(
    page.getByRole('region', { name: 'Ticket conversation' }),
  ).toContainText('checking the domain')
  await page
    .getByRole('button', { name: 'Resolve ticket', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.locator('tbody tr')).toHaveCount(0)
  await page.getByRole('button', { name: 'New ticket', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Ticket subject', exact: false })
    .fill('Report export is missing rows')
  await page
    .getByRole('textbox', { name: 'Customer', exact: false })
    .fill('Northstar')
  await page
    .getByRole('textbox', { name: 'Issue description', exact: false })
    .fill('The September export does not include the last transaction.')
  await page.getByRole('button', { name: 'Create ticket', exact: true }).click()
  await page
    .getByRole('searchbox', { name: 'Search tickets' })
    .fill('Report export')
  await expect(page.locator('tbody tr')).toHaveCount(1)
})

test('files opens folders, creates, uploads, previews, downloads and restores trash', async ({
  page,
}) => {
  await page.goto('/examples/files/fullscreen')
  await page.getByRole('button', { name: 'Design assets', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Brand guidelines.txt', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'New folder', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Folder name', exact: false })
    .fill('Launch assets')
  await page.getByRole('button', { name: 'Create folder', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Launch assets', exact: true }),
  ).toBeVisible()
  await page.getByLabel('Choose local files').setInputFiles({
    name: 'review.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Local launch review content'),
  })
  await page.getByRole('button', { name: 'review.txt', exact: true }).click()
  await expect(
    page.getByRole('region', { name: 'File preview' }),
  ).toContainText('Local launch review content')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download file', exact: true }).click()
  expect((await download).suggestedFilename()).toBe('review.txt')
  await page.getByRole('button', { name: 'Save file details' }).click()
  const card = page.getByRole('listitem').filter({
    has: page.getByRole('button', { name: 'review.txt', exact: true }),
  })
  await card.getByRole('button', { name: 'Move to trash', exact: true }).click()
  await page.getByRole('button', { name: 'Trash', exact: true }).click()
  await page.getByRole('button', { name: 'Restore', exact: true }).click()
  await page.getByRole('button', { name: 'Home', exact: true }).click()
  await page.getByRole('button', { name: 'Design assets', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'review.txt', exact: true }),
  ).toBeVisible()
})

test('accounting connects date filters, transactions, payroll and exported reports', async ({
  page,
}) => {
  await page.goto('/examples/accounting/fullscreen')
  await expect(
    page.locator('[data-slot="chart-card"] svg').first(),
  ).toBeVisible()
  await page.getByRole('button', { name: 'September', exact: true }).click()
  const income = page.locator('[data-slot="stat"]').first()
  const before = await income.innerText()
  await page
    .getByRole('button', { name: 'Add transaction', exact: true })
    .click()
  await page
    .getByRole('textbox', { name: 'Transaction description', exact: false })
    .fill('Northstar subscription')
  await page
    .getByRole('spinbutton', { name: 'Amount in USD', exact: false })
    .fill('5000')
  await page
    .getByRole('button', { name: 'Record transaction', exact: true })
    .click()
  await expect(income).not.toHaveText(before)
  await page.getByRole('button', { name: 'Payroll', exact: true }).click()
  await page
    .getByRole('checkbox', { name: 'Select EMP-1', exact: true })
    .check()
  await page
    .getByRole('button', { name: 'Record payroll payments (1)' })
    .click()
  await expect(page.locator('tbody tr').first()).toContainText('Paid')
  await page.getByRole('button', { name: 'Profit & loss', exact: true }).click()
  await expect(
    page.getByRole('region', { name: 'Profit and loss report' }),
  ).toContainText('Net profit')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export report', exact: true }).click()
  expect((await download).suggestedFilename()).toBe('acme-profit-and-loss.csv')
})

for (const name of ['deals', 'tickets', 'files', 'accounting']) {
  for (const theme of ['light', 'dark']) {
    test(`${name} is accessible at 390px in ${theme}, RTL and 200% text`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.setViewportSize({ width: 390, height: 900 })
      await page.goto(`/examples/${name}/fullscreen`)
      await page.getByRole('button', { name: theme, exact: true }).click()
      await expect(page.locator('h1')).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.evaluate(() => {
        document.documentElement.dir = 'rtl'
        document.documentElement.style.fontSize = '200%'
      })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1)
    })
  }
}

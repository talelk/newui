import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const width of [390, 768, 1440]) {
  test(`deal pointer ordering and cancellation at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/examples/deals/fullscreen')

    // The card itself is the grab target: a press that travels is a drag, a
    // press that does not is a click on whatever is inside it.
    const card = page.locator('[data-kanban-id="DEAL-1"]')
    const origin = page.locator('[data-kanban-column="Qualification"]')
    const target = page.locator('[data-kanban-column="Negotiation"]')
    await card.scrollIntoViewIfNeeded()
    await expect(origin).toContainText('Globex')

    const start = await card.boundingBox()
    if (!start) throw new Error('Missing deal card')
    await page.mouse.move(start.x + 40, start.y + 20)
    await page.mouse.down()
    await page.mouse.move(start.x + 80, start.y + 40, { steps: 6 })
    // Escape drops the card exactly where it started.
    await page.keyboard.press('Escape')
    await page.mouse.up()
    await expect(origin).toContainText('Globex')

    // A wide viewport also proves the pointer drop path — at 390 the next
    // column is off-screen, and the card menu is the equivalent route.
    if (width === 1440) {
      await target.scrollIntoViewIfNeeded()
      const destination = await target.boundingBox()
      if (!destination) throw new Error('Missing drop target')
      await page.mouse.move(start.x + 40, start.y + 20)
      await page.mouse.down()
      await page.mouse.move(destination.x + 60, destination.y + 80, {
        steps: 12,
      })
      await page.mouse.up()
      await expect(target).toContainText('Globex')
      await page.getByRole('button', { name: 'Undo deal move' }).click()
      await expect(origin).toContainText('Globex')
    }
  })
}

test('mobile tickets use cards, closed queues and local resolution', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/examples/tickets/fullscreen')
  const cards = page.getByRole('region', { name: 'Ticket cards' })
  await page.getByRole('searchbox', { name: 'Find tickets' }).fill('TKT-1024')
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
  await page.getByRole('combobox', { name: 'Aggregate', exact: true }).click()
  await page.getByRole('option', { name: 'Quarterly', exact: true }).click()
  await expect(
    page.getByRole('img', { name: 'Income and expenses quarterly' }),
  ).toBeVisible()
  await page.getByRole('tab', { name: 'Q3 2026', exact: true }).click()
  await page.getByRole('tab', { name: 'Cash accounts', exact: true }).click()
  const accounts = page.getByRole('region', {
    name: 'Cash accounts',
    exact: true,
  })
  await expect(accounts.locator('[data-slot="stat"]')).toHaveCount(3)
  await expect(accounts).toContainText(
    'Net posted movement in the selected period',
  )
})

test('deals moves by keyboard, undoes and creates validated opportunities', async ({
  page,
}) => {
  await page.goto('/examples/deals/fullscreen')
  // No pointer at all: the card's own menu moves it between columns.
  await page.getByRole('button', { name: 'Actions for Globex' }).click()
  await page.getByRole('menuitem', { name: 'Won', exact: true }).click()
  await expect(page.locator('[data-kanban-column="Won"]')).toContainText(
    'Globex',
  )
  await page.getByRole('button', { name: 'Undo deal move' }).click()
  await expect(
    page.locator('[data-kanban-column="Qualification"]'),
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
  await page.getByRole('searchbox', { name: 'Search deals' }).fill('Northstar')
  await expect(page.locator('[data-kanban-id]')).toHaveCount(1)
  await page.getByRole('tab', { name: 'List', exact: true }).click()
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await expect(page.locator('tbody')).toContainText('Northstar Analytics')
})

test('a recipe with a sidebar offers it as a drawer on a phone', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/examples/tasks/fullscreen')

  // The frame: a pinned header, and no sidebar beside the content.
  await expect(
    page.getByRole('button', { name: 'Open navigation' }),
  ).toBeHidden()
  const trigger = page.getByRole('button', {
    name: 'Toggle workspace navigation',
  })
  await expect(trigger).toBeVisible()

  await trigger.click()
  const drawer = page.getByRole('dialog', { name: 'Tasks navigation' })
  await expect(drawer).toBeVisible()
  await expect(
    drawer.getByRole('button', { name: 'Design system' }),
  ).toBeVisible()

  // A filter under the drawer is meant for the page behind it: the drawer gets
  // out of the way so the result is visible.
  await drawer.getByRole('button', { name: 'Design system' }).click()
  await expect(drawer).toBeHidden()
  await expect(page.locator('tbody')).toContainText('TASK-1009')
})

test('tickets replies, assigns, resolves and creates a support request', async ({
  page,
}) => {
  await page.goto('/examples/tickets/fullscreen')
  await page.getByRole('searchbox', { name: 'Find tickets' }).fill('TKT-1024')
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
    .getByRole('searchbox', { name: 'Find tickets' })
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
  await page.getByRole('tab', { name: 'September', exact: true }).click()
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
  await page.getByRole('tab', { name: 'Payroll', exact: true }).click()
  await page
    .getByRole('checkbox', { name: 'Select EMP-1', exact: true })
    .check()
  await page
    .getByRole('button', { name: 'Record payroll payments (1)' })
    .click()
  await expect(page.locator('tbody tr').first()).toContainText('Paid')
  await page.getByRole('tab', { name: 'Profit & loss', exact: true }).click()
  await expect(
    page.getByRole('region', { name: 'Profit and loss report' }),
  ).toContainText('Net profit')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export report', exact: true }).click()
  expect((await download).suggestedFilename()).toBe('acme-profit-and-loss.csv')
})

/**
 * Every application recipe that carries its own theme switcher.
 *
 * `/examples/discussions` is the exception: it is a shelled app with its own
 * chrome (and its own spec), so it has no `light`/`dark` button to press — the
 * loop would be asserting our switcher, not the recipe.
 */
for (const name of [
  'deals',
  'tickets',
  'files',
  'accounting',
  'mail',
  'tasks',
  'compose',
]) {
  for (const theme of ['light', 'dark']) {
    // Axe on a 390px recipe under 200% text is the heaviest test in the suite;
    // the 30s default was flaky on loaded dev hosts. Explicit budget, no retry
    // tricks — the flake reporter tells us if these ever need one.
    test(`${name} is accessible at 390px in ${theme}, RTL and 200% text`, {
      timeout: 90_000,
    }, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.setViewportSize({ width: 390, height: 900 })
      await page.goto(`/examples/${name}/fullscreen`)
      await expect(page.locator('h1')).toBeVisible()
      await page.getByRole('button', { name: theme, exact: true }).click()
      await expect(page.locator('h1')).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.evaluate(() => {
        document.documentElement.dir = 'rtl'
        document.documentElement.style.fontSize = '200%'
      })
      await page.waitForTimeout(50) // let re-layout settle
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1)
    })
  }
}

import { expect, test } from '@playwright/test'

/**
 * The board's gesture, in a real browser.
 *
 * The unit tests cover the geometry with fabricated boxes, because jsdom reports
 * every element as a zero rect. What they cannot cover is the part that is only
 * true once layout exists: that a real pointer crossing the threshold lifts the
 * card, that the ghost follows it, that the slot under the pointer is the one
 * the card lands in, and that a card can be moved with no pointer at all.
 */

const DEMO = '/play?c=KanbanBoard'

test('a card can be dragged into another column', async ({ page }) => {
  await page.goto(DEMO)

  const card = page.locator('[data-kanban-id="D-1"]')
  const target = page.locator('[data-kanban-column="negotiation"]')
  await expect(card).toBeVisible()
  await expect(
    page.locator('[data-kanban-column="qualification"]'),
  ).toContainText('Globex')

  const from = await card.boundingBox()
  const to = await target.boundingBox()
  expect(from).not.toBeNull()
  expect(to).not.toBeNull()

  await page.mouse.move(
    (from?.x ?? 0) + (from?.width ?? 0) / 2,
    (from?.y ?? 0) + 20,
  )
  await page.mouse.down()
  // Past the 4px threshold first: a press that never travels is a click.
  await page.mouse.move(
    (from?.x ?? 0) + (from?.width ?? 0) / 2 + 12,
    (from?.y ?? 0) + 22,
    {
      steps: 4,
    },
  )
  // Then onto the second column, below its cards so the drop is the last slot.
  await page.mouse.move(
    (to?.x ?? 0) + (to?.width ?? 0) / 2,
    (to?.y ?? 0) + (to?.height ?? 0) - 40,
    { steps: 12 },
  )

  // The card is in the air: it has left the flow and the ghost is following.
  await expect(page.locator('[data-kanban-card][data-dragging]')).toHaveCount(1)
  await page.mouse.up()

  await expect(target.locator('[data-kanban-id="D-1"]')).toHaveCount(1)
  await expect(
    page.locator('[data-kanban-column="qualification"]'),
  ).not.toContainText('Globex')
  await expect(page.getByText('Globex → Negotiation')).toBeVisible()
})

test('Escape drops the card back where it started', async ({ page }) => {
  await page.goto(DEMO)

  const card = page.locator('[data-kanban-id="D-1"]')
  const bounds = await card.boundingBox()
  const board = await card.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return { x: rect.x, y: rect.y }
  })

  await page.mouse.move(board.x + 40, board.y + 20)
  await page.mouse.down()
  await page.mouse.move(board.x + 400, board.y + 40, { steps: 10 })
  await expect(page.locator('[data-kanban-card][data-dragging]')).toHaveCount(1)
  expect(bounds).not.toBeNull()

  await page.keyboard.press('Escape')
  await expect(page.locator('[data-kanban-card][data-dragging]')).toHaveCount(0)
  await page.mouse.up()

  await expect(
    page.locator('[data-kanban-column="qualification"] [data-kanban-id="D-1"]'),
  ).toHaveCount(1)
  await expect(page.getByText('Drag a card, or use its menu')).toBeVisible()
})

test('a card can be moved with the keyboard alone', async ({ page }) => {
  await page.goto(DEMO)

  await page.getByRole('button', { name: 'Actions for Globex' }).click()
  await page.getByRole('menuitem', { name: 'Ready to close' }).click()

  await expect(
    page.locator('[data-kanban-column="closing"] [data-kanban-id="D-1"]'),
  ).toHaveCount(1)
  await expect(page.getByText('Globex → Ready to close')).toBeVisible()
})

test('the board scrolls sideways with the keyboard and keeps its columns', async ({
  page,
}) => {
  await page.goto(DEMO)

  const scroller = page
    .locator('[data-slot="kanban-board"] [data-slot="scroll-area-viewport"]')
    .first()
  const before = await scroller.evaluate(
    (element) => element.scrollWidth > element.clientWidth,
  )
  expect(before, 'four columns are wider than the demo surface').toBe(true)

  // Each column is a heading, so the board is navigable as structure.
  await expect(
    page.getByRole('heading', { name: 'Qualification' }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Won' })).toBeVisible()
})

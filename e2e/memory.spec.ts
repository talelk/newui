import { expect, test } from '@playwright/test'
import { createMemoryProbe, mb, measureChurn } from './_lib/memory'

/**
 * Memory — heap retention and leak tripwires, measured against forced GC.
 *
 * `disposal.test.tsx` proves mount/unmount loops leave the *DOM* intact;
 * it cannot see what the DOM drop freed. A page can return every node and
 * still grow: listeners held on `window`, timers that never cleared, Zag
 * machines pinned by a closure, chart adapters that keep an old series.
 * That shows up as heap growth first, and as a slow, OOM-ing tab later.
 *
 * Three checks, each with the same discipline:
 *
 * 1. **Overlay churn** — opening and closing every overlay 20× must return
 *    both the DOM and the *heap* to baseline. DOM-only stability passes the
 *    old test; a heap delta after a forced GC is the leak it cannot see.
 *    (A leak that only shows on the 2,000th open is the one that finally
 *    takes down a long-lived dashboard — 20 cycles is the minimum that
 *    proves per-cycle retention is zero, not the effect of module warmup.)
 * 2. **Route churn** — navigating back and forth must not ratchet. A page
 *    that leaks on navigation leaks for every user who hits the back button.
 * 3. **Per-surface budgets** — measured headroom, tripwires for a page that
 *    suddenly starts holding everything: a forgotten `setInterval` in a
 *    demo, a module import that drags in a chart, a fixture left enabled.
 *
 * All numbers are CDP (`Runtime.getHeapUsage`) after `collectGarbage` —
 * deltas measured without a forced GC are noise dressed as findings.
 */

const CHURN_CYCLES = 20
/**
 * Calibrated on this repo: 30 Dialog cycles retained 488 KB with zero DOM
 * growth, and 12 route crossings 141 KB. Budgets sit above the allocator
 * noise, not above the measurement: a real per-cycle leak — a listener per
 * open, a closure per mount — blows well past these quickly.
 */
const CHURN_HEAP_BUDGET = 1_500_000
const CHURN_DOM_BUDGET = 8

/** Click-openable overlays — the churn mechanism is identical for each. */
const OVERLAYS = [
  'Dialog',
  'SettingsDialog',
  'BottomSheet',
  'Popover',
  'Dropdown',
  'Menu',
  'Select',
  'Combobox',
  'CommandPalette',
  'DatePicker',
]

const panelSlot =
  '[data-slot$="-content"],[data-slot$="-listbox"],[data-slot$="-menu"]'

async function openClose(page: import('@playwright/test').Page): Promise<void> {
  const trigger = page
    .locator(
      'main [data-slot$="-trigger"], main [role="combobox"], main button[aria-haspopup], main button',
    )
    .locator('visible=true')
    .first()
  const panel = page.locator(panelSlot).locator('visible=true').first()
  await trigger.click({ force: true })
  await panel.waitFor({ timeout: 5_000 })
  await page.keyboard.press('Escape')
  await panel.waitFor({ state: 'hidden', timeout: 5_000 })
}

test.describe('overlay churn', () => {
  test.describe.configure({ timeout: 60_000 })
  for (const demo of OVERLAYS) {
    test(`${demo} returns its heap and DOM after ${CHURN_CYCLES} open/close cycles`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.goto(`/play?c=${demo}`)
      await page.locator('main > *').first().waitFor()
      await page.waitForTimeout(200)

      const probe = await createMemoryProbe(page)
      try {
        const result = await measureChurn(page, probe, CHURN_CYCLES, () =>
          openClose(page),
        )
        expect(
          result.domDelta,
          `${demo}: DOM grew by ${result.domDelta} nodes across ${CHURN_CYCLES} cycles`,
        ).toBeLessThanOrEqual(CHURN_DOM_BUDGET)
        expect(
          result.heapDelta,
          `${demo}: heap grew ${mb(result.heapDelta)} across ${CHURN_CYCLES} open/close cycles (${mb(
            result.heapBefore,
          )} -> ${mb(result.heapAfter)})`,
        ).toBeLessThanOrEqual(CHURN_HEAP_BUDGET)
      } finally {
        await probe.close()
      }
    })
  }
})

test('route navigation does not ratchet the heap', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/spec')
  await page.locator('main > *').first().waitFor()

  const probe = await createMemoryProbe(page)
  try {
    await probe.forceGc() // settle after the first load
    await probe.forceGc()
    const before = await probe.heapBytes()
    for (let i = 0; i < 12; i += 1) {
      await page.goto('/components/button')
      await page.locator('main > *').first().waitFor()
      await page.goto('/blocks/stat-grid')
      await page.locator('main > *').first().waitFor()
      await page.goto('/spec')
      await page.locator('main > *').first().waitFor()
    }
    await probe.forceGc()
    const after = await probe.heapBytes()
    const ROUTE_BUDGET = 3 * 1024 * 1024
    expect(
      after - before,
      `heap ratcheted across 12 route crossings: +${mb(
        after - before,
      )} (${mb(before)} -> ${mb(after)})`,
    ).toBeLessThan(ROUTE_BUDGET)
  } finally {
    await probe.close()
  }
})

/**
 * Surface budgets — measured headroom, roughly triple. A page is expected
 * to *stay* at its budget; these catch the day it starts keeping everything.
 */
const BUDGETS: Array<[string, number]> = [
  // [route, budget MB] — calibrated with forced GC, then multiplied.
  ['/', 10 * 1024 * 1024],
  ['/spec', 15 * 1024 * 1024],
  ['/components/button', 15 * 1024 * 1024],
  ['/blocks/stat-grid', 15 * 1024 * 1024],
  ['/examples/tasks/fullscreen', 30 * 1024 * 1024],
]

for (const [route, budget] of BUDGETS) {
  test(`${route} loads within a memory budget`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(route)
    await page.locator('main > *').first().waitFor()
    await page.waitForTimeout(500)

    const probe = await createMemoryProbe(page)
    try {
      await probe.forceGc()
      const used = await probe.heapBytes()
      expect(
        used - budget,
        `${route} heap ${mb(used)} exceeds budget ${mb(budget)} — the budget is measured headroom, so breaching it means something new started being retained`,
      ).toBeLessThanOrEqual(0)
    } finally {
      await probe.close()
    }
  })
}

import { expect, type Page, test } from '@playwright/test'

/**
 * Overlay stacking invariants — the dialog-under-other-elements bug, as a rule.
 *
 * Every overlay demo is opened in a real browser and the portal panel must
 * pass:
 *
 * 1. **Hit test** — the point at its centre belongs to the panel or a
 *    descendant. If any layer of the page sits on top (z-index, stacking
 *    context, a stray `relative`), the panel's own centre lies and everything
 *    under it is unreachable.
 * 2. **It is a portal** — mounted outside the demo's `main`, not inline where
 *    an ancestor's `overflow: hidden` could clip it.
 * 3. **Escape closes it** — dismissal is not optional.
 *
 * If opening the panel changes what's behind it (scroll lock, inert), that is
 * the machine's contract and the same assertion catches it breaking.
 */

interface OverlayDemo {
  /** Demo key in `demos.tsx`. */
  demo: string
  /** How the demo opens its overlay. */
  open: 'click' | 'hover' | 'right-click' | 'key'
  /** For open==='key': the keyboard combo, Playwright syntax. */
  key?: string
  /**
   * Some panels deliberately don't close on Escape (a form dialog that wants a
   * decision). Documented, not skipped silently.
   */
  noEscape?: boolean
  /**
   * Tooltips ship `pointer-events: none` on purpose — the point is that they
   * never intercept the thing under them — so a centre hit-test of the *panel*
   * is the wrong question. For those, assert presence + portal + dismissal
   * only. (HoverCard takes pointer events and gets the full test.)
   */
  hitTest?: boolean
}

const OVERLAYS: OverlayDemo[] = [
  { demo: 'Dialog', open: 'click' },
  { demo: 'SettingsDialog', open: 'click' },
  { demo: 'KeyboardShortcutsDialog', open: 'click' },
  { demo: 'BottomSheet', open: 'click' },
  { demo: 'Popover', open: 'click' },
  { demo: 'HoverCard', open: 'hover' },
  { demo: 'Dropdown', open: 'click' },
  { demo: 'Menu', open: 'click' },
  { demo: 'Select', open: 'click' },
  { demo: 'Combobox', open: 'click' },
  { demo: 'CommandPalette', open: 'click' },
  { demo: 'DatePicker', open: 'click' },
  { demo: 'TimePicker', open: 'click' },
  { demo: 'DateRangePicker', open: 'click' },
  { demo: 'DateTimePicker', open: 'click' },
  { demo: 'Tooltip', open: 'hover', hitTest: false },
  { demo: 'ContextMenu', open: 'right-click' },
]

const contentSlot = (_demo: string) =>
  '[data-slot$="-content"],[data-slot$="-listbox"],[data-slot$="-menu"]'

async function openOverlay(page: Page, entry: OverlayDemo): Promise<void> {
  await page.goto(`/play?c=${entry.demo}`)
  await page.locator('main *').first().waitFor()

  if (entry.open === 'key') {
    await page.keyboard.press(entry.key ?? 'Control+k')
    return
  }

  if (entry.demo === 'Tooltip') {
    // Tooltip styles its trigger by spreading props onto whatever child it is
    // given; the demo's own element is the hook.
    await page.locator('main span').first().hover()
    return
  }

  // Trigger discovery, best hook first: the component's own trigger slot, the
  // picker control, the a11y affordance, and finally the demo's first button.
  const hooks = [
    '[data-slot$="-trigger"]',
    '[role="combobox"]',
    'button[aria-haspopup]',
    'button',
    '[data-slot$="-control"]',
    '[data-slot$="-input"]',
  ]
  let trigger = null
  for (const hook of hooks) {
    const candidate = page
      .locator(`main ${hook}`)
      .locator('visible=true')
      .first()
    if ((await candidate.count()) > 0 && (await candidate.isVisible())) {
      trigger = candidate
      break
    }
  }
  expect(
    trigger,
    `${entry.demo} exposes nothing that opens its overlay`,
  ).not.toBeNull()

  if (entry.open === 'hover') {
    await trigger.hover()
    return
  }
  if (entry.open === 'right-click') {
    await trigger.click({ button: 'right' })
    return
  }
  await trigger.click({ force: true })
}

for (const entry of OVERLAYS) {
  test(`${entry.demo}'s overlay hits like it is on top`, async ({ page }) => {
    test.setTimeout(30_000)
    await openOverlay(page, entry)

    const content = page
      .locator(contentSlot(entry.demo))
      .locator('visible=true')
      .first()
    await expect(content, `${entry.demo} panel never opened`).toBeVisible({
      timeout: 10_000,
    })

    // Portal check: outside the demo's main, appended near the body.
    // (A bare `expect(value)` is a silent no-op in Playwright — this matcher
    // had never run. Fix it, and it fires here, not in review.)
    const insideMain = await content.evaluate(
      (el) => el.closest('main') !== null,
    )
    expect(insideMain, `${entry.demo} renders its portal inside <main>`).toBe(
      false,
    )

    const box = await content.boundingBox()
    expect(box, `${entry.demo} panel has no box`).not.toBeNull()
    if (!box) return

    // The hit-test that matters: who is under the panel's own centre?
    const owner =
      entry.hitTest === false
        ? true
        : await content.evaluate((el) => {
            const rect = el.getBoundingClientRect()
            const under = document.elementFromPoint(
              rect.left + rect.width / 2,
              rect.top + rect.height / 2,
            )
            return el === under || el.contains(under ?? null)
          })
    expect(
      owner,
      `${entry.demo}: another layer sits over the overlay — that is the dialog bug again`,
    ).toBe(true)

    if (!entry.noEscape) {
      await page.keyboard.press('Escape')
      await expect(content, `${entry.demo} ignores Escape`).toBeHidden({
        timeout: 5_000,
      })
    }
  })
}

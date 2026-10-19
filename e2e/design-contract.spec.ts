import { expect, test } from '@playwright/test'
import { gotoStory, settle, storyIds } from './_lib/stories'

/**
 * The design contract, measured not imagined.
 *
 * Every story Storybook serves — the same unit `pnpm shots` drives — is loaded
 * in a real browser and held to the invariants this repo has repeatedly been
 * bitten by, and no per-component gate caught:
 *
 * 1. **No horizontal overflow** at 375px: the padding bug, the Pagination
 *    350px row, and the squeezed board were all overflow-class failures.
 * 2. **Box metrics survive**: every visible control keeps non-zero horizontal
 *    padding and a real height. A dropped axis utility collapses the control —
 *    invisible to a class-name assertion, obvious here. (The general form of
 *    the Button test in `interaction.spec.ts`.)
 * 3. **The story renders**: lazy chunks can silently 404 or throw — the driver
 *    fails on Storybook's error display, and the console/page-error listeners
 *    catch a chunk that never loaded.
 *
 * One load per story, three measurements: the checks share the page instead of
 * paying three navigations for the same picture. Soft assertions keep the
 * report complete — an overflow and a collapsed button are two bugs.
 */

const STORIES = storyIds()

test('the story index drives every shipped story', () => {
  // If the index read goes quiet the whole suite would pass in silence — this
  // is the canary that the list below is real.
  expect(STORIES.length).toBeGreaterThan(80)
})

test.describe('each story', () => {
  test.describe.configure({ timeout: 45_000 })

  for (const id of STORIES) {
    test(`${id} renders as a real demo, not a fallback`, async ({ page }) => {
      // Load at the narrow width first. The overflow check is the *first*
      // measurement, so a pointer-anchored panel (a context menu) is placed
      // for the width it is measured at — a desktop anchor cannot be moved by
      // a resize, and blaming it for the narrower window would be an artifact.
      await page.setViewportSize({ width: 375, height: 800 })
      const consoleErrors: string[] = []
      const pageErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text())
      })
      page.on('pageerror', (error) => pageErrors.push(String(error)))

      await gotoStory(page, id)
      await expect.soft(consoleErrors, `console errors for ${id}`).toEqual([])
      await expect.soft(pageErrors, `page errors for ${id}`).toEqual([])

      // 1. The narrow width, where the padding/row/squeeze bugs live.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect.soft(overflow, `horizontal overflow: ${id}`).toBeLessThanOrEqual(1)

      // 2. Box metrics at desktop width.
      await page.setViewportSize({ width: 1280, height: 900 })
      await settle(page)
      const offenders = await page.evaluate(() => {
        const bad: string[] = []
        const controls = document.querySelectorAll<HTMLElement>(
          'main [data-slot="button"]',
        )
        for (const el of controls) {
          if (!el.getClientRects().length) continue
          const style = getComputedStyle(el)
          const box = el.getBoundingClientRect()
          if (box.height < 8 || (el.textContent ?? '').trim().length === 0)
            continue
          const paddingX =
            Number.parseFloat(style.paddingLeft) +
            Number.parseFloat(style.paddingRight)
          // A labelled Button that lost its `px-*` axis is the merge-bug
          // signature (the margin/padding report). Triggers are exempt: their
          // inset is delegated to a pill layer on purpose (tab-styles.ts).
          if (paddingX === 0)
            bad.push(
              `button[data-slot=button] px=0 h=${box.height.toFixed(0)} "${(el.textContent ?? '').trim().slice(0, 24)}"`,
            )
          if (box.height < 24)
            bad.push(
              `button[data-slot=button] h=${box.height.toFixed(0)}<24 "${(el.textContent ?? '').trim().slice(0, 24)}"`,
            )
        }
        return bad
      })
      expect.soft(offenders, `box metrics: ${id}`).toEqual([])
    })
  }
})

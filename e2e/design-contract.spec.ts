import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

/**
 * The design contract, measured not imagined.
 *
 * Every demo in the `DEMOS` registry — the same unit `pnpm shots` drives — is
 * loaded in a real browser and held to the invariants this repo has repeatedly
 * been bitten by, and no per-component gate caught:
 *
 * 1. **No horizontal overflow** at 375px: the padding bug, the Pagination
 *    350px row, and the squeezed board were all overflow-class failures.
 * 2. **Box metrics survive**: every visible control keeps non-zero horizontal
 *    padding and a real height. A dropped axis utility collapses the control —
 *    invisible to a class-name assertion, obvious here. (The general form of
 *    the Button test in `interaction.spec.ts`.)
 * 3. **The demo renders**: lazy chunks can silently 404 or throw; a demo that
 *    shows "No demo registered" or a blank screen must fail, not screenshot
 *    pretty.
 *
 * The registry file is the source of truth for what ships, so a component that
 * gains a demo gains its contract for free — and a demo nobody loads fails
 * here, not under a human's eyes at review time.
 */

const registry = readFileSync(
  path.join(process.cwd(), 'apps/playground/src/demos.tsx'),
  'utf8',
)
const DEMO_NAMES = [
  ...registry.matchAll(/^\s{2}([A-Za-z0-9]+): \(\) => import/gm),
].map((match) => match[1])

test('the registry drives every shipped demo', () => {
  // If the parse goes quiet the whole suite would pass in silence — this is
  // the canary that the list below is real.
  expect(DEMO_NAMES.length).toBeGreaterThan(80)
})

test.describe('each demo', () => {
  test.describe.configure({ timeout: 30_000 })

  for (const name of DEMO_NAMES) {
    test(`${name} renders as a real demo, not a fallback`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text())
      })
      await page.goto(`/play?c=${name}`)
      // The route loads one lazy chunk; wait for it to resolve rather than
      // snapshotting a cold page. Portal-heavy demos mount almost nothing in
      // `main` itself, so "mounted" means "children present and stable", not
      // an element count.
      await expect
        .poll(async () => page.locator('main > *').count(), {
          timeout: 15_000,
        })
        .toBeGreaterThanOrEqual(1)
      await page.waitForTimeout(150)
      // The Play route is explicit about unknown components; the rest is blank.
      await expect(page.getByText(/^No demo registered for/)).toHaveCount(0)
      await expect.soft(consoleErrors, `console errors for ${name}`).toEqual([])
    })
  }

  for (const name of DEMO_NAMES) {
    test(`${name} keeps page width at 375px`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 })
      await page.goto(`/play?c=${name}`)
      await page.locator('main *').first().waitFor()
      // Give layout a frame after the lazy chunk mounts.
      await page.waitForTimeout(50)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow, `horizontal overflow: ${name}`).toBeLessThanOrEqual(1)
    })
  }

  for (const name of DEMO_NAMES) {
    test(`${name}'s controls keep their box metrics`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.goto(`/play?c=${name}`)
      await page.locator('main *').first().waitFor()
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
      expect(offenders, `box metrics: ${name}`).toEqual([])
    })
  }
})

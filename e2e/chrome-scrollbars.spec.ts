import { expect, test } from '@playwright/test'

/**
 * No phantom scrollbars in the chrome.
 *
 * The rail taught this one: its icon items are 28px and the rail's content box
 * measures 27px under subpixel layout, so a container that declares only
 * `overflow-y: auto` got a real *horizontal* scrollbar for that half pixel —
 * with arrow buttons — across the middle of the rail. Nothing was wrong on
 * purpose; the bar was noise.
 *
 * The invariant is exactly what draws the bar: an element is a scroll container
 * for an axis when its computed overflow is `auto`/`scroll` and it overflows
 * that axis. In the rails that must never be true. (`overflow-x: clip` is the
 * fix, and it keeps the predicate false while `scrollWidth` still reports the
 * content's true extent — which is why the assert is on the pair, not on
 * `scrollWidth` alone.)
 */

const RECIPES = [
  'tasks',
  'mail',
  'analytics',
  'deals',
  'tickets',
  'files',
  'accounting',
  'compose',
]

test.describe('rail chrome carries no scroll containers', () => {
  for (const recipe of RECIPES) {
    test(`/${recipe}: nothing in the rail scrolls`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.goto(`/examples/${recipe}/fullscreen`)
      await page.waitForSelector('[data-slot="sidebar-rail"]', {
        timeout: 10_000,
      })

      const scrollable = await page.evaluate(() => {
        const rail = document.querySelector('[data-slot="sidebar-rail"]')
        if (!rail) return ['no rail found — the recipe lost its chrome']
        const bad: string[] = []
        for (const el of [rail, ...rail.querySelectorAll('*')]) {
          const style = getComputedStyle(el)
          const overflowX = style.overflowX
          const overflowY = style.overflowY
          const isScroll = (value: string) =>
            value === 'auto' || value === 'scroll'
          const box = el.getBoundingClientRect()
          if (!box.width && !box.height) continue
          if (isScroll(overflowX) && el.scrollWidth > el.clientWidth + 1)
            bad.push(
              `${el.tagName.toLowerCase()}[${el.getAttribute('data-slot') ?? ''}] x:${overflowX} ${el.scrollWidth}>${el.clientWidth}`,
            )
          if (isScroll(overflowY) && el.scrollHeight > el.clientHeight + 1)
            bad.push(
              `${el.tagName.toLowerCase()}[${el.getAttribute('data-slot') ?? ''}] y:${overflowY} ${el.scrollHeight}>${el.clientHeight}`,
            )
        }
        return bad
      })

      expect(
        scrollable,
        `scrollable elements in the rail on ${recipe}`,
      ).toEqual([])
    })
  }
})

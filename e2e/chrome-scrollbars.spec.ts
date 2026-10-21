import { expect, test } from '@playwright/test'

/** The single application sidebar may scroll vertically, never horizontally. */
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

test.describe('application sidebar chrome', () => {
  for (const recipe of RECIPES) {
    test(`/${recipe}: one sidebar without horizontal scrollbars`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.goto(`/pages/${recipe}/fullscreen`)
      const sidebar = page.locator('[data-slot="app-shell-sidebar"]')
      await expect(sidebar).toBeVisible()
      await expect(sidebar.locator('[data-slot="sidebar"]')).toHaveCount(1)
      await expect(page.locator('[data-slot="sidebar-rail"]')).toHaveCount(0)

      const horizontalOverflow = await sidebar.evaluate((root) => {
        const offenders: string[] = []
        for (const element of [root, ...root.querySelectorAll('*')]) {
          const style = getComputedStyle(element)
          const box = element.getBoundingClientRect()
          if (
            box.width > 0 &&
            box.height > 0 &&
            ['auto', 'scroll'].includes(style.overflowX) &&
            element.scrollWidth > element.clientWidth + 1
          ) {
            offenders.push(
              `${element.tagName.toLowerCase()}[${element.getAttribute('data-slot') ?? ''}] ${element.scrollWidth}>${element.clientWidth}`,
            )
          }
        }
        return offenders
      })

      expect(horizontalOverflow).toEqual([])
    })
  }
})

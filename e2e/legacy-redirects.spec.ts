import { expect, test } from '@playwright/test'

/**
 * The pre-atomic URLs.
 *
 * They were public long enough that a bookmark, a search result or a link in an
 * issue will land on one. Every one redirects to the level that now owns it;
 * `/components/<name>` cannot be rewritten by prefix — the name decides whether
 * the entry is an atom or a molecule — so that redirect reads the registry.
 * These tests exist because a redirect that 404s is indistinguishable from a
 * deleted page until someone clicks an old link.
 */
const MOVES: [string, string][] = [
  ['/examples/tasks', '/pages/tasks'],
  ['/examples/settings/fullscreen', '/pages/settings/fullscreen'],
  ['/blocks/filter-bar', '/organisms/filter-bar'],
  ['/blocks', '/organisms'],
  ['/layouts/app-layout', '/templates/app-layout'],
  ['/layouts', '/templates'],
  ['/charts/bar-chart', '/organisms/bar-chart'],
  ['/editors/code-editor', '/organisms/code-editor'],
  ['/components/button', '/atoms/button'],
  ['/components/dialog', '/molecules/dialog'],
  ['/components/app-layout', '/templates/app-layout'],
  ['/components', '/atoms'],
]

for (const [from, to] of MOVES) {
  test(`${from} redirects to ${to}`, async ({ page }) => {
    await page.goto(from)
    await expect(page).toHaveURL(new RegExp(`${to}$`))
    // The destination rendered, rather than an empty layout after the hop.
    await expect(page.locator('h1').first()).toBeVisible()
  })
}

import { expect, test } from '@playwright/test'

/**
 * One screen, one *control*.
 *
 * The sidebar rework caught it by accident — `getByPlaceholder('Filter…')`
 * resolved to two elements and the strict-mode failure was the first honest
 * signal that a control had been duplicated. That is a *bug class*, not an
 * accident: two identical interactive roles on one screen confuse the a11y
 * tree, confuse Playwright, and confuse the user.
 *
 * But *instances* are not *duplicates*: a "Move to trash" button in every row
 * of a table is one control with many instances, and flagging those made the
 * gate useless noise. So the rule is context-aware:
 *
 * - the same (role, accessible name) may appear **once per row item**;
 * - across different row items, or repeated anywhere in page chrome, it is a
 *   duplicate — a control the user (or a test) cannot address uniquely.
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
  // `/kit/recipes` is excluded: it is the reference gallery, and its
  // toolbar carries site-level section nav on purpose. The application recipes
  // are the screens where a duplicated control is always an accident.
]

test.describe('no duplicated controls on the recipe screens', () => {
  for (const recipe of RECIPES) {
    test(`/${recipe}: no role+name pair appears twice outside row instances`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.goto(`/pages/${recipe}/fullscreen`)
      await expect(page.locator('main *').first()).toBeVisible()

      const duplicates = await page.evaluate(() => {
        const interactive = new Set([
          'A',
          'BUTTON',
          'INPUT',
          'SELECT',
          'TEXTAREA',
        ])
        const nameOf = (el: Element): string =>
          (
            el.getAttribute('aria-label') ??
            (el.textContent ?? '').replace(/\s+/g, ' ').trim()
          ).toLowerCase()
        const roleOf = (el: Element): string =>
          el.getAttribute('role') ?? el.tagName.toLowerCase()
        const ROW_SELECTOR = 'tr, li, [role="row"], [role="listitem"]'

        /** Row instances are allowed; chrome repeats are not. The row's path
         *  to <body> makes each row its own context. */
        const contextOf = (el: Element): string => {
          const row = el.closest(ROW_SELECTOR)
          if (!row) return 'page'
          const parts: string[] = []
          let node: Element | null = row
          while (node && node !== document.body) {
            const parent = node.parentElement
            if (parent)
              parts.unshift(
                String(Array.prototype.indexOf.call(parent.children, node)),
              )
            node = parent
          }
          return `item:${parts.join('.')}`
        }

        const byKey = new Map<
          string,
          { contexts: Map<string, number>; sample: string }
        >()
        for (const el of Array.from(
          document.querySelectorAll('main *, nav *, aside *, header *'),
        ).filter(
          (candidate) =>
            interactive.has(candidate.tagName) &&
            candidate.getClientRects().length > 0 &&
            !candidate.hasAttribute('disabled') &&
            candidate.getAttribute('aria-hidden') !== 'true' &&
            !candidate.closest('[aria-hidden="true"]') &&
            Number(getComputedStyle(candidate).opacity) > 0,
        ) as HTMLElement[]) {
          const name = nameOf(el)
          if (!name) continue
          const key = `${roleOf(el)}|${name}`
          const context = contextOf(el)
          const entry = byKey.get(key) ?? {
            contexts: new Map<string, number>(),
            sample: `${el.tagName.toLowerCase()}[${
              el.getAttribute('data-slot') ?? ''
            }]`,
          }
          entry.contexts.set(context, (entry.contexts.get(context) ?? 0) + 1)
          byKey.set(key, entry)
        }

        const dups: string[] = []
        for (const [key, { contexts, sample }] of byKey) {
          const total = [...contexts.values()].reduce((a, b) => a + b, 0)
          const distinctContexts = [...contexts.keys()]
          const repeatedPerContext = [...contexts.values()].some((n) => n > 1)
          // A page-level repeat (no row item anywhere) is always a duplicate;
          // two row instances sharing a name in the *same* list is fine, but
          // the same name repeated within one row is not.
          if (distinctContexts.length === 1 && distinctContexts[0] === 'page') {
            if (total > 1) dups.push(`${key} ×${total} (${sample})`)
          } else if (repeatedPerContext && distinctContexts[0] === 'page') {
            dups.push(`${key} — twice inside one region (${sample})`)
          }
        }
        return dups
      })

      expect(
        duplicates.slice(0, 10),
        `duplicated controls on ${recipe}`,
      ).toEqual([])
    })
  }
})

import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import type { AxeResults } from 'axe-core'
import { gotoStory, storyIds } from './_lib/stories'

// Axe walks the live tree; an opening overlay mid-animation can detach a node
// under it and abort the run (a `runPartialRecursive` error, not a finding).
// The library honours reduced motion, so the state stories are static here.
test.use({ reducedMotion: 'reduce' })

/**
 * Accessibility on real CSS.
 *
 * Unlike the jsdom axe run, this one has layout and computed styles, so the
 * colour-contrast rules are active — it is the end-to-end check on the contrast
 * contract the token tests assert in isolation. `/spec` covers the shared
 * surface in both themes; the story sweep covers every state on its own.
 */

/**
 * Findings that block a sweep: serious/critical axe violations, minus the
 * documented exceptions below.
 *
 * `sidebar-rail-item` renders avatar initials (`AC`) as its visible text while
 * its accessible name is the organisation they stand for (`Acme, 3 unread`).
 * WCAG 2.5.3's "label in name" is about text labels; deriving the name from the
 * initials would name the control `AC`. The exemption is one rule on one
 * pattern — every other rule still runs inside these items, and the rule keeps
 * running on everything else.
 */
const EXEMPT_NODES: Array<{ rule: string; htmlIncludes: string }> = [
  {
    rule: 'label-content-name-mismatch',
    htmlIncludes: 'data-slot="sidebar-rail-item"',
  },
]

function seriousFindings(results: AxeResults): string[] {
  return results.violations
    .filter(
      (violation) =>
        violation.impact === 'serious' || violation.impact === 'critical',
    )
    .flatMap((violation) => {
      const exempt = EXEMPT_NODES.filter((entry) => entry.rule === violation.id)
      const nodes = violation.nodes.filter(
        (node) =>
          !exempt.some((entry) =>
            (node.html ?? '').includes(entry.htmlIncludes),
          ),
      )
      return nodes.length > 0 ? [`${violation.id} (${nodes.length})`] : []
    })
}

/**
 * Axe occasionally aborts *internally* when a run races a mutation elsewhere
 * in the page (`runPartialRecursive`, seen only in the fully parallel sweep;
 * the same story passes alone). Retry the engine error — a returned violation
 * list is an answer and is never retried.
 */
async function analyze(page: Page, rules?: string[]): Promise<AxeResults> {
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const builder = new AxeBuilder({ page })
      return await (rules ? builder.withRules(rules) : builder).analyze()
    } catch (error) {
      lastError = error
      await page.waitForTimeout(250)
    }
  }
  throw lastError
}

for (const theme of ['light', 'dark'] as const) {
  test(`no serious axe violations (${theme})`, async ({ page }) => {
    await page.goto(`/spec?theme=${theme}`)
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()

    const results = await analyze(page)
    expect(seriousFindings(results)).toEqual([])
  })
}

test('every interactive control has an accessible name', async ({ page }) => {
  await page.goto('/spec')
  const results = await analyze(page, [
    'button-name',
    'label',
    'aria-input-field-name',
  ])
  expect(results.violations).toEqual([])
})

test('the open combobox listbox is named', async ({ page }) => {
  await page.goto('/spec')
  // The listbox only exists while open, so its accessible name needs its own
  // pass — the page-load axe run never sees it.
  await page.getByRole('combobox', { name: 'Assignee' }).click()
  await expect(page.getByRole('option').first()).toBeVisible()

  const results = await analyze(page, ['aria-input-field-name'])
  expect(results.violations).toEqual([])
})

test('the open date-picker calendar has no serious violations', async ({
  page,
}) => {
  await page.goto('/spec')
  await page.getByRole('textbox', { name: 'Due date' }).click()
  await expect(page.getByRole('grid')).toBeVisible()

  for (const view of ['day', 'month', 'year']) {
    const results = await analyze(page)
    expect(seriousFindings(results), view).toEqual([])
    if (view !== 'year') {
      await page.locator('[data-part="view-trigger"]').click()
    }
  }
})

/**
 * The same axe rules on every story — including every required state. `/spec`
 * proves the shared surface; this proves the isolated one, where a state (an
 * invalid field, an open dialog, a loading chart) is the only thing on screen.
 * One theme: the token contrast tests cover both, and `/spec` above runs both.
 */
test.describe('every story', () => {
  test.describe.configure({ timeout: 45_000 })

  for (const id of storyIds()) {
    test(`${id} has no serious axe violations`, async ({ page }) => {
      await gotoStory(page, id)
      const results = await analyze(page)
      const findings = seriousFindings(results)
      expect(findings, `${id}: ${findings.join(', ')}`).toEqual([])
    })
  }
})

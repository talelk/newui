import { expect, test } from '@playwright/test'
import { inspectToolbar } from './_lib/coherence'
import { gotoStory, stories } from './_lib/stories'

/**
 * Toolbar overflow collapses into a menu — it does not clip, and it does not
 * wrap.
 *
 * `spec/visual-quality.md`, toolbar checklist: "Overflow collapses into a
 * menu rather than wrapping or clipping [T]." A `PageToolbar` squeezed to
 * phone width has exactly three fates — the actions stay reachable, they fold
 * behind a menu trigger, or they are painted past the edge / pushed onto a
 * second row — and the last two are the bugs this spec catches at the widths
 * the acceptance surfaces actually ship at (320 phone, 768 tablet).
 *
 * The generic coherence sweep cannot carry this check: it measures one settled
 * frame at desktop width, while the rule is about what happens as the width
 * narrows. And the calibration fixtures (`toolbar-overflow-*.html`) prove the
 * detector fires on a planted clip and stays quiet on a planted collapse —
 * a rule that never runs against real code is decoration.
 */

const toolbars = stories().filter(
  (story) =>
    story.title.split('/').at(-1) === 'PageToolbar' &&
    !story.tags.includes('no-sweep'),
)

test('the toolbar sweep drives every PageToolbar story', () => {
  expect(toolbars.length).toBeGreaterThan(0)
})

for (const story of toolbars) {
  for (const width of [320, 768]) {
    test(`${story.id} collapses instead of clipping at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })
      await gotoStory(page, story.id)
      const violations = await inspectToolbar(page)
      expect(
        violations.map((v) => `${v.rule} — ${v.target}: ${v.details}`),
        `toolbar overflow violations in ${story.id} at ${width}px`,
      ).toEqual([])
    })
  }
}

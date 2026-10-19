import { expect, test } from '@playwright/test'
import * as fc from 'fast-check'
import { gotoDemo, inspectCoherence, settle } from './_lib/coherence'

/**
 * Stress — invariants that must survive a transformation, not pixels that
 * must match a baseline.
 *
 * Three metamorphic sweeps over layout-relevant demos, plus a property test
 * that throws generated text at every text input in the library:
 *
 * 1. **Text scale** — every rem-based size in the app grows 50% (the harness
 *    analogue of 200% browser zoom, which the responsive spec covers at
 *    fixed sizes). Controls must stay reachable and un-truncated; growing
 *    *taller* is allowed.
 * 2. **Width intervals** — the breakpoints spec covers 320/768/1280. Layouts
 *    break *between* the checked ones, so the sweep samples in-between
 *    widths (the "fine at 390, fine at 768, broken at 641" class of bug).
 * 3. **Unicode fuzz** — deterministic (seeded) arbitrary text into every
 *    text input: no exceptions, no console errors, no dead controls after
 *    the page handles what a user pastes.
 *
 * Seeds are printed on failure, and the shrunk counterexample is part of the
 * property report, so a red run is reproducible without replaying the world.
 */

/** Stories where layout pressure actually bites: dense, wrapping, scrolling. */
const LAYOUT_STORIES = [
  'Button',
  'Card',
  'TabButtons',
  'Pagination',
  'KanbanBoard',
  'PageToolbar',
  'FilterBar',
  'StatGrid',
  'DetailHeader',
  'Combobox',
  'DatePicker',
  'TaskTable',
  'Tree',
  'Dashboard',
]

/** Widths no fixed-size breakpoint catches — the in-between cases. */
const INTERVAL_WIDTHS = [360, 501, 769, 1025]

/** Stories that own a text input someone can paste anything into. */
const INPUT_STORIES = [
  'TextInput',
  'Textarea',
  'Password',
  'FormControl',
  'Combobox',
  'MultiSelect',
  'DatePicker',
  'DateRangePicker',
  'DateTimePicker',
  'TimePicker',
  'NumberInput',
  'CommandPalette',
  'AuthCard',
  'SettingsDialog',
  'FilterBar',
  'Editor',
]

const TEXTY_INPUT =
  'input[type="text"],input:not([type]),input[type="search"],input[type="email"],input[type="password"],input[type="url"],input[type="tel"],input[type="number"],textarea'

test.describe('text scale stress', () => {
  test.describe.configure({ timeout: 30_000 })
  for (const name of LAYOUT_STORIES) {
    test(`${name} keeps its controls after 150% text`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      await gotoDemo(page, name)
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '150%'
      })
      await settle(page)
      // Vertical growth is allowed — what must survive is reachability and
      // text that did not get cut off without an escape hatch.
      const violations = await inspectCoherence(page, {
        rules: ['occluded-control', 'truncated-text'],
      })
      expect(
        violations.map((v) => `${v.rule} — ${v.target}: ${v.details}`),
        `text-scale violations in ${name}`,
      ).toEqual([])
    })
  }
})

test.describe('width interval sweep', () => {
  test.describe.configure({ timeout: 60_000 })
  for (const name of LAYOUT_STORIES) {
    test(`${name} holds every in-between width`, async ({ page }) => {
      for (const width of INTERVAL_WIDTHS) {
        await page.setViewportSize({ width, height: 900 })
        await gotoDemo(page, name)
        const violations = await inspectCoherence(page, {
          rules: ['viewport-overflow'],
        })
        expect(
          violations.map((v) => v.details),
          `horizontal overflow in ${name} at ${width}px`,
        ).toEqual([])
      }
    })
  }
})

test.describe('unicode fuzz', () => {
  test.describe.configure({ timeout: 30_000 })
  for (const name of INPUT_STORIES) {
    test(`${name} survives generated text`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      const pageErrors: string[] = []
      page.on('pageerror', (error) => pageErrors.push(String(error)))
      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text())
      })
      await gotoDemo(page, name)

      const inputs = page.locator(`main ${TEXTY_INPUT}`)
      const count = await inputs.count()
      test.skip(count === 0, `${name} owns no text input`)

      // Deterministic per demo, per run: same code, same seeds, same report.
      const seed = name
        .split('')
        .reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
      await testInfo.attach('seed', {
        body: String(seed),
        contentType: 'text/plain',
      })

      // Full-unicode text without lone surrogates: valid everywhere, so a
      // failure is a page fault, not a parser artifact.
      const codePoint = fc.oneof(
        fc.integer({ min: 1, max: 0xd7ff }),
        fc.integer({ min: 0xf000, max: 0x10ffff }),
      )
      const fuzzText = fc
        .array(codePoint, { maxLength: 60 })
        .map((cps) => String.fromCodePoint(...cps))

      await fc.assert(
        fc.asyncProperty(fuzzText, async (text) => {
          for (let i = 0; i < count; i += 1) {
            await inputs.nth(i).fill(text)
          }
          return (
            pageErrors.length === 0 &&
            consoleErrors.length === 0 &&
            (await page.evaluate(() => document.documentElement.scrollHeight)) >
              0
          )
        }),
        { seed, numRuns: 12 },
      )

      expect(pageErrors, `page errors while fuzzing ${name}`).toEqual([])
      expect(consoleErrors, `console errors while fuzzing ${name}`).toEqual([])

      // After the noise, the page must still be a page: controls reachable.
      const stuck = await inspectCoherence(page, {
        rules: ['occluded-control'],
      })
      expect(
        stuck.map((v) => `${v.rule} — ${v.target}`),
        `controls became unreachable in ${name} after fuzzing`,
      ).toEqual([])
    })
  }
})

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import { collectStateBoxes, stateShiftDrift } from './_lib/coherence'
import { gotoStory, stories } from './_lib/stories'

/**
 * State transitions must not jump the layout.
 *
 * `spec/visual-quality.md` dimension 4: empty, loading and error render on
 * every surface that can exist in them, *with no layout jump between them*.
 * The states are stories — `Default` is ready, `Loading`/`Empty`/`Error` are
 * the same surface in another state — so the deterministic question is: does
 * swapping the state change the page shape? A skeleton shorter than what it
 * replaces is a jump the user feels on every refetch, and no class-name
 * assertion can see it.
 *
 * The honest state of the sweep, like role drift before it, is *measured, not
 * yet all accepted*: today's drift is pinned in
 * `e2e/state-shift.baseline.json` and fails only when it grows or a new pair
 * appears. Removing entries is encouraged — the baseline shrinks as skeletons
 * learn their surface's shape (`UPDATE_STATE_SHIFT=1` rewrites it).
 */

const STATE_NAMES = ['Loading', 'Empty', 'Error']

/** Families with a `Default` and at least one data state — the transitions. */
const families = new Map<string, { id: string; name: string }[]>()
for (const story of stories()) {
  if (story.tags.includes('no-sweep')) continue
  const family = story.title.split('/').at(-1)
  if (!family) continue
  const list = families.get(family) ?? []
  list.push({ id: story.id, name: story.name })
  families.set(family, list)
}

const BASELINE = path.join(process.cwd(), 'e2e', 'state-shift.baseline.json')

function readBaseline(): Map<string, number> {
  if (!existsSync(BASELINE)) return new Map()
  return new Map(
    Object.entries(
      JSON.parse(readFileSync(BASELINE, 'utf8')) as Record<string, number>,
    ),
  )
}

test('the state-transition sweep drives every state family', () => {
  // The canary: if the index read goes quiet the suite would pass in silence.
  expect(families.size).toBeGreaterThan(20)
})

for (const [family, list] of [...families].sort()) {
  const baseline = list.find((story) => story.name === 'Default')
  const states = list.filter((story) => STATE_NAMES.includes(story.name))
  if (!baseline || states.length === 0) continue

  test.describe('each transition', () => {
    test.describe.configure({ timeout: 60_000 })
    test(`${family} keeps its shape across its data states`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      await gotoStory(page, baseline.id)
      const boxes = (await collectStateBoxes(page)).map((box) => ({
        ...box,
        label: 'Default',
      }))
      // A Default that measures nothing would silently re-baseline the first
      // state as the reference — that is a broken measurement, not a pass.
      if (boxes.length === 0)
        throw new Error(`no state surface measured on ${baseline.id}`)
      for (const state of states) {
        await gotoStory(page, state.id)
        for (const box of await collectStateBoxes(page))
          boxes.push({ ...box, label: state.name })
      }

      const drift = stateShiftDrift(boxes)
      const observed = new Map(
        drift.map(({ state, delta }) => [
          `${family} ${state}`,
          Math.abs(delta),
        ]),
      )
      const allowed = readBaseline()

      if (process.env['UPDATE_STATE_SHIFT'] === '1') {
        // Merge, not rewrite: every family test writes this file, and the last
        // writer must not erase the families that finished before it. Run the
        // update with `--workers=1` if you want a fully deterministic rewrite.
        const merged = readBaseline()
        for (const key of [...merged.keys()])
          if (key.startsWith(`${family} `)) merged.delete(key)
        for (const [key, delta] of observed) merged.set(key, delta)
        writeFileSync(
          BASELINE,
          `${JSON.stringify(Object.fromEntries([...merged].sort()), null, 2)}\n`,
        )
        // biome-ignore lint/suspicious/noConsole: operator message for the baseline-update run
        console.log(
          `state-shift baseline updated for ${family}: ${observed.size} entries`,
        )
        return
      }

      expect(
        existsSync(BASELINE),
        `state-shift baseline missing at ${BASELINE}; run with UPDATE_STATE_SHIFT=1 once and review the diff`,
      ).toBe(true)

      const newDrift = [...observed]
        .filter(([key, delta]) => delta > (allowed.get(key) ?? 0))
        .map(([key, delta]) => {
          const pinned = allowed.get(key)
          return pinned === undefined
            ? `${key}: NEW ${delta}px shift — no baseline entry (a state story that newly jumps the layout)`
            : `${key}: grew from ${pinned}px to ${delta}px (the transition got worse)`
        })
        .sort()
      expect(
        newDrift.join('\n'),
        'state transitions that jump the layout beyond what the baseline pins:',
      ).toBe('')

      // Only this family's pinned entries are in play — the other families
      // report on their own tests, not from here.
      const gone = [...allowed.keys()].filter(
        (key) => key.startsWith(`${family} `) && !observed.has(key),
      )
      expect(
        gone.join('\n'),
        'pinned state drift is no longer observed — the skeleton was fixed; shrink the baseline (UPDATE_STATE_SHIFT=1):',
      ).toBe('')
    })
  })
}

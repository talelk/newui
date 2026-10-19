import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import {
  collectStyleVectors,
  divergingRoles,
  inspectCoherence,
  type KeyAggregate,
  mergeVectors,
} from './_lib/coherence'
import { gotoStory, storyIds } from './_lib/stories'

/**
 * Coherence sweep — every shipped demo, held to the same generic rules.
 *
 * `design-contract.spec.ts` proves each demo *exists* and fits 375px. This
 * spec proves each demo *behaves like the rest of the library*: nothing
 * clips, nothing truncates without an escape hatch, nothing hides behind an
 * overlay, no stray horizontal scroll. Those are the four failure shapes that
 * appeared repeatedly during porting and in AI-generated components, and the
 * per-component specs only cover the families someone remembered to write.
 *
 * The sweep also drops a style-vector file per demo. The last test merges
 * them and asks the question the per-component tests structurally cannot:
 * do two things that play the same semantic role — two `[dialog-content]`
 * panels, twelve `button|solid|md` instances — actually resolve to the same
 * padding, radius, type and colour, everywhere? A component that *looks*
 * like the design system without *being* it is the drift this catches.
 */

const STORIES = storyIds()

/** Where each story writes its sampled style vectors. */
const VECTORS = path.join(process.cwd(), 'test-results', 'coherence-vectors')

test('the sweep drives every shipped story', () => {
  // Same canary design-contract runs: if the index read breaks, the suite goes
  // silent — so fail loudly, here, in both files.
  expect(STORIES.length).toBeGreaterThan(80)
})

test.describe('each story', () => {
  test.describe.configure({ timeout: 30_000 })

  for (const id of STORIES) {
    test(`${id} is coherent in the browser`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      await gotoStory(page, id)

      const violations = await inspectCoherence(page)
      // Collect before asserting: the merge test needs this story's samples
      // even when this one fails.
      const vectors = await collectStyleVectors(page)
      mkdirSync(VECTORS, { recursive: true })
      writeFileSync(
        path.join(VECTORS, `${id}.json`),
        JSON.stringify({ demo: id, vectors }),
      )

      expect(
        violations.map((v) => `${v.rule} — ${v.target}: ${v.details}`),
        `coherence violations in ${id}`,
      ).toEqual([])
    })
  }
})

test('peer roles resolve identically across the library', async () => {
  // This test is an aggregate over the sweep above, so its budget has to cover
  // the *queue*, not the sweep: with two workers and nine hundred other tests in
  // the run, the 184 story loads can take many minutes to all report in. The
  // poll below is a wait for the sweep to finish, and a timeout here means the
  // run outgrew its budget — so it is sized from the whole suite, and it says how
  // many vectors actually arrived rather than just "expected 184, got 0".
  test.setTimeout(1_000_000)
  const expected = new Set(STORIES)
  // The per-story tests run in parallel; wait for the whole sweep, not a
  // fixed sleep. Files for stories removed since a previous run are ignored —
  // presence, not mere count, is the condition.
  await expect
    .poll(
      async () => {
        if (!existsSync(VECTORS)) return 0
        return readdirSync(VECTORS).filter((f) => {
          if (!f.endsWith('.json')) return false
          return expected.has(f.replace(/\.json$/, ''))
        }).length
      },
      { timeout: 900_000, interval: 2_000 },
    )
    .toBe(STORIES.length)

  const aggregates = new Map<string, KeyAggregate>()
  for (const file of readdirSync(VECTORS)) {
    if (!file.endsWith('.json')) continue
    const name = file.replace(/\.json$/, '')
    if (!expected.has(name)) continue
    const payload = JSON.parse(
      readFileSync(path.join(VECTORS, file), 'utf8'),
    ) as { vectors: Parameters<typeof mergeVectors>[1] }
    mergeVectors(aggregates, payload.vectors)
  }

  const drift = divergingRoles(aggregates, 4)

  // This is the first time anyone has *counted* cross-demo drift, so the
  // honest state is "measured, not yet all accepted". The pattern the repo
  // uses for known surface (exports.test.ts): pin what is known today in a
  // baseline, and fail only on *new* drift. Removing an entry is allowed
  // and encouraged — the baseline shrinks over time.
  const identity = (entry: string) =>
    entry.replace(/ ×\d+ — /, ' — ').split(':')[0]
  const identities = new Set(drift.map(identity))
  const byIdentity = new Map(drift.map((e) => [identity(e), e]))
  const baselinePath = path.join(
    process.cwd(),
    'e2e',
    'role-drift.baseline.json',
  )

  if (process.env['UPDATE_ROLE_DRIFT'] === '1') {
    writeFileSync(
      baselinePath,
      `${JSON.stringify([...identities].sort(), null, 2)}\n`,
    )
    // biome-ignore lint/suspicious/noConsole: operator message for the baseline-update run
    console.log(`role-drift baseline written: ${identities.size} entries`)
    return
  }

  expect(
    existsSync(baselinePath),
    `role-drift baseline missing at ${baselinePath}; run with UPDATE_ROLE_DRIFT=1 once and review the diff`,
  ).toBe(true)
  const baseline: string[] = JSON.parse(readFileSync(baselinePath, 'utf8'))
  const baselineSet = new Set(baseline)

  const newDrift = [...identities]
    .filter((id) => !baselineSet.has(id))
    .sort()
    .map((id) => byIdentity.get(id) ?? id)
  expect(
    newDrift.join('\n'),
    'NEW role drift — semantic peers that did not disagree before, and so were introduced by this change:',
  ).toBe('')

  // The baseline itself must be honest: everything it pins must still be
  // observed (an entry that stopped being drift is a fixed bug, and belongs
  // out of the file — UPDATE_ROLE_DRIFT=1 shrinks it).
  const gone = baseline.filter((id) => !identities.has(id))
  expect(
    gone.join('\n'),
    'pinned role drift is no longer observed — the bug was fixed; shrink the baseline (UPDATE_ROLE_DRIFT=1):',
  ).toBe('')
})

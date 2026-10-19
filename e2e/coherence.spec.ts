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
  demoNames,
  divergingRoles,
  gotoDemo,
  inspectCoherence,
  type KeyAggregate,
  mergeVectors,
} from './_lib/coherence'

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

const DEMOS = demoNames()

/** Where each demo writes its sampled style vectors. */
const VECTORS = path.join(process.cwd(), 'test-results', 'coherence-vectors')

test('the sweep drives every shipped demo', () => {
  // Same canary design-contract runs: if the parse breaks, the suite goes
  // silent — so fail loudly, here, in both files.
  expect(DEMOS.length).toBeGreaterThan(80)
})

test.describe('each demo', () => {
  test.describe.configure({ timeout: 30_000 })

  for (const name of DEMOS) {
    test(`${name} is coherent in the browser`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      await gotoDemo(page, name)

      const violations = await inspectCoherence(page)
      // Collect before asserting: the merge test needs this demo's samples
      // even when this one fails.
      const vectors = await collectStyleVectors(page)
      mkdirSync(VECTORS, { recursive: true })
      writeFileSync(
        path.join(VECTORS, `${name}.json`),
        JSON.stringify({ demo: name, vectors }),
      )

      expect(
        violations.map((v) => `${v.rule} — ${v.target}: ${v.details}`),
        `coherence violations in ${name}`,
      ).toEqual([])
    })
  }
})

test('peer roles resolve identically across the library', async () => {
  test.setTimeout(360_000)
  const expected = new Set(DEMOS)
  // The per-demo tests run in parallel; wait for the whole sweep, not a
  // fixed sleep. Files for demos removed since a previous run are ignored —
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
      { timeout: 300_000, interval: 2_000 },
    )
    .toBe(DEMOS.length)

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

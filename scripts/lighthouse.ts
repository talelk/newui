/**
 * Lighthouse budgets.
 *
 * Runs Lighthouse against the built playground (throttled mobile, which is what
 * makes the numbers meaningful) and fails on a regression. It starts its own
 * `vite preview`, so it needs `pnpm build:playground` first.
 *
 * The budgets split in two:
 *  - Deterministic audits (a11y, best-practices, CLS, console errors,
 *    render-blocking) must be perfect. A failure here is always a real defect.
 *  - The performance *score* is noisy under CPU/network throttling, so it has a
 *    floor rather than a target; the library's real cost is the bundle budget
 *    in `scripts/size.ts`, not this number.
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { startPreview } from './preview-server'

const PORT = 4180
const URL = `http://localhost:${PORT}/spec`
const REPORT = path.join(process.cwd(), 'coverage/lighthouse.json')
const BIN = path.join(process.cwd(), 'node_modules/.bin/lighthouse')

const BUDGETS: { id: string; min: number; why: string }[] = [
  { id: 'accessibility', min: 1, why: 'category score' },
  { id: 'best-practices', min: 1, why: 'category score' },
  { id: 'seo', min: 1, why: 'category score' },
  {
    id: 'performance',
    min: 0.6,
    why: 'category score (throttled; floor only)',
  },
  { id: 'cumulative-layout-shift', min: 0.9, why: 'score for CLS < 0.1' },
  { id: 'errors-in-console', min: 1, why: 'no console errors' },
  { id: 'render-blocking-insight', min: 1, why: 'no render-blocking resource' },
]

const preview = startPreview(PORT)

try {
  await preview.ready
  mkdirSync(path.dirname(REPORT), { recursive: true })

  const run = spawnSync(
    BIN,
    [
      URL,
      '--quiet',
      '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage',
      '--output=json',
      `--output-path=${REPORT}`,
      '--only-categories=performance,accessibility,best-practices,seo',
    ],
    { stdio: ['ignore', 'pipe', 'inherit'] },
  )
  if (run.status !== 0) {
    throw new Error(`lighthouse exited with ${run.status}`)
  }

  const report = JSON.parse(readFileSync(REPORT, 'utf8')) as {
    categories: Record<string, { score: number | null }>
    audits: Record<string, { score: number | null; displayValue?: string }>
    runWarnings?: string[]
  }

  // Lighthouse warns when the host CPU is slower than its calibration model.
  // In that case the throttled performance score is not a valid regression
  // signal (the deterministic audits still are), so the floor is skipped for
  // that run rather than turning a busy developer machine into a red gate.
  const uncalibratedCpu =
    report.runWarnings?.some((warning) => /slower CPU/i.test(warning)) ?? false

  const scores: Record<string, number | null> = {
    ...Object.fromEntries(
      Object.entries(report.categories).map(([id, category]) => [
        id,
        category.score,
      ]),
    ),
    ...Object.fromEntries(
      Object.entries(report.audits).map(([id, audit]) => [id, audit.score]),
    ),
  }

  const failures: string[] = []
  let skippedPerformance = false
  console.warn('\nLighthouse budgets\n')
  for (const budget of BUDGETS) {
    const score = scores[budget.id]
    if (budget.id === 'performance' && uncalibratedCpu) {
      skippedPerformance = true
      console.warn(
        `skip  ${budget.id.padEnd(26)} ${score === null || score === undefined ? 'n/a' : score.toFixed(2)}  (uncalibrated CPU; deterministic audits still enforced)`,
      )
      continue
    }
    const ok = score !== null && score !== undefined && score >= budget.min
    console.warn(
      `${ok ? 'ok  ' : 'FAIL'}  ${budget.id.padEnd(26)} ${
        score === null || score === undefined ? 'n/a' : score.toFixed(2)
      }  (min ${budget.min} — ${budget.why})`,
    )
    if (!ok) failures.push(`${budget.id}: ${score} < ${budget.min}`)
  }

  if (failures.length) {
    console.error('\nLighthouse failures:')
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exitCode = 1
  } else if (skippedPerformance) {
    console.warn(
      '\nLighthouse deterministic budgets pass; performance score skipped on an uncalibrated host.\n',
    )
  } else {
    console.warn('\nAll Lighthouse budgets pass.\n')
  }
} finally {
  preview.stop()
}

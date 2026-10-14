/**
 * Local CI runner — the same steps GitHub Actions runs, in the same order.
 *
 *   pnpm ci              # everything (checks + browser harness)
 *   pnpm ci:checks       # the fast gates only
 *   pnpm ci:e2e          # the browser harness only
 *   pnpm ci --only=lint,test
 *   pnpm ci --from=size
 *
 * Every step runs even when an earlier one fails (CI does the same with
 * `if: !cancelled()`), so one run reports every problem instead of the first.
 */
import { spawnSync } from 'node:child_process'
import { CHECK_STEPS, CI_STEPS, E2E_STEPS } from './ci-steps'

const args = process.argv.slice(2)
const only = args
  .find((arg) => arg.startsWith('--only='))
  ?.slice('--only='.length)
  .split(',')
  .filter(Boolean)
const from = args
  .find((arg) => arg.startsWith('--from='))
  ?.slice('--from='.length)
const group = args
  .find((arg) => arg.startsWith('--group='))
  ?.slice('--group='.length)

let steps =
  group === 'checks' ? CHECK_STEPS : group === 'e2e' ? E2E_STEPS : CI_STEPS
if (only?.length) {
  // Filter within the selected group, so `--group=checks --only=test` works.
  steps = steps.filter((step) =>
    only.some((name) => step.command.includes(name)),
  )
}
if (from) {
  const start = steps.findIndex((step) => step.command.includes(from))
  if (start >= 0) steps = steps.slice(start)
}

const results: { name: string; ok: boolean; ms: number }[] = []

console.warn(`\nnewui CI — ${steps.length} step(s)\n`)

for (const [index, step] of steps.entries()) {
  console.warn(`▶ [${index + 1}/${steps.length}] ${step.name}`)
  console.warn(`  $ ${step.command}\n`)

  const started = Date.now()
  const result = spawnSync(step.command, {
    shell: true,
    stdio: 'inherit',
    env: process.env,
  })
  const ms = Date.now() - started

  results.push({ name: step.name, ok: result.status === 0, ms })
  console.warn('')
}

const failed = results.filter((result) => !result.ok)

console.warn('─'.repeat(64))
for (const result of results) {
  console.warn(
    `${result.ok ? 'ok  ' : 'FAIL'}  ${result.name.padEnd(48)} ${(
      result.ms / 1000
    ).toFixed(1)}s`,
  )
}
console.warn('─'.repeat(64))

if (failed.length) {
  console.error(`\n${failed.length} step(s) failed:\n`)
  for (const result of failed) console.error(`  - ${result.name}`)
  process.exit(1)
}

console.warn(`\nAll ${results.length} step(s) passed.\n`)

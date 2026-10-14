import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { CI_STEPS } from './scripts/ci-steps'

/**
 * CI parity.
 *
 * The workflow and the local runner (`pnpm ci`) must execute the same commands.
 * This reads the workflow and compares it to the single declared pipeline, so
 * adding a gate in one place and forgetting the other fails here rather than in
 * a green CI run that never checked the new thing.
 */
const workflow = readFileSync(
  path.join(process.cwd(), '.github/workflows/tests.yml'),
  'utf8',
)

const INSTALL = 'pnpm install --frozen-lockfile'

const workflowCommands = [...workflow.matchAll(/^\s*run:\s*(pnpm .+)$/gm)]
  .map((match) => match[1].trim())
  .filter((command) => command !== INSTALL)

const workflowNames = [...workflow.matchAll(/^\s*- name:\s*(.+)$/gm)].map(
  (match) => match[1].trim(),
)

describe('CI parity', () => {
  it('runs exactly the declared pipeline, in order', () => {
    expect(workflowCommands).toEqual(CI_STEPS.map((step) => step.command))
  })

  it('labels every step with the declared name', () => {
    const declared = new Set(CI_STEPS.map((step) => step.name))
    const missing = [...declared].filter(
      (name) => !workflowNames.includes(name),
    )
    expect(missing).toEqual([])
  })
})

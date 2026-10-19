import { describe, expect, it } from 'vitest'
import { planAffected } from './affected'
import { CI_STEPS } from './ci-steps'

/**
 * The affected router's rule table is the contract of `verify:affected`; it
 * needs no git, no browser — feed it paths, assert the gate set. (The real
 * `dirtyFiles` is just git plumbing around the same table.)
 */
const steps = CI_STEPS

const names = (files: string[]) =>
  planAffected(steps, files).steps.map((s) => s.name)

describe('affected gate routing', () => {
  it('routes a component change to component gates, not to Lighthouse', () => {
    const picked = names(['packages/ui/src/components/Button/Button.tsx'])
    expect(picked).toContain('Type-check (@newui/ui)')
    expect(picked).toContain('Tests (changed files)')
    expect(picked).toContain('API table is current')
    expect(picked).not.toContain('Lighthouse budgets')
    expect(picked).not.toContain(
      'Browser harness (a11y · interaction · responsive · perf)',
    )
  })

  it('routes playground page changes to the browser harness', () => {
    const picked = names(['apps/playground/src/pages/Home.tsx'])
    expect(picked).toContain(
      'Browser harness (a11y · interaction · responsive · perf)',
    )
    expect(picked).toContain('Route JS budget (every route, gzip)')
  })

  it('runs the sweep only for merge-config, tokens or sweep changes', () => {
    expect(names(['packages/ui/src/lib/tw-merge.config.ts'])).toContain(
      'tw-merge sweep (all-pairs equivalence)',
    )
    expect(
      names(['packages/ui/src/components/Button/Button.tsx']),
    ).not.toContain('tw-merge sweep (all-pairs equivalence)')
  })

  it('falls back to the full pipeline for unclaimable paths', () => {
    const plan = planAffected(steps, ['pnpm-workspace.yaml'])
    expect(plan.fallbackFull).toBe(true)
    expect(plan.steps).toBe(steps)
  })

  it('runs cheap invariant gates for any diff', () => {
    const picked = names(['packages/ui/src/lib/tv.ts'])
    expect(picked).toContain('Lint & format (Biome)')
    expect(picked).toContain('Reference paths exist')
  })

  it('e2e edits dirty the browser harness, not the docs', () => {
    const picked = names(['e2e/interaction.spec.ts'])
    expect(picked).toContain(
      'Browser harness (a11y · interaction · responsive · perf)',
    )
    expect(picked).not.toContain('Docs site builds')
  })
})

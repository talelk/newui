import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './Card'

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
}

function summarize(results: AxeResults) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))
}

describe('Card accessibility', () => {
  it('has no axe violations for a card with all its parts', async () => {
    const { container } = render(() => (
      <Card elevation="sm" padding="md">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>This month</CardDescription>
        </CardHeader>
        <CardContent>12 open, 3 overdue</CardContent>
        <CardFooter>
          <button type="button">Open ledger</button>
        </CardFooter>
      </Card>
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a bare card', async () => {
    const { container } = render(() => (
      <Card elevation="lg" padding="none">
        <CardHeader>
          <CardTitle>Minimal</CardTitle>
        </CardHeader>
      </Card>
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})

import { render } from '@solidjs/testing-library'
import { Textarea } from '@talelk/newui-atoms'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Collapsible } from './Collapsible'

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

describe('Collapsible accessibility', () => {
  it('has no axe violations closed and open', async () => {
    const closed = render(() => (
      <Collapsible.Root>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
        <Collapsible.Content>
          <Textarea label="Notes" />
        </Collapsible.Content>
      </Collapsible.Root>
    ))
    expect(summarize(await axe.run(closed.container, AXE_OPTIONS))).toEqual([])

    const open = render(() => (
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
        <Collapsible.Content>
          <Textarea label="Notes" />
        </Collapsible.Content>
      </Collapsible.Root>
    ))
    expect(summarize(await axe.run(open.container, AXE_OPTIONS))).toEqual([])
  })
})

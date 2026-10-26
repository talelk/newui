import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Tabs } from './Tabs'

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

describe('Tabs accessibility', () => {
  it('has no axe violations for a tablist with labelled panels', async () => {
    const { container } = render(() => (
      <Tabs.Root defaultValue="one">
        <Tabs.List>
          <Tabs.Trigger value="one">Details</Tabs.Trigger>
          <Tabs.Trigger value="two">Activity</Tabs.Trigger>
          <Tabs.Trigger value="three" disabled>
            Files
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="one">The record details.</Tabs.Content>
        <Tabs.Content value="two">Recent activity.</Tabs.Content>
        <Tabs.Content value="three">Attached files.</Tabs.Content>
      </Tabs.Root>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a vertical pill tablist', async () => {
    const { container } = render(() => (
      <Tabs.Root defaultValue="general" orientation="vertical" variant="subtle">
        <Tabs.List>
          <Tabs.Trigger value="general">General</Tabs.Trigger>
          <Tabs.Trigger value="members">Members</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="general">Workspace settings.</Tabs.Content>
        <Tabs.Content value="members">Who has access.</Tabs.Content>
      </Tabs.Root>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})

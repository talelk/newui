import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Accordion } from './Accordion'

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

describe('Accordion accessibility', () => {
  it('has no axe violations with one panel open and a disabled item', async () => {
    const { container } = render(() => (
      <Accordion.Root defaultValue={['two']}>
        <Accordion.Item value="one">
          <Accordion.Trigger>First</Accordion.Trigger>
          <Accordion.Content>First panel</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="two">
          <Accordion.Trigger icon="lucide-settings">Second</Accordion.Trigger>
          <Accordion.Content>Second panel</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="three" disabled>
          <Accordion.Trigger>Third</Accordion.Trigger>
          <Accordion.Content>Third panel</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations in multiple mode with heading levels', async () => {
    const { container } = render(() => (
      <Accordion.Root multiple defaultValue={['a']}>
        <Accordion.Item value="a" headingLevel="h2">
          <Accordion.Trigger>Billing</Accordion.Trigger>
          <Accordion.Content>Billing panel</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="b" headingLevel="h2">
          <Accordion.Trigger>Shipping</Accordion.Trigger>
          <Accordion.Content>Shipping panel</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})

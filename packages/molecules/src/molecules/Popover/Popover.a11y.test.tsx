import { render, screen } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Popover } from './Popover'

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

describe('Popover accessibility', () => {
  it('has no axe violations when closed', async () => {
    const { container } = render(() => (
      <Popover.Root>
        <Popover.Trigger>Filters</Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Filters</Popover.Title>
          <Popover.Description>Narrow the list</Popover.Description>
        </Popover.Content>
      </Popover.Root>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations when open', async () => {
    render(() => (
      <Popover.Root defaultOpen>
        <Popover.Trigger>Filters</Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Filters</Popover.Title>
          <Popover.Description>Narrow the list</Popover.Description>
          <Popover.Close>Done</Popover.Close>
        </Popover.Content>
      </Popover.Root>
    ))
    expect(await screen.findByText('Narrow the list')).toBeTruthy()
    expect(summarize(await axe.run(document.body, AXE_OPTIONS))).toEqual([])
  })
})

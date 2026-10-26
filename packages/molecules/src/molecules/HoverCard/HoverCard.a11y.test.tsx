import { render, screen } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { HoverCard } from './HoverCard'

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

describe('HoverCard accessibility', () => {
  it('has no axe violations when the card is open', async () => {
    const { baseElement } = render(() => (
      <HoverCard.Root defaultOpen>
        <HoverCard.Trigger>@talel</HoverCard.Trigger>
        <HoverCard.Content>
          <p>Talel builds design systems.</p>
        </HoverCard.Content>
      </HoverCard.Root>
    ))

    expect(screen.getByText('Talel builds design systems.')).toBeTruthy()
    expect(summarize(await axe.run(baseElement, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations when the card is closed', async () => {
    const { container } = render(() => (
      <HoverCard.Root>
        <HoverCard.Trigger>@talel</HoverCard.Trigger>
        <HoverCard.Content>
          <p>Talel builds design systems.</p>
        </HoverCard.Content>
      </HoverCard.Root>
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})

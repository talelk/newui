import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { HoverCard } from './HoverCard'

describe('HoverCard', () => {
  it('portals the content when open', async () => {
    render(() => (
      <HoverCard.Root defaultOpen>
        <HoverCard.Trigger>@talel</HoverCard.Trigger>
        <HoverCard.Content>Longer profile blurb</HoverCard.Content>
      </HoverCard.Root>
    ))
    expect(await screen.findByText('Longer profile blurb')).toBeTruthy()
    expect(
      document.querySelector('[data-slot="hover-card-content"]'),
    ).not.toBeNull()
  })
})

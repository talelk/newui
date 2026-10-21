import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Popover } from './Popover'

describe('Popover', () => {
  it('exposes an expandable trigger and portals the content when open', async () => {
    render(() => (
      <Popover.Root defaultOpen>
        <Popover.Trigger>Filters</Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Filters</Popover.Title>
          <Popover.Description>Narrow the list</Popover.Description>
        </Popover.Content>
      </Popover.Root>
    ))

    expect(
      screen
        .getByRole('button', { name: 'Filters' })
        .getAttribute('aria-expanded'),
    ).toBe('true')
    expect(await screen.findByText('Narrow the list')).toBeTruthy()
    // Portalled out of the render container.
    expect(
      document.querySelector('[data-slot="popover-content"]'),
    ).not.toBeNull()
  })

  it('stays closed by default', () => {
    render(() => (
      <Popover.Root>
        <Popover.Trigger>Filters</Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Filters</Popover.Title>
        </Popover.Content>
      </Popover.Root>
    ))
    expect(document.querySelector('[data-slot="popover-content"]')).toBeNull()
  })
})

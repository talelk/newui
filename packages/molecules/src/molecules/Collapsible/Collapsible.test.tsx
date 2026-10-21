import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Collapsible } from './Collapsible'

function Example(props: {
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <Collapsible.Root
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
    >
      <Collapsible.Trigger>More options</Collapsible.Trigger>
      <Collapsible.Content>Hidden by default.</Collapsible.Content>
    </Collapsible.Root>
  )
}

describe('Collapsible', () => {
  it('starts closed and says so', () => {
    render(() => <Example />)
    const trigger = screen.getByRole('button', { name: 'More options' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('opens on click and reports the change', async () => {
    const onOpenChange = vi.fn()
    render(() => <Example onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'More options' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    expect(
      screen
        .getByRole('button', { name: 'More options' })
        .getAttribute('aria-expanded'),
    ).toBe('true')
  })

  it('closes again on a second click', async () => {
    const onOpenChange = vi.fn()
    render(() => <Example onOpenChange={onOpenChange} />)

    const trigger = screen.getByRole('button', { name: 'More options' })
    await userEvent.click(trigger)
    await userEvent.click(trigger)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('wires the trigger to the panel it controls', () => {
    render(() => <Example defaultOpen />)
    const trigger = screen.getByRole('button', { name: 'More options' })
    const panel = document.getElementById(
      trigger.getAttribute('aria-controls') ?? '',
    )
    expect(panel?.textContent).toContain('Hidden by default.')
  })

  it('honours defaultOpen', () => {
    render(() => <Example defaultOpen />)
    expect(
      screen
        .getByRole('button', { name: 'More options' })
        .getAttribute('aria-expanded'),
    ).toBe('true')
  })

  it('can hide its own chevron', () => {
    render(() => (
      <Collapsible.Root>
        <Collapsible.Trigger hideIndicator>More</Collapsible.Trigger>
        <Collapsible.Content>Body</Collapsible.Content>
      </Collapsible.Root>
    ))
    const trigger = screen.getByRole('button', { name: 'More' })
    const indicator = trigger.querySelector('[aria-hidden="true"]')
    expect(indicator).toBeNull()
  })
})

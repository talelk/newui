import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Accordion } from './Accordion'

function Example(props: {
  multiple?: boolean
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}) {
  return (
    <Accordion.Root
      multiple={props.multiple}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
    >
      <Accordion.Item value="one">
        <Accordion.Trigger>First</Accordion.Trigger>
        <Accordion.Content>First panel</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="two">
        <Accordion.Trigger>Second</Accordion.Trigger>
        <Accordion.Content>Second panel</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="three" disabled>
        <Accordion.Trigger>Third</Accordion.Trigger>
        <Accordion.Content>Third panel</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  )
}

describe('Accordion', () => {
  it('renders one trigger per item, all collapsed by default', () => {
    render(() => <Example />)

    const triggers = screen.getAllByRole('button')
    expect(triggers).toHaveLength(3)
    for (const trigger of triggers) {
      expect(trigger.getAttribute('aria-expanded')).toBe('false')
    }
  })

  it('opens the panel named by defaultValue and wires it to its trigger', () => {
    render(() => <Example defaultValue={['two']} />)

    const trigger = screen.getByRole('button', { name: 'Second' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    // `aria-controls` points at the panel, and the panel points back with
    // `aria-labelledby` — the machine's wiring, not ours.
    const controls = trigger.getAttribute('aria-controls')
    const panel = document.getElementById(controls ?? '')
    expect(panel?.textContent).toContain('Second panel')
    expect(panel?.getAttribute('aria-labelledby')).toBe(trigger.id)
  })

  it('toggles on click and reports the value', async () => {
    const onValueChange = vi.fn()
    render(() => <Example onValueChange={onValueChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'First' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['one'])
    expect(
      screen
        .getByRole('button', { name: 'First' })
        .getAttribute('aria-expanded'),
    ).toBe('true')
  })

  it('closes the open panel again when collapsible (the default)', async () => {
    render(() => <Example defaultValue={['one']} />)

    await userEvent.click(screen.getByRole('button', { name: 'First' }))
    expect(
      screen
        .getByRole('button', { name: 'First' })
        .getAttribute('aria-expanded'),
    ).toBe('false')
  })

  it('keeps one panel open at a time unless multiple is set', async () => {
    render(() => <Example />)

    await userEvent.click(screen.getByRole('button', { name: 'First' }))
    await userEvent.click(screen.getByRole('button', { name: 'Second' }))
    expect(
      screen
        .getByRole('button', { name: 'First' })
        .getAttribute('aria-expanded'),
    ).toBe('false')
    expect(
      screen
        .getByRole('button', { name: 'Second' })
        .getAttribute('aria-expanded'),
    ).toBe('true')
  })

  it('leaves more than one panel open when multiple is set', async () => {
    render(() => <Example multiple />)

    await userEvent.click(screen.getByRole('button', { name: 'First' }))
    await userEvent.click(screen.getByRole('button', { name: 'Second' }))
    expect(
      screen
        .getByRole('button', { name: 'First' })
        .getAttribute('aria-expanded'),
    ).toBe('true')
    expect(
      screen
        .getByRole('button', { name: 'Second' })
        .getAttribute('aria-expanded'),
    ).toBe('true')
  })

  it('disables a disabled item', () => {
    render(() => <Example />)
    const third = screen.getByRole('button', { name: 'Third' })
    // Zag marks the trigger with the native `disabled` attribute rather than a
    // `data-disabled`, so a browser will not focus it either.
    expect(third.hasAttribute('disabled')).toBe(true)
  })

  it('moves between triggers with the arrow keys, rooting out the disabled one', async () => {
    render(() => <Example />)

    screen.getByRole('button', { name: 'First' }).focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement?.textContent).toContain('Second')
    // `three` is disabled, so Down wraps back to the first trigger.
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement?.textContent).toContain('First')
  })

  it('puts the trigger inside the heading level it is given', () => {
    render(() => (
      <Accordion.Root>
        <Accordion.Item value="x" headingLevel="h2">
          <Accordion.Trigger>Section</Accordion.Trigger>
          <Accordion.Content>Body</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    ))

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.textContent).toContain('Section')
  })

  it('exposes the panel as a region', () => {
    render(() => <Example defaultValue={['one']} />)
    expect(screen.getByRole('region', { name: 'First' })).toBeTruthy()
  })
})

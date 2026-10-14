import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Tabs } from './Tabs'

function Example(props: { onValueChange?: (value: string) => void }) {
  return (
    <Tabs.Root defaultValue="one" onValueChange={props.onValueChange}>
      <Tabs.List>
        <Tabs.Trigger value="one">One</Tabs.Trigger>
        <Tabs.Trigger value="two">Two</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="one">First panel</Tabs.Content>
      <Tabs.Content value="two">Second panel</Tabs.Content>
    </Tabs.Root>
  )
}

describe('Tabs', () => {
  it('renders a tablist with the default tab selected', () => {
    render(() => <Example />)

    expect(screen.getByRole('tablist')).toBeTruthy()
    expect(
      screen.getByRole('tab', { name: 'One' }).getAttribute('aria-selected'),
    ).toBe('true')
    // Only the selected panel is exposed to the accessibility tree; the other
    // is rendered but `hidden`.
    expect(screen.getByRole('tabpanel').textContent).toContain('First panel')
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
  })

  it('reports tab changes', async () => {
    const onValueChange = vi.fn()
    render(() => <Example onValueChange={onValueChange} />)

    await userEvent.click(screen.getByRole('tab', { name: 'Two' }))
    expect(onValueChange).toHaveBeenCalledWith('two')
  })

  it('defaults to the underline variant', () => {
    render(() => <Example />)
    expect(screen.getByRole('tablist').getAttribute('data-variant')).toBe(
      'underline',
    )
  })

  it('takes a variant and size from the list', () => {
    render(() => (
      <Tabs.Root defaultValue="one">
        <Tabs.List variant="ghost" size="md">
          <Tabs.Trigger value="one">One</Tabs.Trigger>
          <Tabs.Trigger value="two">Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="one">First panel</Tabs.Content>
      </Tabs.Root>
    ))
    const list = screen.getByRole('tablist')
    expect(list.getAttribute('data-variant')).toBe('ghost')
    expect(list.getAttribute('data-size')).toBe('md')
  })

  it('marks the selected trigger active and renders an indicator', () => {
    const { container } = render(() => <Example />)
    const selected = screen.getByRole('tab', { name: 'One' })
    expect(selected.getAttribute('data-state')).toBe('active')
    expect(container.querySelector('[data-slot="tab-indicator"]')).toBeTruthy()
  })
})

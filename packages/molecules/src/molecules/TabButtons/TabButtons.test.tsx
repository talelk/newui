import { render } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TabButtons } from './TabButtons'

const OPTIONS = [
  { label: 'List', value: 'list' },
  { label: 'Board', value: 'board' },
]

describe('TabButtons', () => {
  it('renders a labelled radiogroup with the first option checked', () => {
    const { getAllByRole, getByRole } = render(() => (
      <TabButtons label="View" options={OPTIONS} />
    ))
    expect(getByRole('radiogroup', { name: 'View' })).toBeTruthy()
    const radios = getAllByRole('radio')
    expect(radios[0]?.getAttribute('aria-checked')).toBe('true')
    expect(radios[0]?.getAttribute('role')).toBe('radio')
  })

  it('reports changes through onValueChange', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(() => (
      <TabButtons
        label="View"
        options={OPTIONS}
        onValueChange={onValueChange}
      />
    ))
    await userEvent.click(getByRole('radio', { name: 'Board' }))
    expect(onValueChange).toHaveBeenCalledWith('board')
  })

  it('marks the active option and drops the mark from the rest', () => {
    const { getAllByRole } = render(() => (
      <TabButtons label="View" options={OPTIONS} defaultValue="board" />
    ))
    const radios = getAllByRole('radio')
    expect(radios[0]?.getAttribute('data-state')).toBe('inactive')
    expect(radios[1]?.getAttribute('data-state')).toBe('active')
  })

  it('uses one tab stop and skips disabled options with keyboard navigation', async () => {
    const { getByRole } = render(() => (
      <TabButtons
        label="View"
        options={[
          ...OPTIONS,
          { label: 'Disabled', value: 'disabled', disabled: true },
          { label: 'Calendar', value: 'calendar' },
        ]}
      />
    ))
    const list = getByRole('radio', { name: 'List' })
    list.focus()
    await userEvent.keyboard('{End}')
    expect(getByRole('radio', { name: 'Calendar' })).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(getByRole('radio', { name: 'Board' })).toHaveFocus()
    expect(list.tabIndex).toBe(-1)
    await userEvent.keyboard('{Home}')
    expect(list).toHaveFocus()
  })

  it('sets a vertical orientation', () => {
    const { getByRole } = render(() => (
      <TabButtons label="View" options={OPTIONS} vertical />
    ))
    expect(getByRole('radiogroup').getAttribute('aria-orientation')).toBe(
      'vertical',
    )
  })

  it('renders the sliding indicator for pill variants', () => {
    const { container } = render(() => (
      <TabButtons label="View" options={OPTIONS} variant="subtle" />
    ))
    expect(container.querySelector('[data-slot="tab-indicator"]')).toBeTruthy()
  })

  it('wraps without the absolute indicator', () => {
    const { container, getByRole } = render(() => (
      <TabButtons label="Sections" options={OPTIONS} wrap />
    ))
    const group = getByRole('radiogroup')
    expect(group.hasAttribute('data-wrap')).toBe(true)
    expect(group.className).toContain('flex-wrap')
    expect(container.querySelector('[data-slot="tab-indicator"]')).toBeNull()
  })
})

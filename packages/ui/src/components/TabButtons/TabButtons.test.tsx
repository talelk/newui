import { render } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TabButtons } from './TabButtons'

const OPTIONS = [
  { label: 'List', value: 'list' },
  { label: 'Board', value: 'board' },
]

describe('TabButtons', () => {
  it('renders a tablist with the first option selected', () => {
    const { getAllByRole, getByRole } = render(() => (
      <TabButtons options={OPTIONS} />
    ))
    expect(getByRole('tablist')).toBeTruthy()
    const tabs = getAllByRole('tab')
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true')
  })

  it('reports changes through onValueChange', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(() => (
      <TabButtons options={OPTIONS} onValueChange={onValueChange} />
    ))
    await userEvent.click(getByRole('tab', { name: 'Board' }))
    expect(onValueChange).toHaveBeenCalledWith('board')
  })

  it('marks the active option and drops the mark from the rest', () => {
    const { getAllByRole } = render(() => (
      <TabButtons options={OPTIONS} defaultValue="board" />
    ))
    const tabs = getAllByRole('tab')
    expect(tabs[0]?.getAttribute('data-state')).toBe('inactive')
    expect(tabs[1]?.getAttribute('data-state')).toBe('active')
  })

  it('sets a vertical orientation', () => {
    const { getByRole } = render(() => (
      <TabButtons options={OPTIONS} vertical />
    ))
    expect(getByRole('tablist').getAttribute('aria-orientation')).toBe(
      'vertical',
    )
  })

  it('renders the sliding indicator for pill variants', () => {
    const { container } = render(() => (
      <TabButtons options={OPTIONS} variant="subtle" />
    ))
    expect(container.querySelector('[data-slot="tab-indicator"]')).toBeTruthy()
  })
})

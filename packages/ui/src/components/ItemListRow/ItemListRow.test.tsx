import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ItemListRow } from './ItemListRow'

function row(): HTMLElement {
  return document.querySelector('[data-slot="item-list-row"]') as HTMLElement
}

function region(slot: string): HTMLElement | null {
  return document.querySelector(`[data-slot="${slot}"]`)
}

describe('ItemListRow', () => {
  it('renders the default label region', () => {
    render(() => <ItemListRow>Row label</ItemListRow>)
    expect(region('item-label')?.textContent).toBe('Row label')
    expect(row().getAttribute('data-size')).toBe('sm')
    expect(row().getAttribute('data-state')).toBe('inactive')
  })

  it('lets the label prop replace the default content', () => {
    render(() => <ItemListRow label="Named label">Default label</ItemListRow>)
    expect(region('item-label')?.textContent).toBe('Named label')
  })

  it('renders #prefix and #suffix content when provided', () => {
    render(() => (
      <ItemListRow prefix={<span>P</span>} suffix={<span>S</span>}>
        Row
      </ItemListRow>
    ))
    expect(region('item-prefix')?.textContent).toBe('P')
    expect(region('item-suffix')?.textContent).toBe('S')
  })

  it('omits empty prefix and suffix regions', () => {
    render(() => <ItemListRow>Row</ItemListRow>)
    expect(region('item-prefix')).toBeNull()
    expect(region('item-suffix')).toBeNull()
  })

  it('treats selected rows as active styling', () => {
    render(() => <ItemListRow selected>Selected row</ItemListRow>)
    expect(row().getAttribute('data-state')).toBe('active')
    expect(row().getAttribute('data-disabled')).toBeNull()
    expect(row().className).toContain('bg-surface-gray-3')
  })

  it('renders disabled hooks and mutes the row', () => {
    render(() => <ItemListRow disabled>Disabled row</ItemListRow>)
    expect(row().getAttribute('data-disabled')).toBe('')
    expect(row().className).toContain('text-ink-gray-4')
  })

  it('reflects size via data-size', () => {
    render(() => <ItemListRow size="lg">Row</ItemListRow>)
    expect(row().getAttribute('data-size')).toBe('lg')
  })

  it('passes role and click handlers through to the row', async () => {
    const onClick = vi.fn()
    render(() => (
      <ItemListRow role="option" aria-selected="true" onClick={onClick}>
        Option
      </ItemListRow>
    ))
    expect(screen.getByRole('option').getAttribute('aria-selected')).toBe(
      'true',
    )
    await userEvent.click(row())
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders another element via as', () => {
    render(() => (
      <ItemListRow as="button" type="button">
        Button row
      </ItemListRow>
    ))
    expect(row().tagName).toBe('BUTTON')
  })
})

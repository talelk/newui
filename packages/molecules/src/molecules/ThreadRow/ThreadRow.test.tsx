import { render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ThreadRow } from './ThreadRow'

function row(): HTMLElement {
  return document.querySelector('[data-slot="thread-row"]') as HTMLElement
}

describe('ThreadRow', () => {
  it('renders title, snippet, meta and time', () => {
    render(() => (
      <ThreadRow
        title="Renewal pricing for Q1"
        snippet="Procurement signed off on the 8% tier"
        meta="12 replies · #pricing"
        time="2h"
      />
    ))
    expect(row().textContent).toContain('Renewal pricing for Q1')
    expect(row().textContent).toContain('Procurement signed off')
    expect(row().textContent).toContain('12 replies')
    expect(row().textContent).toContain('2h')
  })

  it('marks unread rows and carries state on the data hooks', () => {
    render(() => <ThreadRow title="T" unread />)
    expect(row().getAttribute('data-unread')).toBe('true')
    expect(row().querySelector('[title="Unread"]')).not.toBeNull()
    expect(
      row().querySelector('[data-slot="thread-row-title"]')?.className,
    ).toContain('font-semibold')
  })

  it('marks the open thread as selected', () => {
    render(() => <ThreadRow title="T" selected />)
    expect(row().getAttribute('data-state')).toBe('active')
    expect(row().getAttribute('aria-current')).toBe('true')
    expect(row().className).toContain('bg-surface-blue-2')
  })

  it('reflects disabled without blocking clicks itself', () => {
    const onClick = vi.fn()
    render(() => <ThreadRow title="T" disabled onClick={onClick} />)
    expect(row().getAttribute('data-disabled')).toBe('true')
    row().click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders through as="button" with the default type', async () => {
    const userEvent = (await import('@testing-library/user-event')).default
    const onOpen = vi.fn()
    render(() => <ThreadRow as="button" title="T" onClick={onOpen} />)
    expect(row().tagName).toBe('BUTTON')
    expect(row().getAttribute('type')).toBe('button')
    await userEvent.click(row())
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it('omits the meta line when there is none', () => {
    render(() => <ThreadRow title="T" />)
    expect(row().textContent).not.toContain('replies')
  })
})

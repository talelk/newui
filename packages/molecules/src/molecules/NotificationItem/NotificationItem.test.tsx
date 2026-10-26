import { render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { NotificationItem } from './NotificationItem'

function row(): HTMLElement {
  return document.querySelector(
    '[data-slot="notification-item"]',
  ) as HTMLElement
}

describe('NotificationItem', () => {
  it('renders title, description, time and a default bell tile', () => {
    render(() => (
      <NotificationItem
        title="Contract approved"
        description="Acme · Master services agreement"
        time="5m"
      />
    ))
    expect(row().textContent).toContain('Contract approved')
    expect(row().textContent).toContain('Master services agreement')
    expect(row().textContent).toContain('5m')
    expect(row().querySelector('.lucide-bell')).not.toBeNull()
  })

  it('renders a custom event icon', () => {
    render(() => <NotificationItem title="T" icon="lucide-user-plus" />)
    expect(row().querySelector('.lucide-user-plus')).not.toBeNull()
  })

  it('marks unread rows and carries state on the data hooks', () => {
    render(() => <NotificationItem title="T" unread />)
    expect(row().getAttribute('data-unread')).toBe('true')
    expect(row().querySelector('[title="Unread"]')).not.toBeNull()
    expect(
      row().querySelector('[data-slot="notification-item-title"]')?.className,
    ).toContain('font-semibold')
  })

  it('marks the row as selected and reflects disabled', () => {
    const { unmount } = render(() => <NotificationItem title="T" selected />)
    expect(row().getAttribute('aria-current')).toBe('true')
    expect(row().className).toContain('bg-surface-blue-2')
    unmount()
    render(() => <NotificationItem title="T" disabled />)
    expect(row().getAttribute('data-disabled')).toBe('true')
  })

  it('keeps actions visible with the unread dot', () => {
    render(() => (
      <NotificationItem
        title="T"
        unread
        suffix={<button type="button">Mark read</button>}
      />
    ))
    expect(row().textContent).toContain('Mark read')
  })

  it('passes clicks through to the app handler', () => {
    const onOpen = vi.fn()
    render(() => <NotificationItem title="T" onClick={onOpen} />)
    row().click()
    expect(onOpen).toHaveBeenCalledOnce()
  })
})

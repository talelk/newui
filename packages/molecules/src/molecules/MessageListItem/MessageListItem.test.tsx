import { render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { MessageListItem } from './MessageListItem'

function row(): HTMLElement {
  return document.querySelector(
    '[data-slot="message-list-item"]',
  ) as HTMLElement
}

describe('MessageListItem', () => {
  it('renders sender, subject, snippet and time', () => {
    render(() => (
      <MessageListItem
        sender="Ana Costa"
        subject="Invoice 4821"
        snippet="Added the late fee line — take a look"
        time="14:32"
      />
    ))
    expect(row().textContent).toContain('Ana Costa')
    expect(row().textContent).toContain('Invoice 4821')
    expect(row().textContent).toContain('late fee line')
    expect(row().textContent).toContain('14:32')
  })

  it('marks unread rows and carries state on the data hooks', () => {
    render(() => <MessageListItem sender="A" subject="S" unread />)
    expect(row().getAttribute('data-unread')).toBe('true')
    expect(row().querySelector('[title="Unread"]')).not.toBeNull()
    expect(
      row().querySelector('[data-slot="message-list-item-sender"]')?.className,
    ).toContain('font-semibold')
  })

  it('marks the open conversation as selected', () => {
    render(() => <MessageListItem sender="A" subject="S" selected />)
    expect(row().getAttribute('data-state')).toBe('active')
    expect(row().getAttribute('aria-current')).toBe('true')
    expect(row().className).toContain('bg-surface-blue-2')
  })

  it('reflects disabled without blocking clicks itself', () => {
    const onClick = vi.fn()
    render(() => (
      <MessageListItem sender="A" subject="S" disabled onClick={onClick} />
    ))
    expect(row().getAttribute('data-disabled')).toBe('true')
    row().click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders through as="a" with the destination', () => {
    render(() => (
      <MessageListItem as="a" href="/mail/4821" sender="A" subject="S" />
    ))
    expect(row().tagName).toBe('A')
    expect(row().getAttribute('href')).toBe('/mail/4821')
  })

  it('keeps the suffix visible alongside the unread dot', () => {
    render(() => (
      <MessageListItem
        sender="A"
        subject="S"
        unread
        suffix={<button type="button">Star</button>}
      />
    ))
    expect(row().textContent).toContain('Star')
  })
})

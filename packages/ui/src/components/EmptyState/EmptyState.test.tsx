import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('shows the title, the description and the action', () => {
    render(() => (
      <EmptyState
        icon="lucide-inbox"
        title="No invoices yet"
        description="Once a customer pays, the invoice lands here."
        action={<button type="button">Create an invoice</button>}
      />
    ))

    expect(screen.getByText('No invoices yet')).toBeTruthy()
    expect(
      screen.getByText('Once a customer pays, the invoice lands here.'),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Create an invoice' }),
    ).toBeTruthy()
  })

  it('renders no glyph when there is no icon', () => {
    const { container } = render(() => <EmptyState title="Nothing here" />)
    expect(container.querySelector('[data-slot="empty-state-icon"]')).toBeNull()
  })

  it('renders a tinted tile for the icon', () => {
    const { container } = render(() => (
      <EmptyState icon="lucide-inbox" title="Empty" />
    ))
    const tile = container.querySelector('[data-slot="empty-state-icon"]')
    expect(tile?.querySelector('.lucide-inbox')).toBeTruthy()
  })

  it('carries the size through to the data attribute', () => {
    const { container } = render(() => <EmptyState title="Empty" size="lg" />)
    expect(
      container
        .querySelector('[data-slot="empty-state"]')
        ?.getAttribute('data-size'),
    ).toBe('lg')
  })

  it('draws a frame only when asked', () => {
    const plain = render(() => <EmptyState title="Empty" />)
    expect(
      plain.container.querySelector('[data-slot="empty-state"]')?.className,
    ).not.toContain('border-dashed')
    plain.unmount()

    const framed = render(() => <EmptyState title="Empty" bordered />)
    expect(
      framed.container.querySelector('[data-slot="empty-state"]')?.className,
    ).toContain('border-dashed')
  })

  it('omits the description line when there is none', () => {
    const { container } = render(() => <EmptyState title="Only a title" />)
    expect(container.querySelectorAll('p')).toHaveLength(1)
  })
})

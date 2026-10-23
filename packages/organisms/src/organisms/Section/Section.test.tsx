import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Section } from './Section'

describe('Section', () => {
  it('renders a default H2 and the four region slots', () => {
    render(() => (
      <Section
        title="Pending expenses"
        description="Waiting for approval"
        actions={<button type="button">Export</button>}
        toolbar={<div>Filters</div>}
        footer={<span>18 records</span>}
      >
        <div>Body</div>
      </Section>
    ))
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
      'Pending expenses',
    )
    expect(screen.getByText('Waiting for approval')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Export' })).toBeTruthy()
    expect(screen.getByText('Filters')).toBeTruthy()
    expect(screen.getByText('Body')).toBeTruthy()
    expect(screen.getByText('18 records')).toBeTruthy()
  })

  it('honours the heading level and compact density', () => {
    const { container } = render(() => (
      <Section title="Ledger" headingLevel={3} density="compact">
        <div />
      </Section>
    ))
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('Ledger')
    expect(
      container
        .querySelector('[data-slot="section"]')
        ?.getAttribute('data-density'),
    ).toBe('compact')
  })
})

import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Timeline } from './Timeline'

const ITEMS = [
  { title: 'Opened', timestamp: '1d ago', icon: 'lucide-plus' },
  {
    title: 'Reviewed',
    description: 'Approved.',
    timestamp: '5h ago',
    tone: 'blue' as const,
  },
  {
    title: 'Deployed',
    description: 'Went live.',
    timestamp: '2h ago',
    tone: 'green' as const,
  },
]

describe('Timeline', () => {
  it('renders one list item per event, in order', () => {
    render(() => <Timeline items={ITEMS} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]?.textContent).toContain('Opened')
    expect(items[2]?.textContent).toContain('Deployed')
  })

  it('is a list, so assistive tech announces the count', () => {
    render(() => <Timeline items={ITEMS} />)
    expect(screen.getByRole('list').children).toHaveLength(3)
  })

  it('hides the rail and the markers from assistive tech', () => {
    const { container } = render(() => <Timeline items={ITEMS} />)
    const rails = container.querySelectorAll('[aria-hidden="true"]')
    // Two half-rails per middle item and one on the last — plus each marker.
    expect(rails.length).toBeGreaterThan(0)
    expect(
      container.querySelectorAll('[data-slot="timeline-marker"]').length,
    ).toBe(3)
  })

  it('leaves no rail dangling above the first or below the last marker', () => {
    const { container } = render(() => <Timeline items={ITEMS} />)
    const rows = container.querySelectorAll(
      '[data-slot="timeline-item"] > div:first-child',
    )
    expect(rows[0]?.children).toHaveLength(2) // marker + the rail below it
    expect(rows[2]?.children).toHaveLength(2) // marker + the rail above it
    expect(rows[1]?.children).toHaveLength(3) // marker + both halves
  })

  it('shows a timestamp and a description only where given', () => {
    const { container } = render(() => <Timeline items={ITEMS} />)
    expect(container.textContent).toContain('5h ago')
    expect(container.textContent).toContain('Approved.')
    // The first item has no description.
    const first = screen.getAllByRole('listitem')[0]
    expect(first?.querySelectorAll('p')).toHaveLength(1)
  })

  it('falls back to a plain dot when there is no icon', () => {
    const { container } = render(() => (
      <Timeline items={[{ title: 'No icon' }]} />
    ))
    const marker = container.querySelector('[data-slot="timeline-marker"]')
    expect(marker?.querySelector('.lucide-plus')).toBeNull()
    expect(marker?.querySelector('span.size-1\\.5')).toBeTruthy()
  })
})

import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { StatGrid } from './StatGrid'

describe('StatGrid', () => {
  it('renders a label, a value and a hint per stat', () => {
    render(() => (
      <StatGrid
        stats={[
          {
            label: 'Net revenue',
            value: '$220.2K',
            hint: 'vs last month',
            delta: { value: '5.1%', direction: 'up' },
          },
        ]}
      />
    ))
    expect(screen.getByText('Net revenue')).toBeTruthy()
    expect(screen.getByText('$220.2K')).toBeTruthy()
    expect(screen.getByText('vs last month')).toBeTruthy()
  })

  it('tones a fall by whether it is good, not by its direction', () => {
    const down = render(() => (
      <StatGrid
        stats={[
          {
            label: 'Monthly churn',
            value: '2.1%',
            delta: { value: '0.4 pts', direction: 'down', good: true },
          },
        ]}
      />
    ))
    // Toned text straight on the cell — the contrast contract's ink-*-8 on
    // surface-elevation-1. A pill would be a second shape competing with the
    // figure it qualifies.
    expect(screen.getByText('0.4 pts').className).toContain('text-ink-green-8')
    expect(screen.getByText('0.4 pts').className).not.toContain('rounded-pill')
    down.unmount()

    render(() => (
      <StatGrid
        stats={[
          {
            label: 'Revenue',
            value: '$1',
            delta: { value: '2%', direction: 'down' },
          },
        ]}
      />
    ))
    expect(screen.getByText('2%').className).toContain('text-ink-red-8')
  })

  it('is a button when it navigates, a card when it does not', async () => {
    const onClick = vi.fn()
    const plain = render(() => (
      <StatGrid stats={[{ label: 'Static', value: '1' }]} />
    ))
    expect(plain.container.querySelector('button')).toBeNull()
    plain.unmount()

    render(() => <StatGrid stats={[{ label: 'Live', value: '2', onClick }]} />)
    await userEvent.click(screen.getByRole('button', { name: /Live/ }))
    expect(onClick).toHaveBeenCalled()
  })

  it('uses literal grid classes so Tailwind can see them', () => {
    const { container } = render(() => (
      <StatGrid stats={[{ label: 'One', value: '1' }]} columns={3} />
    ))
    const className = container.querySelector(
      '[data-slot="stat-grid"]',
    )?.className
    expect(className).toContain('min-[360px]:grid-cols-2')
    expect(className).toContain('lg:grid-cols-3')
  })

  it('reads as one ruled strip, not a row of cards', () => {
    const { container } = render(() => (
      <StatGrid
        stats={[
          { label: 'One', value: '1' },
          { label: 'Two', value: '2' },
        ]}
      />
    ))
    const strip = container.querySelector('[data-slot="stat-grid"]')
    // The sheet's outline shows through a 1px gap as the rules between cells.
    expect(strip?.className).toContain('gap-px')
    expect(strip?.className).toContain('bg-outline-gray-1')
    expect(strip?.className).toContain('rounded-card')
    const cells = container.querySelectorAll('[data-slot="stat"]')
    expect(cells).toHaveLength(2)
    for (const cell of cells) {
      expect(cell.className).toContain('bg-surface-elevation-1')
      expect(cell.className).not.toContain('rounded-card')
    }
  })

  it('compact cells use the tight padding and omit the icon', () => {
    const { container } = render(() => (
      <StatGrid
        compact
        stats={[{ label: 'One', value: '1', icon: 'lucide-house' }]}
      />
    ))
    const cell = container.querySelector('[data-slot="stat"]')
    expect(cell?.className).toContain('px-3')
    expect(cell?.className).toContain('py-2')
    expect(cell?.querySelector('.lucide-house')).toBeNull()
  })

  it('leaves room for whole words in regular mobile labels', () => {
    const { container } = render(() => (
      <StatGrid
        stats={[
          { label: 'Average order value', value: '1', icon: 'lucide-house' },
        ]}
      />
    ))
    const icon = container.querySelector('.lucide-house')
    const label = screen.getByText('Average order value')
    expect(icon?.getAttribute('class')).toContain('hidden')
    expect(icon?.getAttribute('class')).toContain('sm:block')
    expect(label.className).toContain('break-words')
    expect(label.className).not.toContain('[overflow-wrap:anywhere]')
  })
})

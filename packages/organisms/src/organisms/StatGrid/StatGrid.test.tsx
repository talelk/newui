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
    // The pill pairing is the contrast contract's ink-*-8 on surface-*-2.
    expect(screen.getByText('0.4 pts').className).toContain('text-ink-green-8')
    expect(screen.getByText('0.4 pts').className).toContain(
      'bg-surface-green-2',
    )
    expect(screen.getByText('0.4 pts').className).toContain('rounded-full')
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
    expect(screen.getByText('2%').className).toContain('bg-surface-red-2')
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
    expect(className).toContain('xl:grid-cols-3')
  })

  it('compact cards use the tight padding and omit the icon tile', () => {
    const { container } = render(() => (
      <StatGrid
        compact
        stats={[{ label: 'One', value: '1', icon: 'lucide-house' }]}
      />
    ))
    const card = container.querySelector('[data-slot="stat"]')
    expect(card?.className).toContain('p-2.5')
    expect(card?.querySelector('.bg-surface-gray-2')).toBeNull()
  })

  it('leaves room for whole words in regular mobile labels', () => {
    const { container } = render(() => (
      <StatGrid
        stats={[
          { label: 'Average order value', value: '1', icon: 'lucide-house' },
        ]}
      />
    ))
    const icon = container.querySelector('.bg-surface-gray-2')
    const label = screen.getByText('Average order value')
    expect(icon?.className).toContain('hidden')
    expect(icon?.className).toContain('sm:grid')
    expect(label.className).toContain('break-words')
    expect(label.className).not.toContain('[overflow-wrap:anywhere]')
  })
})

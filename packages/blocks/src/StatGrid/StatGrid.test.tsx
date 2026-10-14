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
    expect(screen.getByText('0.4 pts').className).toContain('text-ink-green-7')
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
    expect(screen.getByText('2%').className).toContain('text-ink-red-7')
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

  it('uses a literal grid class so Tailwind can see it', () => {
    const { container } = render(() => (
      <StatGrid stats={[{ label: 'One', value: '1' }]} columns={3} />
    ))
    expect(
      container.querySelector('[data-slot="stat-grid"]')?.className,
    ).toContain('sm:grid-cols-3')
  })
})

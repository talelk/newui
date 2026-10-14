import { render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ChartLegend } from './ChartLegend'

const items = [
  { name: 'sales', label: 'Sales', color: '#111111' },
  { name: 'refunds', label: 'Refunds', color: '#222222', hidden: true },
]

describe('ChartLegend', () => {
  it('renders one toggle per series, pressed when the series is visible', () => {
    const { container } = render(() => <ChartLegend items={items} />)
    const buttons = container.querySelectorAll(
      '[data-slot="chart-legend-item"]',
    )
    expect(buttons).toHaveLength(2)
    expect(buttons[0]?.getAttribute('aria-pressed')).toBe('true')
    expect(buttons[1]?.getAttribute('aria-pressed')).toBe('false')
    // The accessible name says what the press does, not just the state.
    expect(buttons[1]?.getAttribute('aria-label')).toBe('Show Refunds')
  })

  it('toggles and highlights through its callbacks', () => {
    const onToggle = vi.fn()
    const onHighlight = vi.fn()
    const { container } = render(() => (
      <ChartLegend
        items={items}
        onToggle={onToggle}
        onHighlight={onHighlight}
      />
    ))
    const first = container.querySelector(
      '[data-slot="chart-legend-item"]',
    ) as HTMLElement

    first.click()
    expect(onToggle).toHaveBeenCalledWith('sales')

    first.dispatchEvent(new MouseEvent('mouseenter'))
    expect(onHighlight).toHaveBeenCalledWith('sales')
  })
})

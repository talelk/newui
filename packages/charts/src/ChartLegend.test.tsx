import { render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ChartLegend } from './ChartLegend'

const items = [
  { name: 'sales', label: 'Sales', color: '#111111' },
  { name: 'refunds', label: 'Refunds', color: '#222222', hidden: true },
]

describe('ChartLegend', () => {
  it('renders a static legend when nobody can toggle or highlight it', () => {
    const { container } = render(() => <ChartLegend items={items} />)
    const entries = container.querySelectorAll(
      '[data-slot="chart-legend-item"]',
    )
    expect(entries).toHaveLength(2)
    expect(container.querySelector('button')).toBeNull()
    expect(entries[0]?.getAttribute('aria-pressed')).toBeNull()
    expect(entries[1]?.getAttribute('aria-label')).toBeNull()
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

  it('dims the other entries while one is highlighted', () => {
    const { container } = render(() => (
      <ChartLegend items={items} onHighlight={() => {}} />
    ))
    const buttons = container.querySelectorAll(
      '[data-slot="chart-legend-item"]',
    )
    ;(buttons[0] as HTMLElement).dispatchEvent(new MouseEvent('mouseenter'))
    expect((buttons[0] as HTMLElement).style.opacity).toBe('')
    expect((buttons[1] as HTMLElement).style.opacity).toBe('0.4')
    expect(buttons[1]?.getAttribute('data-dimmed')).toBe('true')
  })

  it('does not dim when no handler is wired', () => {
    const { container } = render(() => <ChartLegend items={items} />)
    const buttons = container.querySelectorAll(
      '[data-slot="chart-legend-item"]',
    )
    ;(buttons[0] as HTMLElement).dispatchEvent(new MouseEvent('mouseenter'))
    expect((buttons[1] as HTMLElement).style.opacity).toBe('')
  })
})

import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ChartTooltip } from './ChartTooltip'
import type { ChartTooltipItem } from './types'

const items: ChartTooltipItem[] = [
  {
    name: 'sales',
    label: 'Sales',
    color: '#318AD8',
    value: 10,
    formattedValue: '10',
    kind: 'series',
  },
  {
    name: 'refunds',
    label: 'Refunds',
    color: '#48BB74',
    value: 4,
    formattedValue: '4',
    kind: 'series',
  },
]

const tooltip = () =>
  document.querySelector('[data-slot="chart-tooltip"]') as HTMLElement | null

function mount(props: Partial<Parameters<typeof ChartTooltip>[0]> = {}) {
  return render(() => (
    <ChartTooltip open x={100} y={100} label="Jan" items={items} {...props} />
  ))
}

describe('ChartTooltip', () => {
  it('prints the category and a row per reading', () => {
    mount()
    expect(tooltip()).not.toBeNull()
    expect(tooltip()?.getAttribute('role')).toBe('tooltip')
    expect(tooltip()?.textContent).toContain('Jan')
    expect(tooltip()?.textContent).toContain('Sales')
    expect(tooltip()?.textContent).toContain('10')
    expect(tooltip()?.textContent).toContain('Refunds')
    expect(tooltip()?.textContent).toContain('4')
  })

  it('draws each row in the color of the series it stands for', () => {
    mount()
    const swatch = tooltip()?.querySelector(
      '[data-slot="chart-tooltip-swatch"]',
    ) as HTMLElement
    expect(swatch.style.backgroundColor).not.toBe('')
  })

  it('prints the share of the total where a chart measures one', () => {
    mount({
      label: undefined,
      items: [{ ...items[0], percent: 71.4 } as ChartTooltipItem],
    })
    expect(tooltip()?.textContent).toContain('10')
    expect(tooltip()?.textContent).toContain('71%')
  })

  it('prints no share where the chart measures none', () => {
    mount()
    expect(tooltip()?.textContent).not.toContain('%')
  })

  it('heads nothing when there is no category to head it with', () => {
    render(() => <ChartTooltip open x={100} y={100} items={items} />)
    expect(tooltip()).not.toBeNull()
    expect(tooltip()?.textContent).not.toContain('Jan')
  })

  it('separates context rows from the series, with no swatch of their own', () => {
    mount({
      items: [
        ...items,
        {
          name: 'orders',
          label: 'Orders',
          value: 1840,
          formattedValue: '1,840',
          kind: 'context',
        },
      ],
    })
    const context = tooltip()?.querySelector(
      '[data-slot="chart-tooltip-context"]',
    )
    expect(context?.textContent).toContain('Orders')
    expect(context?.textContent).toContain('1,840')
    expect(
      context?.querySelector('[data-slot="chart-tooltip-swatch"]'),
    ).toBeNull()
  })

  describe('when there is nothing to say', () => {
    it('draws nothing while closed', () => {
      mount({ open: false })
      expect(tooltip()).toBeNull()
    })

    it('draws nothing with no readings', () => {
      mount({ items: [] })
      expect(tooltip()).toBeNull()
    })
  })

  it('takes a caller’s own body in place of the rows', () => {
    mount({
      children: (slot) => (
        <div id="own">{`${slot.label}: ${slot.items.length} series`}</div>
      ),
    })
    expect(document.querySelector('#own')?.textContent).toBe('Jan: 2 series')
    expect(tooltip()?.textContent).not.toContain('Sales')
  })

  describe('placement', () => {
    it('teleports to the body rather than into the chart', () => {
      const { container } = mount()
      expect(document.body.contains(tooltip())).toBe(true)
      expect(container.contains(tooltip())).toBe(false)
    })

    it('hangs off the point it is given', () => {
      mount({ x: 100, y: 100 })
      expect(tooltip()?.style.left).toBe('112px')
      expect(tooltip()?.style.top).toBe('112px')
      expect(tooltip()?.style.visibility).toBe('visible')
    })
  })

  it('carries the direction it is told to lay out in', () => {
    mount({ dir: 'rtl' })
    expect(tooltip()?.getAttribute('dir')).toBe('rtl')
  })
})

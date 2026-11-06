import { render } from '@solidjs/testing-library'
import { getInstanceByDom } from 'echarts/core'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { LineChart } from './LineChart'

const data = [
  { month: 'Jan', sales: 10 },
  { month: 'Feb', sales: 20 },
  { month: 'Mar', sales: 15 },
  { month: 'Apr', sales: 25 },
  { month: 'May', sales: 30 },
]

function instanceOf(container: HTMLElement) {
  const canvas = container.querySelector('[data-slot="chart-canvas"]')
  const instance = canvas ? getInstanceByDom(canvas as HTMLElement) : undefined
  if (!instance) throw new Error('no echarts instance yet')
  return instance
}

describe('LineChart interactions', () => {
  it('emits the zoom window as data values when the slider moves', () => {
    const onZoomChange = vi.fn()
    const { container } = render(() => (
      <LineChart
        data={data}
        x="month"
        y="sales"
        zoom={{ from: 'Jan', to: 'May' }}
        onZoomChange={onZoomChange}
      />
    ))
    instanceOf(container).dispatchAction({
      type: 'dataZoom',
      startValue: 2,
      endValue: 4,
    })
    expect(onZoomChange).toHaveBeenCalledWith({ from: 'Mar', to: 'May' })
  })

  it('survives an option rebuild: the window comes back from the signal', () => {
    let bump: (value: number) => void = () => {}
    function Harness() {
      const [seed, setSeed] = createSignal(1)
      bump = setSeed
      return (
        <LineChart
          data={data.map((row) => ({
            ...row,
            sales: row.sales * seed(),
          }))}
          x="month"
          y="sales"
          zoom={{ from: 'Feb', to: 'Apr' }}
        />
      )
    }
    const { container } = render(() => <Harness />)
    const instance = instanceOf(container)
    const readWindow = () => {
      const option = instance.getOption() as {
        dataZoom?: { startValue?: number; endValue?: number }[]
      }
      return option.dataZoom?.[0]
    }
    expect(readWindow()).toMatchObject({ startValue: 1, endValue: 3 })
    // A data change is a `notMerge` rebuild — the window must not reset.
    bump(2)
    expect(readWindow()).toMatchObject({ startValue: 1, endValue: 3 })
  })

  it('zooms with the keyboard when the plot is focused', () => {
    const onZoomChange = vi.fn()
    const { container } = render(() => (
      <LineChart
        data={data}
        x="month"
        y="sales"
        defaultZoom={{ from: 'Jan', to: 'May' }}
        onZoomChange={onZoomChange}
      />
    ))
    const plot = container.querySelector(
      '[data-slot="chart-canvas"]',
    ) as HTMLElement
    expect(plot.getAttribute('tabindex')).toBe('0')
    plot.dispatchEvent(
      new KeyboardEvent('keydown', { key: '+', bubbles: true }),
    )
    expect(onZoomChange).toHaveBeenCalled()
    const next = onZoomChange.mock.calls.at(-1)?.[0] as {
      from: string
      to: string
    }
    expect(next.from).not.toBe('Jan')
    expect(next.to).not.toBe('May')
    // And the instance followed without waiting for a rebuild.
    const option = instanceOf(container).getOption() as {
      dataZoom?: { startValue?: number; endValue?: number }[]
    }
    expect(option.dataZoom?.[0]?.startValue).toBeGreaterThan(0)
  })

  it('pans with the arrow keys', () => {
    const onZoomChange = vi.fn()
    const { container } = render(() => (
      <LineChart
        data={data}
        x="month"
        y="sales"
        defaultZoom={{ from: 'Jan', to: 'Mar' }}
        onZoomChange={onZoomChange}
      />
    ))
    const plot = container.querySelector(
      '[data-slot="chart-canvas"]',
    ) as HTMLElement
    plot.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    )
    const next = onZoomChange.mock.calls.at(-1)?.[0] as {
      from: string
      to: string
    }
    expect(next.from).not.toBe('Jan')
  })

  it('narrows the fallback table to the window, captioned', () => {
    const { container } = render(() => (
      <LineChart
        data={data}
        x="month"
        y="sales"
        zoom={{ from: 'Feb', to: 'Apr' }}
      />
    ))
    const rows = [
      ...container.querySelectorAll('[data-slot="chart-fallback"] tbody tr'),
    ].map((row) => row.querySelector('td')?.textContent)
    expect(rows).toEqual(['Feb', 'Mar', 'Apr'])
    const caption = container.querySelector(
      '[data-slot="chart-fallback"] caption',
    )
    expect(caption?.textContent).toBe('Showing Feb \u2013 Apr of 5 points')
  })

  it('translates the brush toolbar into data values', () => {
    const onBrushChange = vi.fn()
    const { container } = render(() => (
      <LineChart
        data={data}
        x="month"
        y="sales"
        brush
        onBrushChange={onBrushChange}
      />
    ))
    const inputs = container.querySelectorAll<HTMLInputElement>(
      '[data-slot="chart-brush-input"]',
    )
    expect(inputs.length).toBe(2)
    const from = inputs[0]
    if (!from) throw new Error('missing brush input')
    from.value = '1'
    from.dispatchEvent(new Event('input', { bubbles: true }))
    const selection = onBrushChange.mock.calls.at(-1)?.[0] as {
      from: string
      to: string
    }
    expect(selection).toEqual({ from: 'Feb', to: 'May' })
  })

  it('emits the datum behind a double-click', () => {
    const onPointDblClick = vi.fn()
    const { container } = render(() => (
      <LineChart
        data={data}
        x="month"
        y="sales"
        onPointDblClick={onPointDblClick}
      />
    ))
    instanceOf(container).trigger('dblclick', {
      componentType: 'series',
      dataIndex: 2,
    } as never)
    const datum = onPointDblClick.mock.calls[0]?.[0] as {
      x: string
      row: Record<string, unknown>
    }
    expect(datum.x).toBe('Mar')
    expect(datum.row).toMatchObject({ month: 'Mar', sales: 15 })
  })

  it('draws no interaction chrome without the props', () => {
    const { container } = render(() => (
      <LineChart data={data} x="month" y="sales" />
    ))
    expect(
      container.querySelector('[data-slot="chart-brush-input"]'),
    ).toBeNull()
    expect(
      container
        .querySelector('[data-slot="chart-canvas"]')
        ?.getAttribute('tabindex'),
    ).toBeNull()
    // echarts normalizes a component nobody asked for into an empty list.
    const option = instanceOf(container).getOption() as { dataZoom?: unknown[] }
    expect(option.dataZoom ?? []).toHaveLength(0)
  })

  it('a data change keeps the brush selection', () => {
    let bump: (value: number) => void = () => {}
    function Harness() {
      const [seed, setSeed] = createSignal(1)
      bump = setSeed
      return (
        <LineChart
          data={data.map((row) => ({ ...row, sales: row.sales * seed() }))}
          x="month"
          y="sales"
          brush
        />
      )
    }
    const { container } = render(() => <Harness />)
    const inputs = container.querySelectorAll<HTMLInputElement>(
      '[data-slot="chart-brush-input"]',
    )
    const from = inputs[0]
    if (!from) throw new Error('missing brush input')
    from.value = '1'
    from.dispatchEvent(new Event('input', { bubbles: true }))
    bump(3)
    const option = instanceOf(container).getOption() as {
      brush?: { areas: { coordRange: number[] }[] }[]
    }
    expect(option.brush?.[0]?.areas[0]?.coordRange[0]).toBe(1)
  })
})

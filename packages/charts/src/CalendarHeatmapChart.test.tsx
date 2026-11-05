import { render } from '@solidjs/testing-library'
import type { ECElementEvent } from 'echarts/core'
import { getInstanceByDom } from 'echarts/core'
import { describe, expect, it } from 'vitest'
import { CalendarHeatmapChart } from './CalendarHeatmapChart'

const data = [
  { date: '2026-01-05', value: 3 },
  { date: '2026-01-06', value: 7 },
  { date: '2026-01-07', value: 1 },
]

describe('CalendarHeatmapChart', () => {
  it('renders the plot as an image with an accessible name', () => {
    const { container } = render(() => (
      <CalendarHeatmapChart data={data} title="Activity" />
    ))
    const plot = container.querySelector('[data-slot="chart-canvas"]')
    expect(plot?.getAttribute('role')).toBe('img')
    expect(plot?.getAttribute('aria-label')).toBe('Activity')
  })

  it('renders a visually-hidden day/value table as a fallback', () => {
    const { container } = render(() => (
      <CalendarHeatmapChart data={data} aria-label="Activity per day" />
    ))
    const table = container.querySelector('[data-slot="chart-fallback"]')
    expect(table?.textContent).toContain('2026-01-05')
    expect(table?.textContent).toContain('2026-01-07')
  })

  it('mounts an echarts SVG without crashing', () => {
    const { container } = render(() => <CalendarHeatmapChart data={data} />)
    expect(
      container.querySelector('[data-slot="chart-canvas"] svg'),
    ).not.toBeNull()
  })

  it('shows the loading and error states', () => {
    const loading = render(() => <CalendarHeatmapChart data={data} loading />)
    expect(
      loading.container.querySelector('[data-slot="chart-loading"]'),
    ).not.toBeNull()

    const failed = render(() => (
      <CalendarHeatmapChart data={data} error="Could not load activity." />
    ))
    expect(
      failed.container.querySelector('[data-slot="chart-error"]')?.textContent,
    ).toContain('Could not load')
  })

  it('emits onPointClick with the day, its value and the row behind it', () => {
    let clicked:
      | { date: string; value: number | null; row: Record<string, unknown> }
      | undefined
    const { container } = render(() => (
      <CalendarHeatmapChart
        data={data}
        onPointClick={(point) => {
          clicked = point
        }}
      />
    ))
    const canvas = container.querySelector('[data-slot="chart-canvas"]')
    const instance = getInstanceByDom(canvas as HTMLElement)
    expect(instance).toBeDefined()
    instance?.trigger('click', {
      type: 'click',
      componentType: 'series',
      value: ['2026-01-06', 7],
    } as unknown as ECElementEvent)
    expect(clicked).toEqual({
      date: '2026-01-06',
      value: 7,
      row: { date: '2026-01-06', value: 7 },
    })
  })

  it('applies the class fallthrough', () => {
    const { container } = render(() => (
      <CalendarHeatmapChart data={data} class="my-calendar" />
    ))
    expect(container.querySelector('.my-calendar')).not.toBeNull()
  })
})

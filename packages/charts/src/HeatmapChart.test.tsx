import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { HeatmapChart } from './HeatmapChart'

const data = [
  { day: 'Mon', hour: '09', orders: 3 },
  { day: 'Mon', hour: '10', orders: 7 },
  { day: 'Tue', hour: '09', orders: 5 },
]

describe('HeatmapChart', () => {
  it('renders the plot as an image with an accessible name', () => {
    const { container } = render(() => (
      <HeatmapChart
        data={data}
        x="hour"
        y="day"
        value="orders"
        title="Orders"
      />
    ))
    const plot = container.querySelector('[data-slot="chart-canvas"]')
    expect(plot?.getAttribute('role')).toBe('img')
    expect(plot?.getAttribute('aria-label')).toBe('Orders')
  })

  it('renders a visually-hidden data table as a fallback', () => {
    const { container } = render(() => (
      <HeatmapChart
        data={data}
        x="hour"
        y="day"
        value="orders"
        aria-label="Orders by hour"
      />
    ))
    const table = container.querySelector('[data-slot="chart-fallback"]')
    expect(table?.textContent).toContain('Mon')
    expect(table?.textContent).toContain('09')
  })

  it('mounts an echarts SVG without crashing', () => {
    const { container } = render(() => (
      <HeatmapChart data={data} x="hour" y="day" value="orders" />
    ))
    expect(
      container.querySelector('[data-slot="chart-canvas"] svg'),
    ).not.toBeNull()
  })

  it('applies the class fallthrough and the height', () => {
    const { container } = render(() => (
      <HeatmapChart
        data={data}
        x="hour"
        y="day"
        value="orders"
        class="my-heatmap"
        height={300}
      />
    ))
    const root = container.querySelector(
      '[data-slot="chart-container"]',
    ) as HTMLElement
    expect(root.className).toContain('my-heatmap')
    expect(root.style.height).toBe('300px')
  })

  it('renders the loading and error states', () => {
    const loading = render(() => (
      <HeatmapChart data={data} x="hour" y="day" value="orders" loading />
    ))
    expect(
      loading.container.querySelector('[data-slot="chart-loading"]'),
    ).not.toBeNull()

    const failed = render(() => (
      <HeatmapChart data={data} x="hour" y="day" value="orders" error="Boom" />
    ))
    expect(
      failed.container.querySelector('[data-slot="chart-error"]')?.textContent,
    ).toContain('Boom')
  })
})

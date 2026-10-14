import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { BarChart } from './BarChart'

const data = [
  { month: 'Jan', sales: 10, refunds: 2 },
  { month: 'Feb', sales: 20, refunds: 4 },
]

describe('BarChart', () => {
  it('renders the plot as an image with an accessible name', () => {
    const { container } = render(() => (
      <BarChart data={data} x="month" y={['sales', 'refunds']} title="Sales" />
    ))
    const plot = container.querySelector('[data-slot="chart-canvas"]')
    expect(plot?.getAttribute('role')).toBe('img')
    expect(plot?.getAttribute('aria-label')).toBe('Sales')
  })

  it('renders a visually-hidden data table as a fallback', () => {
    const { container } = render(() => (
      <BarChart data={data} x="month" y="sales" aria-label="Sales by month" />
    ))
    const table = container.querySelector('[data-slot="chart-fallback"]')
    expect(table).not.toBeNull()
    expect(table?.textContent).toContain('Jan')
    expect(table?.textContent).toContain('20')
  })

  it('mounts an echarts SVG without crashing', () => {
    const { container } = render(() => (
      <BarChart data={data} x="month" y="sales" />
    ))
    // jsdom measures nothing, but echarts still builds its SVG tree — which is
    // the mount/no-crash contract this test pins.
    expect(
      container.querySelector('[data-slot="chart-canvas"] svg'),
    ).not.toBeNull()
  })

  it('applies the class fallthrough and the height', () => {
    const { container } = render(() => (
      <BarChart data={data} x="month" y="sales" class="my-chart" height={320} />
    ))
    const root = container.querySelector(
      '[data-slot="chart-container"]',
    ) as HTMLElement
    expect(root.className).toContain('my-chart')
    expect(root.style.height).toBe('320px')
  })

  it('renders the loading and error states', () => {
    const loading = render(() => (
      <BarChart data={data} x="month" y="sales" loading />
    ))
    expect(
      loading.container.querySelector('[data-slot="chart-loading"]'),
    ).not.toBeNull()

    const failed = render(() => (
      <BarChart data={data} x="month" y="sales" error="Boom" />
    ))
    expect(
      failed.container.querySelector('[data-slot="chart-error"]')?.textContent,
    ).toContain('Boom')
  })
})

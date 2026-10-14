import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { DonutChart } from './DonutChart'

const data = [
  { channel: 'Search', visits: 50 },
  { channel: 'Direct', visits: 30 },
  { channel: 'Email', visits: 20 },
]

describe('DonutChart', () => {
  it('renders the plot as an image with an accessible name', () => {
    const { container } = render(() => (
      <DonutChart
        data={data}
        category="channel"
        value="visits"
        title="Traffic"
      />
    ))
    const plot = container.querySelector('[data-slot="chart-canvas"]')
    expect(plot?.getAttribute('role')).toBe('img')
    expect(plot?.getAttribute('aria-label')).toBe('Traffic')
  })

  it('renders a visually-hidden data table as a fallback', () => {
    const { container } = render(() => (
      <DonutChart data={data} category="channel" value="visits" />
    ))
    const table = container.querySelector('[data-slot="chart-fallback"]')
    expect(table?.textContent).toContain('Search')
    expect(table?.textContent).toContain('50')
  })

  it('mounts an echarts SVG without crashing', () => {
    const { container } = render(() => (
      <DonutChart data={data} category="channel" value="visits" />
    ))
    expect(
      container.querySelector('[data-slot="chart-canvas"] svg'),
    ).not.toBeNull()
  })

  it('renders the half variant and the class fallthrough', () => {
    const { container } = render(() => (
      <DonutChart
        data={data}
        category="channel"
        value="visits"
        variant="half"
        class="my-donut"
      />
    ))
    expect(
      (container.querySelector('[data-slot="chart-container"]') as HTMLElement)
        .className,
    ).toContain('my-donut')
  })
})

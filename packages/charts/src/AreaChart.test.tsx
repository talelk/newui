import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { AreaChart } from './AreaChart'

const data = [
  { month: 'Jan', visits: 10 },
  { month: 'Feb', visits: 20 },
  { month: 'Mar', visits: 15 },
]

describe('AreaChart', () => {
  it('renders the plot as an image with an accessible name', () => {
    const { container } = render(() => (
      <AreaChart data={data} x="month" y="visits" aria-label="Visits" />
    ))
    const plot = container.querySelector('[data-slot="chart-canvas"]')
    expect(plot?.getAttribute('role')).toBe('img')
    expect(plot?.getAttribute('aria-label')).toBe('Visits')
  })

  it('mounts an echarts SVG without crashing', () => {
    const { container } = render(() => (
      <AreaChart data={data} x="month" y="visits" stacked />
    ))
    expect(
      container.querySelector('[data-slot="chart-canvas"] svg'),
    ).not.toBeNull()
  })

  it('renders the class fallthrough', () => {
    const { container } = render(() => (
      <AreaChart data={data} x="month" y="visits" class="my-area" />
    ))
    expect(
      (container.querySelector('[data-slot="chart-container"]') as HTMLElement)
        .className,
    ).toContain('my-area')
  })
})

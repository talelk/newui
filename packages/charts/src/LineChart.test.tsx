import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { LineChart } from './LineChart'

const data = [
  { month: 'Jan', sales: 10 },
  { month: 'Feb', sales: 20 },
  { month: 'Mar', sales: 15 },
]

describe('LineChart', () => {
  it('renders the plot as an image with an accessible name', () => {
    const { container } = render(() => (
      <LineChart data={data} x="month" y="sales" aria-label="Trend" />
    ))
    const plot = container.querySelector('[data-slot="chart-canvas"]')
    expect(plot?.getAttribute('role')).toBe('img')
    expect(plot?.getAttribute('aria-label')).toBe('Trend')
  })

  it('mounts an echarts SVG without crashing', () => {
    const { container } = render(() => (
      <LineChart data={data} x="month" y="sales" smooth />
    ))
    expect(
      container.querySelector('[data-slot="chart-canvas"] svg'),
    ).not.toBeNull()
  })

  it('renders the class fallthrough', () => {
    const { container } = render(() => (
      <LineChart data={data} x="month" y="sales" class="my-line" />
    ))
    expect(
      (container.querySelector('[data-slot="chart-container"]') as HTMLElement)
        .className,
    ).toContain('my-line')
  })
})

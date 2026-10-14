import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ScatterChart } from './ScatterChart'

const data = [
  { price: 10, score: 1, region: 'EU' },
  { price: 20, score: 2, region: 'US' },
  { price: 30, score: 3, region: 'EU' },
]

describe('ScatterChart', () => {
  it('renders the plot as an image with an accessible name', () => {
    const { container } = render(() => (
      <ScatterChart data={data} x="price" y="score" title="Price vs score" />
    ))
    const plot = container.querySelector('[data-slot="chart-canvas"]')
    expect(plot?.getAttribute('role')).toBe('img')
    expect(plot?.getAttribute('aria-label')).toBe('Price vs score')
  })

  it('renders a visually-hidden data table as a fallback', () => {
    const { container } = render(() => (
      <ScatterChart
        data={data}
        x="price"
        y="score"
        splitBy="region"
        aria-label="Price vs score"
      />
    ))
    const table = container.querySelector('[data-slot="chart-fallback"]')
    expect(table?.textContent).toContain('price')
    expect(table?.textContent).toContain('30')
  })

  it('mounts an echarts SVG without crashing', () => {
    const { container } = render(() => (
      <ScatterChart data={data} x="price" y="score" />
    ))
    expect(
      container.querySelector('[data-slot="chart-canvas"] svg'),
    ).not.toBeNull()
  })

  it('applies the class fallthrough and the height', () => {
    const { container } = render(() => (
      <ScatterChart
        data={data}
        x="price"
        y="score"
        class="my-scatter"
        height={280}
      />
    ))
    const root = container.querySelector(
      '[data-slot="chart-container"]',
    ) as HTMLElement
    expect(root.className).toContain('my-scatter')
    expect(root.style.height).toBe('280px')
  })

  it('renders the loading and error states', () => {
    const loading = render(() => (
      <ScatterChart data={data} x="price" y="score" loading />
    ))
    expect(
      loading.container.querySelector('[data-slot="chart-loading"]'),
    ).not.toBeNull()

    const failed = render(() => (
      <ScatterChart data={data} x="price" y="score" error="Boom" />
    ))
    expect(
      failed.container.querySelector('[data-slot="chart-error"]')?.textContent,
    ).toContain('Boom')
  })
})

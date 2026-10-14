import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { SankeyChart } from './SankeyChart'

const data = [
  { from: 'A', to: 'B', v: 5 },
  { from: 'A', to: 'C', v: 3 },
  { from: 'B', to: 'C', v: 2 },
]

describe('SankeyChart', () => {
  it('renders the plot as an image with an accessible name', () => {
    const { container } = render(() => (
      <SankeyChart
        data={data}
        source="from"
        target="to"
        value="v"
        title="Flow"
      />
    ))
    const plot = container.querySelector('[data-slot="chart-canvas"]')
    expect(plot?.getAttribute('role')).toBe('img')
    expect(plot?.getAttribute('aria-label')).toBe('Flow')
  })

  it('renders a visually-hidden data table as a fallback', () => {
    const { container } = render(() => (
      <SankeyChart
        data={data}
        source="from"
        target="to"
        value="v"
        aria-label="Flow"
      />
    ))
    const table = container.querySelector('[data-slot="chart-fallback"]')
    expect(table?.textContent).toContain('A')
    expect(table?.textContent).toContain('5')
  })

  it('mounts an echarts SVG without crashing', () => {
    const { container } = render(() => (
      <SankeyChart data={data} source="from" target="to" value="v" />
    ))
    expect(
      container.querySelector('[data-slot="chart-canvas"] svg'),
    ).not.toBeNull()
  })

  it('applies the class fallthrough and the height', () => {
    const { container } = render(() => (
      <SankeyChart
        data={data}
        source="from"
        target="to"
        value="v"
        class="my-sankey"
        height={260}
      />
    ))
    const root = container.querySelector(
      '[data-slot="chart-container"]',
    ) as HTMLElement
    expect(root.className).toContain('my-sankey')
    expect(root.style.height).toBe('260px')
  })

  it('renders the loading and error states', () => {
    const loading = render(() => (
      <SankeyChart data={data} source="from" target="to" value="v" loading />
    ))
    expect(
      loading.container.querySelector('[data-slot="chart-loading"]'),
    ).not.toBeNull()

    const failed = render(() => (
      <SankeyChart
        data={data}
        source="from"
        target="to"
        value="v"
        error="Boom"
      />
    ))
    expect(
      failed.container.querySelector('[data-slot="chart-error"]')?.textContent,
    ).toContain('Boom')
  })
})

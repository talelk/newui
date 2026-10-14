import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { FunnelChart } from './FunnelChart'

const data = [
  { stage: 'Visit', users: 100 },
  { stage: 'Signup', users: 40 },
  { stage: 'Pay', users: 10 },
]

describe('FunnelChart', () => {
  it('renders the plot as an image with an accessible name', () => {
    const { container } = render(() => (
      <FunnelChart data={data} category="stage" value="users" title="Funnel" />
    ))
    const plot = container.querySelector('[data-slot="chart-canvas"]')
    expect(plot?.getAttribute('role')).toBe('img')
    expect(plot?.getAttribute('aria-label')).toBe('Funnel')
  })

  it('renders a visually-hidden data table as a fallback', () => {
    const { container } = render(() => (
      <FunnelChart
        data={data}
        category="stage"
        value="users"
        aria-label="Conversion funnel"
      />
    ))
    const table = container.querySelector('[data-slot="chart-fallback"]')
    expect(table?.textContent).toContain('Signup')
    expect(table?.textContent).toContain('40')
  })

  it('mounts an echarts SVG without crashing', () => {
    const { container } = render(() => (
      <FunnelChart data={data} category="stage" value="users" />
    ))
    expect(
      container.querySelector('[data-slot="chart-canvas"] svg'),
    ).not.toBeNull()
  })

  it('applies the class fallthrough and the height', () => {
    const { container } = render(() => (
      <FunnelChart
        data={data}
        category="stage"
        value="users"
        class="my-funnel"
        height={320}
      />
    ))
    const root = container.querySelector(
      '[data-slot="chart-container"]',
    ) as HTMLElement
    expect(root.className).toContain('my-funnel')
    expect(root.style.height).toBe('320px')
  })

  it('renders the loading and error states', () => {
    const loading = render(() => (
      <FunnelChart data={data} category="stage" value="users" loading />
    ))
    expect(
      loading.container.querySelector('[data-slot="chart-loading"]'),
    ).not.toBeNull()

    const failed = render(() => (
      <FunnelChart data={data} category="stage" value="users" error="Boom" />
    ))
    expect(
      failed.container.querySelector('[data-slot="chart-error"]')?.textContent,
    ).toContain('Boom')
  })
})

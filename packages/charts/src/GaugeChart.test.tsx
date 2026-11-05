import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { GaugeChart } from './GaugeChart'

describe('GaugeChart', () => {
  it('renders the dial as an image with an accessible name', () => {
    const { container } = render(() => (
      <GaugeChart value={72} title="Quarter to target" />
    ))
    const plot = container.querySelector('[data-slot="chart-canvas"]')
    expect(plot?.getAttribute('role')).toBe('img')
    expect(plot?.getAttribute('aria-label')).toBe('Quarter to target')
  })

  it('carries the reading in the fallback table', () => {
    const { container } = render(() => (
      <GaugeChart value={72} title="Quarter to target" />
    ))
    const table = container.querySelector('[data-slot="chart-fallback"]')
    expect(table?.textContent).toContain('Quarter to target')
    expect(table?.textContent).toContain('72')
  })

  it('prints no reading when the dial is empty', () => {
    const { container } = render(() => (
      <GaugeChart value={null} title="Quarter to target" />
    ))
    const table = container.querySelector('[data-slot="chart-fallback"]')
    expect(table?.querySelectorAll('tbody tr')).toHaveLength(0)
  })

  it('mounts an echarts SVG without crashing', () => {
    const { container } = render(() => <GaugeChart value={72} />)
    expect(
      container.querySelector('[data-slot="chart-canvas"] svg'),
    ).not.toBeNull()
  })

  it('shows the loading and error states', () => {
    const loading = render(() => <GaugeChart value={72} loading />)
    expect(
      loading.container.querySelector('[data-slot="chart-loading"]'),
    ).not.toBeNull()

    const failed = render(() => (
      <GaugeChart value={72} error="Could not load the reading." />
    ))
    expect(
      failed.container.querySelector('[data-slot="chart-error"]')?.textContent,
    ).toContain('Could not load')
  })

  it('applies the class fallthrough', () => {
    const { container } = render(() => (
      <GaugeChart value={72} class="my-gauge" />
    ))
    expect(container.querySelector('.my-gauge')).not.toBeNull()
  })
})

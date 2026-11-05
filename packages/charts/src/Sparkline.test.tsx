import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Sparkline } from './Sparkline'

describe('Sparkline', () => {
  it('draws the trend as an aria-hidden SVG with a readable summary', () => {
    const { container } = render(() => <Sparkline data={[1, 2, 3, 2]} />)
    const svg = container.querySelector('[data-slot="sparkline-graph"]')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    const root = container.querySelector('[data-slot="sparkline"]')
    expect(root?.textContent).toContain('4 values')
    expect(root?.textContent).toContain('ending at 2')
  })

  it('draws bars when asked, and the line plus end dot otherwise', () => {
    const bars = render(() => <Sparkline data={[1, 2, 3]} type="bar" />)
    expect(
      bars.container.querySelectorAll('[data-slot="sparkline-bar"]').length,
    ).toBe(3)
    expect(bars.container.querySelector('svg')).toBeNull()

    const line = render(() => <Sparkline data={[1, 2, 3]} type="line" />)
    expect(line.container.querySelector('svg')).not.toBeNull()
    expect(
      line.container.querySelector('[data-slot="sparkline-end"]'),
    ).not.toBeNull()
  })

  it('says so when there is nothing to draw', () => {
    const { container } = render(() => <Sparkline data={[]} />)
    expect(
      container.querySelector('[data-slot="sparkline-empty"]'),
    ).not.toBeNull()
    expect(
      container.querySelector('[data-slot="sparkline"]')?.textContent,
    ).toContain('No values')
  })

  it('keeps its shape while loading', () => {
    const { container } = render(() => <Sparkline data={[1, 2]} loading />)
    const placeholder = container.querySelector(
      '[data-slot="sparkline-loading"]',
    )
    expect(placeholder?.getAttribute('role')).toBe('status')
  })

  it('prints the error message', () => {
    const { container } = render(() => (
      <Sparkline data={[1, 2]} error="Could not load the trend." />
    ))
    expect(
      container.querySelector('[data-slot="sparkline-error"]')?.textContent,
    ).toContain('Could not load')
  })

  it('follows the text color under the ink tone', () => {
    const { container } = render(() => (
      <Sparkline data={[1, 2, 3]} type="line" tone="ink" />
    ))
    const path = container.querySelector('svg path[stroke]')
    expect(path?.getAttribute('stroke')).toBe('currentColor')
  })

  it('applies the class fallthrough and the size', () => {
    const { container } = render(() => (
      <Sparkline data={[1, 2]} class="my-trend" width={200} height={40} />
    ))
    const root = container.querySelector(
      '[data-slot="sparkline"]',
    ) as HTMLElement
    expect(root.className).toContain('my-trend')
    expect(root.style.width).toBe('200px')
    expect(root.style.height).toBe('40px')
  })
})

import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { NumberCard } from './NumberCard'

describe('NumberCard', () => {
  it('renders the reading with its prefix and suffix', () => {
    const { container } = render(() => (
      <NumberCard title="Revenue" value={1234} prefix="$" suffix="k" />
    ))
    expect(
      container.querySelector('[data-slot="number-card-value"]')?.textContent,
    ).toContain('$1,234k')
  })

  it('renders the target beside the reading', () => {
    const { container } = render(() => (
      <NumberCard title="Revenue" value={80} target={100} />
    ))
    expect(
      container.querySelector('[data-slot="number-card-target"]')?.textContent,
    ).toContain('/ 100')
  })

  it('draws progress toward a numeric target, and only then', () => {
    const { container } = render(() => (
      <NumberCard title="Revenue" value={80} target={100} />
    ))
    const bar = container.querySelector(
      '[data-slot="number-card-progress"]',
    ) as HTMLElement
    expect(bar.getAttribute('role')).toBe('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('80')

    const textual = render(() => (
      <NumberCard title="Revenue" value="80" target="100" />
    ))
    expect(
      textual.container.querySelector('[data-slot="number-card-progress"]'),
    ).toBeNull()
  })

  it('puts the delta in a pill and its baseline underneath the reading', () => {
    const { container } = render(() => (
      <NumberCard
        title="Revenue"
        value={80}
        delta={3.1}
        deltaSuffix="%"
        deltaCaption="from $77.6k last month"
      />
    ))
    const pill = container.querySelector(
      '[data-slot="number-card-delta"]',
    ) as HTMLElement
    expect(pill.style.backgroundColor).toBe('var(--surface-green-2)')
    expect(pill.style.borderRadius).toBe('9999px')
    expect(
      container.querySelector('[data-slot="number-card-caption"]')?.textContent,
    ).toBe('from $77.6k last month')
  })

  it('renders the delta unsigned with a direction arrow', () => {
    const { container } = render(() => (
      <NumberCard title="Revenue" value={80} delta={-3.1} deltaSuffix="%" />
    ))
    const delta = container.querySelector('[data-slot="number-card-delta"]')
    expect(delta?.textContent).toContain('▼')
    expect(delta?.textContent).toContain('3.1%')
  })

  it('renders the empty state for a null reading', () => {
    const { container } = render(() => (
      <NumberCard title="Revenue" value={null} />
    ))
    expect(
      container.querySelector('[data-slot="number-card-empty"]'),
    ).not.toBeNull()
  })

  it('renders the loading and error states instead of the reading', () => {
    const loading = render(() => (
      <NumberCard title="Revenue" value={1} loading />
    ))
    expect(
      loading.container.querySelector('[data-slot="number-card-loading"]'),
    ).not.toBeNull()
    expect(
      loading.container.querySelector('[data-slot="number-card-value"]'),
    ).toBeNull()

    const failed = render(() => (
      <NumberCard title="Revenue" value={1} error="Boom" />
    ))
    expect(
      failed.container.querySelector('[data-slot="number-card-error"]')
        ?.textContent,
    ).toContain('Boom')
  })

  it('reserves progress and sparkline geometry while loading', () => {
    const { container } = render(() => (
      <NumberCard
        title="Revenue"
        value={80}
        target={100}
        sparkline={{ data: [1, 2, 3] }}
        loading
      />
    ))
    expect(
      container.querySelectorAll(
        '[data-slot="number-card-loading"] [aria-hidden="true"]',
      ),
    ).toHaveLength(4)
  })

  it('draws a sparkline as an SVG by default and as bars when asked', () => {
    const area = render(() => (
      <NumberCard
        title="Revenue"
        value={80}
        sparkline={{ data: [1, 2, 3, 2] }}
      />
    ))
    expect(
      area.container.querySelector('[data-slot="number-card-sparkline"] svg'),
    ).not.toBeNull()
    expect(
      area.container.querySelector('[data-slot="number-card-sparkline-end"]'),
    ).not.toBeNull()

    const bars = render(() => (
      <NumberCard
        title="Revenue"
        value={80}
        sparkline={{ data: [1, 2, 3], type: 'bar' }}
      />
    ))
    expect(
      bars.container.querySelector('[data-slot="number-card-sparkline"] svg'),
    ).toBeNull()
    expect(
      bars.container.querySelectorAll('[data-slot="number-card-sparkline"] div')
        .length,
    ).toBe(3)
  })

  it('applies the class fallthrough', () => {
    const { container } = render(() => (
      <NumberCard title="Revenue" value={1} class="my-card" />
    ))
    expect(
      (container.querySelector('[data-slot="number-card"]') as HTMLElement)
        .className,
    ).toContain('my-card')
  })
})

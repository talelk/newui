import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { RadioGroup } from './RadioGroup'

const ITEMS = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
]

describe('RadioGroup (browser, real CSS)', () => {
  it('thickens the border of the checked control', () => {
    const { container } = render(() => (
      <RadioGroup items={ITEMS} defaultValue="a" />
    ))
    const controls = Array.from(
      container.querySelectorAll('[data-slot="radio-control"]'),
    ) as HTMLElement[]

    const checked = Number.parseFloat(
      getComputedStyle(controls[0] as HTMLElement).borderTopWidth,
    )
    const unchecked = Number.parseFloat(
      getComputedStyle(controls[1] as HTMLElement).borderTopWidth,
    )
    expect(checked).toBeGreaterThan(unchecked)
    expect(checked).toBeGreaterThan(0)
  })

  it('renders each size at its own circle dimensions', () => {
    const { container } = render(() => (
      <div>
        <RadioGroup items={ITEMS} size="xs" />
        <RadioGroup items={ITEMS} size="md" />
      </div>
    ))
    const controls = container.querySelectorAll('[data-slot="radio-control"]')
    const xs = (controls[0] as HTMLElement).getBoundingClientRect()
    const md = (controls[2] as HTMLElement).getBoundingClientRect()
    expect(xs.width).toBeCloseTo(13, 0)
    expect(md.width).toBeCloseTo(16, 0)
    expect(md.width).toBeGreaterThan(xs.width)
  })

  it('gives a padded row its fixed compact height', () => {
    const { container } = render(() => <RadioGroup items={ITEMS} padded />)
    const row = container.querySelector(
      '[data-slot="radio-item"]',
    ) as HTMLElement
    // `sm` padded label-only rows are `h-7` (28px).
    expect(row.getBoundingClientRect().height).toBeCloseTo(28, 0)
  })
})

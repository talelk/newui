import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { NumberInput } from './NumberInput'

describe('NumberInput (browser, real CSS)', () => {
  it('draws a bordered control with real stepper buttons', () => {
    const { container } = render(() => (
      <NumberInput aria-label="Count" defaultValue="1" />
    ))
    const control = container.querySelector(
      '[data-slot="number-input-control"]',
    ) as HTMLElement
    expect(
      Number.parseFloat(getComputedStyle(control).borderTopWidth),
    ).toBeGreaterThan(0)
    expect(control.getBoundingClientRect().height).toBeGreaterThan(0)

    const increment = container.querySelector(
      'button[aria-label="Increment"]',
    ) as HTMLElement
    expect(increment.getBoundingClientRect().width).toBeGreaterThan(0)
  })
})

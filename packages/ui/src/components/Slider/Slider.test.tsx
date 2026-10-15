import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Slider } from './Slider'

describe('Slider', () => {
  it('shares the visible label, help and invalid-state contract', () => {
    const { getByRole, getByText } = render(() => (
      <Slider
        label="Forecast confidence"
        description="Adjust the confidence level."
        error="Choose at least 50%."
        required
        defaultValue={[40]}
      />
    ))
    const thumb = getByRole('slider', { name: /Forecast confidence/ })
    expect(thumb).toHaveAttribute('aria-invalid', 'true')
    expect(thumb.getAttribute('aria-describedby')).toContain(
      getByText('Adjust the confidence level.').id,
    )
    expect(thumb.getAttribute('aria-describedby')).toContain(
      getByRole('alert').id,
    )
  })
  it('exposes a slider role with the current value', () => {
    const { getByRole } = render(() => <Slider defaultValue={[40]} />)
    const thumb = getByRole('slider')
    expect(thumb.getAttribute('aria-valuenow')).toBe('40')
    expect(thumb.getAttribute('aria-valuemin')).toBe('0')
    expect(thumb.getAttribute('aria-valuemax')).toBe('100')
  })

  it('renders the track and range parts', () => {
    const { container } = render(() => <Slider defaultValue={[25]} />)
    expect(container.querySelector('[data-slot="slider-track"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="slider-range"]')).not.toBeNull()
  })

  it('applies the requested size to the root', () => {
    const { container } = render(() => <Slider defaultValue={[25]} size="md" />)
    expect(
      container.querySelector('[data-slot="slider"]')?.className,
    ).toContain('h-5')
  })
})

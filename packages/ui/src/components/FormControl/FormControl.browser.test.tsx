import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { FormControl } from './FormControl'

describe('FormControl (browser, real CSS)', () => {
  it('renders a real, padded text input by default', () => {
    const { container } = render(() => (
      <FormControl aria-label="Name" placeholder="Name" />
    ))
    const input = container.querySelector('input') as HTMLElement
    const style = getComputedStyle(input)
    expect(input.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)
    expect(Number.parseFloat(style.paddingLeft)).toBeGreaterThan(0)
  })
})

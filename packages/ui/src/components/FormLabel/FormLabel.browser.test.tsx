import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { FormLabel } from './FormLabel'

describe('FormLabel (browser, real CSS)', () => {
  it('uses the shared caption typography', () => {
    const { getByText } = render(() => <FormLabel label="Name" />)
    const style = getComputedStyle(getByText('Name'))
    expect(Number.parseFloat(style.fontSize)).toBeCloseTo(12, 0)
    expect(Number.parseFloat(style.fontSize)).toBeGreaterThan(0)
  })

  it('dims a disabled label against an enabled one', () => {
    const { getByText } = render(() => (
      <div>
        <FormLabel label="Enabled" />
        <FormLabel label="Disabled" disabled />
      </div>
    ))
    expect(getComputedStyle(getByText('Enabled')).color).not.toBe(
      getComputedStyle(getByText('Disabled')).color,
    )
  })
})

import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Dropdown } from './Dropdown'

describe('Dropdown (browser, real CSS)', () => {
  it('gives the trigger a subtle, padded button box', () => {
    const { container } = render(() => (
      <Dropdown options={[{ label: 'Edit', value: 'edit' }]}>Actions</Dropdown>
    ))
    const trigger = container.querySelector(
      '[data-slot="menu-trigger"]',
    ) as HTMLElement
    const style = getComputedStyle(trigger)
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(style.paddingLeft)).toBeGreaterThan(0)
    expect(trigger.getBoundingClientRect().height).toBeGreaterThan(0)
  })
})

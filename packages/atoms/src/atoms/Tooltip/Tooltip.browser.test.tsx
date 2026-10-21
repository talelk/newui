import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Tooltip } from './Tooltip'

describe('Tooltip (browser, real CSS)', () => {
  it('paints an opaque bubble with padding', () => {
    render(() => (
      <Tooltip text="Delete forever" defaultOpen>
        Delete
      </Tooltip>
    ))
    const content = screen.getByRole('tooltip')
    const style = getComputedStyle(content)
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(style.paddingLeft)).toBeGreaterThan(0)
    expect(content.getBoundingClientRect().width).toBeGreaterThan(0)
  })
})

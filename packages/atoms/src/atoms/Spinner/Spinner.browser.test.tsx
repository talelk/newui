import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Spinner } from './Spinner'

describe('Spinner (browser, real CSS)', () => {
  it('draws a sized ring with one transparent border segment', () => {
    const { getByRole } = render(() => <Spinner size="md" />)
    const el = getByRole('status')
    const style = getComputedStyle(el)
    expect(el.getBoundingClientRect().width).toBeGreaterThan(0)
    expect(Number.parseFloat(style.borderTopWidth)).toBeGreaterThan(0)
    expect(style.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.borderRightColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('paints the arc with the theme colour', () => {
    const { getByRole } = render(() => <Spinner theme="red" />)
    const style = getComputedStyle(getByRole('status'))
    expect(style.borderRightColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(style.borderRightColor).not.toBe(style.borderTopColor)
  })
})

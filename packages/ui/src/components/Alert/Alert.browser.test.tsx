import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Alert } from './Alert'

describe('Alert (browser, real CSS)', () => {
  it('paints the subtle surface and keeps its padding', () => {
    const { getByRole } = render(() => <Alert title="Saved" />)
    const style = getComputedStyle(getByRole('status'))
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(style.paddingTop)).toBeGreaterThan(0)
  })

  it('draws an outline border with a transparent fill', () => {
    const { getByRole } = render(() => (
      <Alert variant="outline" title="Saved" />
    ))
    const style = getComputedStyle(getByRole('status'))
    expect(Number.parseFloat(style.borderTopWidth)).toBeGreaterThan(0)
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })
})

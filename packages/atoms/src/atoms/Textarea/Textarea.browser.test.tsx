import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Textarea } from './Textarea'

describe('Textarea (browser, real CSS)', () => {
  it('keeps a non-zero box, padding and a painted surface', () => {
    const { container } = render(() => (
      <Textarea aria-label="Notes" placeholder="Notes" />
    ))
    const el = container.querySelector('textarea') as HTMLElement
    const style = getComputedStyle(el)
    expect(el.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(Number.parseFloat(style.paddingTop)).toBeGreaterThan(0)
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})

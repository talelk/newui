import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'

/**
 * Real CSS, real Chrome. This is the check a class-name assertion cannot make:
 * a merge-config regression that drops `px-*` or `h-*` leaves the class in the
 * markup but collapses the box.
 */
describe('Button (browser, real CSS)', () => {
  it('keeps horizontal padding and height at every size', () => {
    for (const size of ['xs', 'sm', 'md', 'lg'] as const) {
      const { getByRole, unmount } = render(() => (
        <Button size={size}>Save</Button>
      ))
      const el = getByRole('button')
      const style = getComputedStyle(el)
      expect(
        Number.parseFloat(style.paddingLeft),
        `${size} padding-left`,
      ).toBeGreaterThan(0)
      expect(
        el.getBoundingClientRect().height,
        `${size} height`,
      ).toBeGreaterThanOrEqual(24)
      unmount()
    }
  })

  it('paints a solid theme with an opaque background', () => {
    const { getByRole } = render(() => (
      <Button variant="solid" theme="blue">
        Save
      </Button>
    ))
    const bg = getComputedStyle(getByRole('button')).backgroundColor
    expect(bg).not.toBe('rgba(0, 0, 0, 0)')
    expect(bg).not.toBe('transparent')
  })

  it('draws a focus ring on keyboard focus', () => {
    const { getByRole } = render(() => <Button>Save</Button>)
    const el = getByRole('button') as HTMLButtonElement
    el.focus()
    // `:focus-visible` needs a keyboard interaction to match.
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    const outline = getComputedStyle(el)
    expect(
      outline.outlineStyle !== 'none' ||
        Number.parseFloat(outline.outlineWidth) > 0 ||
        outline.boxShadow !== 'none',
    ).toBe(true)
  })
})

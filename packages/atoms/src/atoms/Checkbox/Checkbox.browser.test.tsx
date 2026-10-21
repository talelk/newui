import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox (browser, real CSS)', () => {
  it('keeps a non-zero box', () => {
    const { getByRole } = render(() => <Checkbox label="Accept" />)
    const box = getByRole('checkbox').getBoundingClientRect()
    expect(box.width).toBeGreaterThan(0)
    expect(box.height).toBeGreaterThan(0)
  })

  it('draws the checked glyph via the forms-plugin background image', () => {
    const { getByRole, unmount } = render(() => <Checkbox label="Accept" />)
    const unchecked = getComputedStyle(getByRole('checkbox')).backgroundImage
    unmount()
    const { getByRole: second } = render(() => (
      <Checkbox label="Accept" checked />
    ))
    const checked = getComputedStyle(second('checkbox')).backgroundImage
    expect(checked).not.toBe(unchecked)
    expect(checked).not.toBe('none')
  })

  it('paints the checked fill dark, so the white glyph is visible', () => {
    const { getByRole, unmount } = render(() => <Checkbox label="Accept" />)
    const unchecked = getComputedStyle(getByRole('checkbox')).backgroundColor
    unmount()

    const { getByRole: checkedBox } = render(() => (
      <Checkbox label="Accept" checked />
    ))
    const checked = getComputedStyle(checkedBox('checkbox')).backgroundColor
    // Regression guard: the fill must change (it was `surface-base`, so a white
    // check on a white box was invisible in light mode).
    expect(checked).not.toBe(unchecked)
    // `ink-gray-9` is a near-black in both themes.
    const channels = checked.match(/[\d.]+/g)?.map(Number) ?? []
    const [r = 255, g = 255, b = 255] = channels
    expect((r + g + b) / 3).toBeLessThan(200)
  })

  it('renders each size at its own box dimensions', () => {
    const { container } = render(() => (
      <div>
        <Checkbox label="Small" size="xs" />
        <Checkbox label="Large" size="md" />
      </div>
    ))
    const boxes = container.querySelectorAll('[data-slot="checkbox-control"]')
    const xs = (boxes[0] as HTMLElement).getBoundingClientRect()
    const md = (boxes[1] as HTMLElement).getBoundingClientRect()
    expect(xs.width).toBeCloseTo(13, 0)
    expect(md.width).toBeCloseTo(16, 0)
    expect(md.width).toBeGreaterThan(xs.width)
  })

  it('gives a padded row its fixed compact height', () => {
    const { container } = render(() => <Checkbox padded label="Row" />)
    const surface = container.firstElementChild as HTMLElement
    // `sm` padded label-only rows are `h-7` (28px).
    expect(surface.getBoundingClientRect().height).toBeCloseTo(28, 0)
  })
})

import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { TagInput } from './TagInput'

describe('TagInput (browser, real CSS)', () => {
  it('keeps its declared minimum height per size', () => {
    const small = render(() => <TagInput label="Tags" size="sm" />)
    const smallBox = small.container.querySelector(
      '[data-slot="tag-input"]',
    ) as HTMLElement
    // `min-h-7` — an empty control is still a target worth hitting.
    expect(smallBox.getBoundingClientRect().height).toBeGreaterThanOrEqual(28)
    small.unmount()

    const medium = render(() => <TagInput label="Tags" size="md" />)
    const mediumBox = medium.container.querySelector(
      '[data-slot="tag-input"]',
    ) as HTMLElement
    expect(mediumBox.getBoundingClientRect().height).toBeGreaterThanOrEqual(32)
  })

  it('draws the outline variant border', () => {
    const { container } = render(() => (
      <TagInput label="Tags" variant="outline" />
    ))
    const box = container.querySelector(
      '[data-slot="tag-input"]',
    ) as HTMLElement
    const style = getComputedStyle(box)
    expect(Number.parseFloat(style.borderTopWidth)).toBeGreaterThan(0)
    expect(style.borderTopStyle).toBe('solid')
    expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('paints each token chip', () => {
    const { container } = render(() => (
      <TagInput label="Tags" defaultValue={['design', 'research']} />
    ))
    const token = container.querySelector(
      '[data-slot="tag-input-token"]',
    ) as HTMLElement
    expect(token.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(getComputedStyle(token).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(token.getBoundingClientRect().width).toBeGreaterThan(0)
  })
})

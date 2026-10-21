import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Card } from './Card'

describe('Card (browser, real CSS)', () => {
  it('keeps padding, a border, and an opaque surface', () => {
    const { container } = render(() => <Card>Body</Card>)
    const style = getComputedStyle(container.firstElementChild as HTMLElement)
    expect(Number.parseFloat(style.paddingTop)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.borderTopWidth)).toBeGreaterThan(0)
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('has no shadow at elevation none and a shadow at md', () => {
    const { container, unmount } = render(() => <Card elevation="none">A</Card>)
    expect(
      getComputedStyle(container.firstElementChild as HTMLElement).boxShadow,
    ).toBe('none')
    unmount()
    const { container: second } = render(() => <Card elevation="md">A</Card>)
    expect(
      getComputedStyle(second.firstElementChild as HTMLElement).boxShadow,
    ).not.toBe('none')
  })
})

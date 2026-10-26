import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Text } from './Text'

describe('Text (browser, real CSS)', () => {
  it('resolves the paragraph scale to real font sizes', () => {
    const base = render(() => <Text>Copy</Text>)
    expect(
      getComputedStyle(base.container.querySelector('p') as HTMLElement)
        .fontSize,
    ).toBe('14px')
    base.unmount()

    const xl = render(() => <Text size="xl">Copy</Text>)
    expect(
      getComputedStyle(xl.container.querySelector('p') as HTMLElement).fontSize,
    ).toBe('17px')
  })

  it('paints the default reading ink', () => {
    const { container } = render(() => <Text>Copy</Text>)
    const color = getComputedStyle(
      container.querySelector('p') as HTMLElement,
    ).color
    expect(color).not.toBe('rgba(0, 0, 0, 0)')
    expect(color).not.toBe('')
  })

  it('applies the weight composites', () => {
    const regular = render(() => <Text>Copy</Text>)
    const regularWeight = getComputedStyle(
      regular.container.querySelector('p') as HTMLElement,
    ).fontWeight
    regular.unmount()

    const bold = render(() => <Text weight="bold">Copy</Text>)
    const boldWeight = getComputedStyle(
      bold.container.querySelector('p') as HTMLElement,
    ).fontWeight
    expect(Number(boldWeight)).toBeGreaterThan(Number(regularWeight))
  })
})

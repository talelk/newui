import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { TextInput } from './TextInput'

describe('TextInput (browser, real CSS)', () => {
  it('grows from sm to lg and keeps horizontal padding', () => {
    const { container, unmount } = render(() => (
      <TextInput size="sm" aria-label="Name" />
    ))
    const small = container.querySelector('input') as HTMLElement
    expect(
      Number.parseFloat(getComputedStyle(small).paddingLeft),
    ).toBeGreaterThan(0)
    const smallHeight = small.getBoundingClientRect().height
    unmount()
    const { container: second } = render(() => (
      <TextInput size="lg" aria-label="Name" />
    ))
    const large = (
      second.querySelector('input') as HTMLElement
    ).getBoundingClientRect().height
    expect(large).toBeGreaterThan(smallHeight)
  })

  it('dims a disabled input against an enabled one', () => {
    const { container, unmount } = render(() => <TextInput aria-label="Name" />)
    const enabled = getComputedStyle(
      container.querySelector('input') as HTMLElement,
    ).backgroundColor
    unmount()
    const { container: second } = render(() => (
      <TextInput aria-label="Name" disabled />
    ))
    const disabled = getComputedStyle(
      second.querySelector('input') as HTMLElement,
    ).backgroundColor
    expect(disabled).not.toBe(enabled)
  })

  it('reserves start padding for a prefix so the icon cannot overlap', () => {
    const { container: bare, unmount } = render(() => (
      <TextInput aria-label="Search" />
    ))
    const plain = Number.parseFloat(
      getComputedStyle(bare.querySelector('input') as HTMLElement).paddingLeft,
    )
    unmount()

    const { container: prefixed } = render(() => (
      <TextInput aria-label="Search" prefix={<span>icon</span>} />
    ))
    const withPrefix = Number.parseFloat(
      getComputedStyle(prefixed.querySelector('input') as HTMLElement)
        .paddingLeft,
    )
    // Regression guard: the input once carried both `ps-8` (from the prefix
    // branch) and `ps-2` (the adornment pad), and the merge kept `ps-2` — the
    // icon then sat on top of the text.
    expect(withPrefix).toBeGreaterThan(plain)
  })
})

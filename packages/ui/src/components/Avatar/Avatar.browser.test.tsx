import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'

describe('Avatar (browser, real CSS)', () => {
  it('keeps a non-zero box and paints the fallback', () => {
    const { container } = render(() => <Avatar label="Ada" />)
    const box = container.firstElementChild as HTMLElement
    expect(box.getBoundingClientRect().width).toBeGreaterThan(0)
    const fallback = box.firstElementChild as HTMLElement
    expect(getComputedStyle(fallback).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
  })

  it('grows from sm to 3xl', () => {
    const { container, unmount } = render(() => (
      <Avatar label="Ada" size="sm" />
    ))
    const small = (
      container.firstElementChild as HTMLElement
    ).getBoundingClientRect().height
    unmount()
    const { container: second } = render(() => (
      <Avatar label="Ada" size="3xl" />
    ))
    const large = (
      second.firstElementChild as HTMLElement
    ).getBoundingClientRect().height
    expect(large).toBeGreaterThan(small)
  })

  it('lets a size utility override the enum width', () => {
    const { container } = render(() => <Avatar label="Ada" class="size-10" />)
    const box = container.firstElementChild as HTMLElement
    expect(box.getBoundingClientRect().width).toBeGreaterThanOrEqual(36)
  })

  it('paints the indicator ring and dot', () => {
    const { container } = render(() => (
      <Avatar
        size="md"
        label="Ada"
        indicator={
          <span
            data-testid="dot"
            class="block h-full w-full bg-surface-green-8"
          />
        }
      />
    ))
    const indicator = container.querySelector(
      '[data-slot="avatar-indicator"]',
    ) as HTMLElement
    const dot = container.querySelector('[data-testid="dot"]') as HTMLElement
    expect(getComputedStyle(indicator).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
    expect(getComputedStyle(dot).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})

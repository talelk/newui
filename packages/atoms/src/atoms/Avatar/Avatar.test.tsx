import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('shows the first letter of the label, uppercased in CSS', () => {
    const { container } = render(() => <Avatar label="ada" />)
    expect(container.textContent).toBe('a')
    expect(container.firstElementChild?.firstElementChild).toHaveClass(
      'uppercase',
    )
  })

  it('renders the indicator slot at the bottom-end corner', () => {
    const { container } = render(() => (
      <Avatar label="Ada" indicator={<span data-testid="dot" />} />
    ))
    const indicator = container.querySelector(
      '[data-slot="avatar-indicator"]',
    ) as HTMLElement
    expect(indicator).toBeTruthy()
    expect(indicator.className).toContain('absolute')
    expect(indicator.className).toContain('end-0')
    expect(container.querySelector('[data-testid="dot"]')).toBeTruthy()
  })

  it('scales the indicator box with the size enum', () => {
    const { container } = render(() => (
      <Avatar size="xs" label="Ada" indicator={<span />} />
    ))
    const indicator = container.querySelector(
      '[data-slot="avatar-indicator"]',
    ) as HTMLElement
    expect(indicator.className).toContain('h-2')
    expect(indicator.className).toContain('w-2')
  })

  it('drops the enum size when a sizing utility is passed on class', () => {
    const { container } = render(() => <Avatar label="Ada" class="size-16" />)
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain('size-16')
    expect(root.className).not.toContain('size-6')
  })

  it('keeps the enum size when only a responsive utility is passed', () => {
    const { container } = render(() => (
      <Avatar label="Ada" class="sm:size-16" />
    ))
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain('size-6')
    expect(root.className).toContain('sm:size-16')
  })
})

import { render } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Rating } from './Rating'

describe('Rating', () => {
  it('exposes a radiogroup whose checked star matches the value', () => {
    const { container } = render(() => <Rating defaultValue={3} />)
    const group = container.querySelector('[data-slot="rating-control"]')
    expect(group?.getAttribute('role')).toBe('radiogroup')

    const checked = container.querySelector(
      '[role="radio"][aria-checked="true"]',
    )
    expect(checked?.getAttribute('aria-label')).toBe('3 stars')
  })

  it('reports a new value on click', async () => {
    const onValueChange = vi.fn()
    const { container } = render(() => <Rating onValueChange={onValueChange} />)
    const stars = container.querySelectorAll('[role="radio"]')
    // Stars are 1-based: the fourth star has value 4.
    await userEvent.click(stars[3] as Element)
    expect(onValueChange).toHaveBeenCalledWith(4)
  })

  it('renders `max` stars', () => {
    const { container } = render(() => <Rating max={3} />)
    expect(container.querySelectorAll('[role="radio"]').length).toBe(3)
  })

  it('still accepts the `count` alias', () => {
    const { container } = render(() => <Rating count={4} />)
    expect(container.querySelectorAll('[role="radio"]').length).toBe(4)
  })

  it('steps by half stars when step is 0.5', async () => {
    const onValueChange = vi.fn()
    const { container } = render(() => (
      <Rating defaultValue={2} step={0.5} onValueChange={onValueChange} />
    ))
    const checked = container.querySelector(
      '[role="radio"][aria-checked="true"]',
    ) as HTMLElement
    checked.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenCalledWith(2.5)
  })

  it('applies the requested size to every star', () => {
    const { container } = render(() => <Rating size="lg" />)
    expect(
      container.querySelector('[data-slot="rating-item"]')?.className,
    ).toContain('size-6')
  })
})

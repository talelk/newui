import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders a single aria-hidden block by default', () => {
    const { container } = render(() => <Skeleton class="h-4 w-40" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.getAttribute('data-slot')).toBe('skeleton')
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect(el.className).toContain('animate-pulse')
    expect(el.children.length).toBe(0)
    expect(el.className).toContain('w-40')
  })

  it('renders one bar per line inside a stacked wrapper', () => {
    const { container } = render(() => <Skeleton lines={3} />)
    const root = container.firstElementChild as HTMLElement
    expect(root.getAttribute('data-slot')).toBe('skeleton')
    expect(root.querySelectorAll('[data-slot="skeleton-line"]').length).toBe(3)
  })

  it('clamps the line count at 1', () => {
    const { container } = render(() => <Skeleton lines={0} />)
    expect(
      container.querySelectorAll('[data-slot="skeleton-line"]').length,
    ).toBe(1)
  })
})

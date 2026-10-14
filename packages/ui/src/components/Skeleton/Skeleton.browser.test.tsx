import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Skeleton } from './Skeleton'

describe('Skeleton (browser, real CSS)', () => {
  it('renders one shimmering bar per line', () => {
    const { container } = render(() => <Skeleton lines={3} />)
    const root = container.firstElementChild as HTMLElement
    const bars = Array.from(root.children) as HTMLElement[]
    expect(bars.length).toBe(3)
    const bar = bars[0] as HTMLElement
    expect(bar.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(getComputedStyle(bar).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})

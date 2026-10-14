import { describe, expect, it } from 'vitest'
import { button } from './recipe'

describe('button recipe', () => {
  it('emits the resting look for solid gray', () => {
    const cls = button({ variant: 'solid', theme: 'gray' })
    expect(cls).toContain('bg-surface-gray-10')
    expect(cls).toContain('hover:bg-surface-gray-9')
  })

  it('emits the held pressed look via data-state', () => {
    const cls = button({ variant: 'solid', theme: 'gray' })
    expect(cls).toContain('data-[state=open]:bg-surface-gray-8')
    expect(cls).toContain('data-[state=active]:bg-surface-gray-8')
  })

  it('emits the disabled look prefixed, not swapped', () => {
    const cls = button({ variant: 'solid', theme: 'gray' })
    expect(cls).toContain('disabled:bg-surface-gray-2')
  })

  it('swaps padding for fixed dimensions on icon buttons', () => {
    const text = button({ size: 'md', icon: false })
    const icon = button({ size: 'md', icon: true })
    expect(text).toContain('px-2.5')
    expect(icon).toContain('w-8')
  })
})

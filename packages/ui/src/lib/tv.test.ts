import { describe, expect, it } from 'vitest'
import { cn, cx, tv, type VariantProps } from './tv'

/**
 * The class-merging contract.
 *
 * `cn` decides which of two conflicting utilities survives, and a wrong answer
 * is a visual bug (a caller's override silently ignored). These cases pin the
 * behaviour so the resolver can be refactored — or its cost trimmed — without
 * changing what a call site renders.
 */
describe('cn', () => {
  it('lets a later colour win within the same family', () => {
    expect(cn('bg-surface-gray-2', 'bg-surface-red-2')).toBe('bg-surface-red-2')
  })

  it('keeps size and colour independent (the custom text-<size>-<weight> tokens)', () => {
    expect(cn('text-base-medium', 'text-ink-gray-8')).toBe(
      'text-base-medium text-ink-gray-8',
    )
  })

  it('lets a later spacing value win', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('keeps orthogonal utilities', () => {
    expect(cn('flex items-center gap-2', 'p-3')).toBe(
      'flex items-center gap-2 p-3',
    )
  })

  it('drops falsy inputs', () => {
    expect(cn('p-2', false, undefined, null, '', 'm-1')).toBe('p-2 m-1')
  })
})

describe('cx', () => {
  it('concatenates without resolving conflicts', () => {
    expect(cx('p-2', 'p-4')).toBe('p-2 p-4')
  })
})

describe('tv', () => {
  const recipe = tv({
    base: 'inline-flex items-center',
    variants: {
      size: { sm: 'h-6', lg: 'h-10' },
      icon: { true: 'w-6', false: '' },
    },
    compoundVariants: [{ size: 'lg', icon: true, class: 'w-10' }],
    defaultVariants: { size: 'sm', icon: false },
  })

  it('applies defaults when called with nothing', () => {
    expect(recipe()).toContain('h-6')
    expect(recipe()).toContain('items-center')
  })

  it('resolves the boolean axis', () => {
    expect(recipe({ icon: true })).toContain('w-6')
  })

  it('applies compound variants only when every condition matches', () => {
    expect(recipe({ size: 'lg', icon: true })).toContain('w-10')
    expect(recipe({ size: 'sm', icon: true })).not.toContain('w-10')
  })

  it('merges a caller class last', () => {
    expect(recipe({ size: 'sm', class: 'h-12' })).toBe(
      'inline-flex items-center h-12',
    )
  })

  it('exposes its variants through VariantProps', () => {
    type Props = VariantProps<typeof recipe>
    const valid: Props = { size: 'lg', icon: true }
    // @ts-expect-error `xl` is not a declared size
    const invalid: Props = { size: 'xl' }
    expect(valid).toBeDefined()
    expect(invalid).toBeDefined()
  })
})

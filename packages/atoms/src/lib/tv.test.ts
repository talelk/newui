import { describe, expect, it } from 'vitest'
import { button } from '../atoms/Button/recipe'
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

/**
 * Real colliding sets, table-driven. Every row is an exact-string assertion:
 * a `cn` that merely concatenates (or a merge config that drops a family)
 * fails here, not in a rendered component. Rows mirror utilities the recipes
 * actually emit — numeric radii and named shadows are this library's
 * vocabulary, unknown to a stock merge config.
 */
describe('cn colliding sets', () => {
  const cases: Array<{ name: string; inputs: string[]; expected: string }> = [
    // padding axes: different axes coexist, later shorthand wins over axis
    { name: 'p + px coexist', inputs: ['p-2', 'px-4'], expected: 'p-2 px-4' },
    { name: 'later p overrides px', inputs: ['px-4', 'p-2'], expected: 'p-2' },
    { name: 'later px wins', inputs: ['px-2', 'px-4'], expected: 'px-4' },
    // size shorthand vs single dimension
    {
      name: 'size + w coexist',
      inputs: ['size-4', 'w-8'],
      expected: 'size-4 w-8',
    },
    {
      name: 'later size overrides w',
      inputs: ['w-8', 'size-4'],
      expected: 'size-4',
    },
    {
      name: 'later size wins',
      inputs: ['size-4', 'size-6'],
      expected: 'size-6',
    },
    // text size vs text colour are different properties
    {
      name: 'later text size wins',
      inputs: ['text-base', 'text-lg-medium'],
      expected: 'text-lg-medium',
    },
    {
      name: 'later text colour wins',
      inputs: ['text-ink-gray-8', 'text-ink-red-8'],
      expected: 'text-ink-red-8',
    },
    {
      name: 'text size + colour coexist',
      inputs: ['text-base-medium', 'text-ink-gray-8'],
      expected: 'text-base-medium text-ink-gray-8',
    },
    // numeric radius (library vocabulary)
    {
      name: 'later numeric radius wins',
      inputs: ['rounded-3', 'rounded-5'],
      expected: 'rounded-5',
    },
    {
      name: 'radius + corner coexist',
      inputs: ['rounded-3', 'rounded-t-5'],
      expected: 'rounded-3 rounded-t-5',
    },
    // named shadow steps (library vocabulary)
    {
      name: 'later named shadow wins',
      inputs: ['shadow-base', 'shadow-lg'],
      expected: 'shadow-lg',
    },
    {
      name: 'named shadow overrides bare shadow',
      inputs: ['shadow', 'shadow-base'],
      expected: 'shadow-base',
    },
    // modifiers scope the conflict: same modifier collides, others do not
    {
      name: 'hover does not collide with base',
      inputs: ['bg-surface-gray-2', 'hover:bg-surface-gray-3'],
      expected: 'bg-surface-gray-2 hover:bg-surface-gray-3',
    },
    {
      name: 'later same-modifier wins',
      inputs: ['hover:bg-surface-gray-3', 'hover:bg-surface-gray-4'],
      expected: 'hover:bg-surface-gray-4',
    },
    {
      name: 'dark does not collide with base',
      inputs: ['bg-surface-gray-2', 'dark:bg-surface-gray-9'],
      expected: 'bg-surface-gray-2 dark:bg-surface-gray-9',
    },
    {
      name: 'data-state does not collide with base',
      inputs: ['data-[state=open]:bg-surface-gray-4', 'bg-surface-gray-2'],
      expected: 'data-[state=open]:bg-surface-gray-4 bg-surface-gray-2',
    },
    // border width vs border colour
    {
      name: 'border width + colour coexist',
      inputs: ['border', 'border-outline-gray-2'],
      expected: 'border border-outline-gray-2',
    },
    {
      name: 'later border colour wins',
      inputs: ['border-outline-gray-2', 'border-outline-gray-3'],
      expected: 'border-outline-gray-3',
    },
  ]

  it.each(cases)('$name', ({ inputs, expected }) => {
    expect(cn(...inputs)).toBe(expected)
  })
})

describe('tv override order', () => {
  // Each layer sets the same axis (padding), so the survivor names the
  // winning layer: base < variant < compound < caller class.
  const layered = tv({
    base: 'flex p-1',
    variants: {
      tone: { plain: 'p-2', rich: 'bg-surface-gray-2' },
      dense: { true: '', false: '' },
    },
    compoundVariants: [{ tone: 'plain', dense: true, class: 'p-3' }],
    defaultVariants: { tone: 'plain', dense: false },
  })

  it('variant overrides base', () => {
    expect(layered()).toBe('flex p-2')
  })

  it('compound overrides variant and base', () => {
    expect(layered({ dense: true })).toBe('flex p-3')
  })

  it('caller class overrides compound, variant and base', () => {
    expect(layered({ dense: true, class: 'p-4' })).toBe('flex p-4')
  })

  it('caller class overrides a variant colour', () => {
    expect(layered({ tone: 'rich', class: 'bg-surface-red-2' })).toBe(
      'flex p-1 bg-surface-red-2',
    )
  })
})

describe('real recipe: button', () => {
  const tokensOf = (classes: string) => classes.split(' ')

  it('caller class overrides the size variant padding', () => {
    const tokens = tokensOf(button({ size: 'sm', class: 'px-6' }))
    expect(tokens).toContain('px-6')
    expect(tokens).not.toContain('px-2')
  })

  it('caller class overrides the compound (theme×variant) surface', () => {
    const tokens = tokensOf(button({ class: 'bg-surface-red-2' }))
    expect(tokens).toContain('bg-surface-red-2')
    expect(tokens).not.toContain('bg-surface-gray-2')
    // modifier-scoped surfaces are a different conflict scope and survive
    expect(tokens).toContain('hover:bg-surface-gray-3')
  })

  it('icon compound overrides the text-size variant box', () => {
    const tokens = tokensOf(button({ size: 'md', icon: true }))
    expect(tokens).toContain('h-8')
    expect(tokens).toContain('w-8')
    expect(tokens).toContain('px-0')
    expect(tokens).not.toContain('h-auto')
    expect(tokens).not.toContain('px-2.5')
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

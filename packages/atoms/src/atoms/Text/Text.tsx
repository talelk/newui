import type { JSX } from 'solid-js'
import { cn } from '../../lib/tv'

export type TextSize = '2xs' | 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl'
export type TextWeight = 'medium' | 'semibold' | 'bold'

// Literal class maps, not a template: the scanner (and `pnpm css:check`)
// can only see utilities that appear verbatim in source.
const CLASS: Record<TextSize, Record<'regular' | TextWeight, string>> = {
  '2xs': {
    regular: 'text-p-2xs',
    medium: 'text-p-2xs-medium',
    semibold: 'text-p-2xs-semibold',
    bold: 'text-p-2xs-bold',
  },
  xs: {
    regular: 'text-p-xs',
    medium: 'text-p-xs-medium',
    semibold: 'text-p-xs-semibold',
    bold: 'text-p-xs-bold',
  },
  sm: {
    regular: 'text-p-sm',
    medium: 'text-p-sm-medium',
    semibold: 'text-p-sm-semibold',
    bold: 'text-p-sm-bold',
  },
  base: {
    regular: 'text-p-base',
    medium: 'text-p-base-medium',
    semibold: 'text-p-base-semibold',
    bold: 'text-p-base-bold',
  },
  md: {
    regular: 'text-p-md',
    medium: 'text-p-md-medium',
    semibold: 'text-p-md-semibold',
    bold: 'text-p-md-bold',
  },
  lg: {
    regular: 'text-p-lg',
    medium: 'text-p-lg-medium',
    semibold: 'text-p-lg-semibold',
    bold: 'text-p-lg-bold',
  },
  xl: {
    regular: 'text-p-xl',
    medium: 'text-p-xl-medium',
    semibold: 'text-p-xl-semibold',
    bold: 'text-p-xl-bold',
  },
  '2xl': {
    regular: 'text-p-2xl',
    medium: 'text-p-2xl-medium',
    semibold: 'text-p-2xl-semibold',
    bold: 'text-p-2xl-bold',
  },
}

export interface TextProps {
  /**
   * Paragraph size. The scale matches the `text-p-*` tokens; `base` is body
   * copy.
   */
  size?: TextSize
  /** Weight composite. Omitted = the scale's regular weight. */
  weight?: TextWeight
  class?: string
  children: JSX.Element
}

/**
 * Body copy. Resolves the paragraph scale (`text-p-*` and its weight
 * composites) with the kit's default reading color, so a page's prose starts
 * consistent and diverges deliberately via `class`.
 */
export function Text(props: TextProps): JSX.Element {
  const size = () => props.size ?? 'base'
  return (
    <p
      data-slot="text"
      data-size={size()}
      data-weight={props.weight}
      class={cn(
        CLASS[size()][props.weight ?? 'regular'],
        'text-ink-gray-8',
        props.class,
      )}
    >
      {props.children}
    </p>
  )
}

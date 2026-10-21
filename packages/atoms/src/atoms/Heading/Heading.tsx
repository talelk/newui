import type { JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { cn } from '../../lib/tv'

export type HeadingLevel = 1 | 2 | 3

const TAG: Record<HeadingLevel, 'h1' | 'h2' | 'h3'> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
}

const ROLE: Record<HeadingLevel, string> = {
  // The scale has two display roles: the page title and the section title.
  // A third level repeats the section role — the document outline carries
  // the hierarchy, not a fourth size the type scale does not have.
  1: 'text-heading text-ink-gray-9',
  2: 'text-section text-ink-gray-9',
  3: 'text-section text-ink-gray-9',
}

export interface HeadingProps {
  /**
   * Semantic heading level, rendered as `h1`–`h3`. `1` is the page title
   * (24px), `2`/`3` are section titles (18px).
   */
  level?: HeadingLevel
  class?: string
  children: JSX.Element
}

/** A section or page title. The level drives both the element and the role. */
export function Heading(props: HeadingProps): JSX.Element {
  const level = () => props.level ?? 2
  return (
    <Dynamic
      component={TAG[level()]}
      data-slot="heading"
      data-level={level()}
      class={cn(ROLE[level()], props.class)}
    >
      {props.children}
    </Dynamic>
  )
}

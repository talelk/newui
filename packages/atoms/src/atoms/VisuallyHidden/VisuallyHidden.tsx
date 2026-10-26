import type { JSX } from 'solid-js'
import { cn } from '../../lib/tv'

export interface VisuallyHiddenProps {
  class?: string
  children: JSX.Element
}

/**
 * Renders its content to assistive tech while taking no space on screen.
 * For the extra context a sighted user gets but a screen reader does not —
 * a required marker, a live region, the column a cell belongs to.
 */
export function VisuallyHidden(props: VisuallyHiddenProps): JSX.Element {
  return (
    <span data-slot="visually-hidden" class={cn('sr-only', props.class)}>
      {props.children}
    </span>
  )
}

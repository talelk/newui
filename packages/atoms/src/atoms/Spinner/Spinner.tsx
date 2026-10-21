import { type JSX, Show, splitProps } from 'solid-js'
import { cn } from '../../lib/tv'

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'
export type SpinnerTheme = 'gray' | 'blue' | 'green' | 'red'

export interface SpinnerProps {
  size?: SpinnerSize
  /** Fixed colour. Omit to inherit the current text colour. */
  theme?: SpinnerTheme
  /** Faint full-circle track behind the arc. */
  track?: boolean
  class?: string
}

const SIZE: Record<SpinnerSize, string> = {
  xs: 'size-3 border-[1.5px]',
  sm: 'size-3.5 border-2',
  md: 'size-4 border-2',
  lg: 'size-5 border-2',
}

// The arc reads `currentColor`, so a theme is just a text colour. Gray and red
// match frappe-ui (`ink-gray-8` / `ink-red-7`); blue and green complete the
// status vocabulary at the same step.
const THEME: Record<SpinnerTheme, string> = {
  gray: 'text-ink-gray-8',
  blue: 'text-ink-blue-7',
  green: 'text-ink-green-7',
  red: 'text-ink-red-7',
}

/**
 * A busy indicator. Inherits the current text color, so `text-*` on the
 * spinner or a parent tints it. Sized by `size` or a `size-*`/`w-*` class.
 * `theme` pins a fixed status colour instead.
 */
export function Spinner(props: SpinnerProps): JSX.Element {
  const [local] = splitProps(props, ['size', 'theme', 'track', 'class'])
  return (
    <span
      role="status"
      aria-label="Loading"
      data-slot="spinner"
      class={cn(
        'inline-block shrink-0 animate-spin rounded-full',
        'motion-reduce:[animation-duration:1.6s]',
        'border-current border-t-transparent',
        local.track && 'border-current/15 border-t-current',
        local.size ? SIZE[local.size] : 'size-4 border-2',
        local.theme && THEME[local.theme],
        local.class,
      )}
    />
  )
}

/** Spinner + label, for inline loading states. */
export function LoadingText(props: {
  class?: string
  children?: JSX.Element
}): JSX.Element {
  return (
    <span
      class={cn('flex items-center text-base text-ink-gray-6', props.class)}
    >
      <Spinner size="xs" class="-ml-1 mr-2" />
      <Show when={props.children}>
        <span>{props.children}</span>
      </Show>
    </span>
  )
}

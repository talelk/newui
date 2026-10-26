import { type JSX, Show } from 'solid-js'
import { cn, tv } from '../../lib/tv'

export const keyValue = tv({
  base: 'flex min-w-0',
  variants: {
    orientation: {
      horizontal: 'flex-row items-baseline justify-between gap-4',
      vertical: 'flex-col gap-0.5',
    },
  },
  defaultVariants: { orientation: 'horizontal' },
})

export interface KeyValueProps {
  /** The field's name: the quiet half of the pair. */
  label: JSX.Element
  /** The field's value. `children` replaces it when a node is more natural. */
  value?: JSX.Element
  /** Stacks the pair instead of spreading it across the row. */
  orientation?: 'horizontal' | 'vertical'
  /** Merged into the root. */
  class?: string
  /** The default value content. */
  children?: JSX.Element
}

/**
 * One label/value pair: the row a settings page repeats for "Email digests —
 * Weekly" and "Plan — Team". The label is the quiet half; the value carries
 * tabular figures so numeric values line up. A group of pairs stacks as plain
 * siblings; the row owns no list semantics.
 */
export function KeyValue(props: KeyValueProps): JSX.Element {
  return (
    <div
      data-slot="key-value"
      class={cn(keyValue({ orientation: props.orientation }), props.class)}
    >
      <span
        data-slot="key-value-label"
        class="min-w-0 text-base text-ink-gray-7"
      >
        {props.label}
      </span>
      <Show
        when={props.children !== undefined}
        fallback={
          <Show when={props.value !== undefined}>
            <span
              data-slot="key-value-value"
              class="min-w-0 text-base font-medium text-ink-gray-9 tabular-nums"
            >
              {props.value}
            </span>
          </Show>
        }
      >
        <span
          data-slot="key-value-value"
          class="min-w-0 text-base font-medium text-ink-gray-9 tabular-nums"
        >
          {props.children}
        </span>
      </Show>
    </div>
  )
}

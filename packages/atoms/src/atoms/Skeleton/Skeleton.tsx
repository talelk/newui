import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'
import { cn } from '../../lib/tv'

export interface SkeletonProps {
  /** Number of shimmering bars. Omit for the class-sized single block. */
  lines?: number
  class?: string
}

export function Skeleton(props: SkeletonProps): JSX.Element {
  return (
    <Show
      when={props.lines !== undefined}
      fallback={
        <div
          class={cn('animate-pulse bg-surface-gray-3', props.class)}
          aria-hidden="true"
        />
      }
    >
      <div
        class={cn('flex w-full flex-col gap-2', props.class)}
        aria-hidden="true"
      >
        <For each={Array.from({ length: Math.max(1, props.lines ?? 1) })}>
          {() => (
            <div class="h-4 w-full animate-pulse rounded-3 bg-surface-gray-3" />
          )}
        </For>
      </div>
    </Show>
  )
}

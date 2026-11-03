import { For, type JSX, Show, splitProps } from 'solid-js'
import { cn } from '../../lib/tv'

export type ProgressSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ProgressProps {
  /** 0–100. Ignored when `indeterminate`. */
  value?: number
  indeterminate?: boolean
  size?: ProgressSize
  /** Text shown above the track, at the start of the label row. */
  label?: string
  /** Show the current percentage at the end of the label row. */
  hint?: boolean
  /** Render a segmented track of N intervals instead of a continuous bar. */
  intervals?: number
  /** Accessible name. A progressbar is unlabelled without one. */
  'aria-label'?: string
  class?: string
}

const SIZE: Record<ProgressSize, string> = {
  sm: 'h-0.5',
  md: 'h-1',
  lg: 'h-2',
  xl: 'h-3',
}

export function Progress(props: ProgressProps): JSX.Element {
  const [local] = splitProps(props, [
    'value',
    'indeterminate',
    'size',
    'label',
    'hint',
    'intervals',
    'aria-label',
    'class',
  ])
  const size = () => local.size ?? 'sm'
  const clamped = () => Math.min(100, Math.max(0, local.value ?? 0))
  const showHeader = () => Boolean(local.label || local.hint)
  const intervalCount = () => Math.max(0, Math.floor(local.intervals ?? 0))
  const useIntervals = () => !local.indeterminate && intervalCount() > 0
  const filled = () => Math.round((clamped() / 100) * intervalCount())

  return (
    <div
      data-slot="progress"
      data-size={size()}
      class={cn('w-full space-y-2.5', local.class)}
    >
      <Show when={showHeader()}>
        <div class="flex items-baseline justify-between">
          <span class="text-base-medium text-ink-gray-8">{local.label}</span>
          <Show when={local.hint}>
            <span class="self-end text-base-medium text-ink-gray-6">
              {clamped()}%
            </span>
          </Show>
        </div>
      </Show>

      <div
        role="progressbar"
        data-slot="progress-track"
        aria-label={local['aria-label'] ?? local.label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={local.indeterminate ? undefined : clamped()}
        class={cn(
          'transform-gpu overflow-hidden rounded-pill',
          SIZE[size()],
          useIntervals() ? 'flex gap-1' : 'bg-surface-gray-2',
        )}
      >
        <Show
          when={!local.indeterminate}
          fallback={
            <div
              data-slot="progress-fill"
              class="h-full w-1/3 animate-progress bg-surface-gray-10"
            />
          }
        >
          <Show
            when={useIntervals()}
            fallback={
              <div
                data-slot="progress-fill"
                class="h-full bg-surface-gray-10 transition-[width] duration-progress ease-standard motion-reduce:transition-none"
                style={{ width: `${clamped()}%` }}
              />
            }
          >
            <For each={Array.from({ length: intervalCount() })}>
              {(_, index) => (
                <div
                  class={cn(
                    'h-full flex-1 rounded-pill',
                    index() < filled()
                      ? 'bg-surface-gray-10'
                      : 'bg-surface-gray-2',
                  )}
                />
              )}
            </For>
          </Show>
        </Show>
      </div>
    </div>
  )
}

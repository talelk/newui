import * as zag from '@zag-js/rating-group'
import { For, type JSX, Show, splitProps } from 'solid-js'
import { createId } from '../../lib/id'
import { cn } from '../../lib/tv'
import { createZagApi } from '../../lib/zag'

type RatingApi = ReturnType<typeof zag.connect>
type RatingSize = 'xs' | 'sm' | 'md' | 'lg'

export interface RatingProps {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Number of stars to render. Alias of `max`; `max` wins when both are set. */
  count?: number
  /** Number of stars to render. Defaults to 5. */
  max?: number
  /**
   * Granularity of the rating value. `1` for whole stars (default), `0.5` for
   * half stars.
   */
  step?: 1 | 0.5
  /** Size of the rating. Defaults to `sm`. */
  size?: RatingSize
  disabled?: boolean
  readonly?: boolean
  /** Star glyph; the component's content, so it is a prop + slot pair (P11). */
  icon?: (index: number) => JSX.Element
  label?: JSX.Element
  class?: string
}

const SIZE: Record<RatingSize, string> = {
  xs: 'size-3.5',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
}

function Star(): JSX.Element {
  return (
    <svg
      viewBox="0 0 20 20"
      class="size-full"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 1.6l2.47 5.36 5.86.63-4.36 3.96 1.2 5.77L10 14.5l-5.17 2.82 1.2-5.77L1.67 7.6l5.86-.63L10 1.6z" />
    </svg>
  )
}

export function Rating(props: RatingProps): JSX.Element {
  const [local] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'count',
    'max',
    'step',
    'size',
    'disabled',
    'readonly',
    'icon',
    'label',
    'class',
  ])

  const size = () => local.size ?? 'sm'
  const count = () => local.max ?? local.count ?? 5
  const allowHalf = () => local.step === 0.5

  const { api } = createZagApi<RatingApi>(zag.machine, zag.connect, () => ({
    id: createId('rating'),
    value: local.value,
    defaultValue: local.defaultValue,
    count: count(),
    allowHalf: allowHalf(),
    disabled: local.disabled,
    readOnly: local.readonly,
    onValueChange: (details: { value: number }) =>
      local.onValueChange?.(details.value),
  }))

  return (
    <div
      {...api().getRootProps()}
      data-slot="rating"
      class={cn('flex flex-col gap-1', local.class)}
    >
      <Show when={local.label}>
        <span
          {...api().getLabelProps()}
          class="text-base font-medium text-ink-gray-8"
        >
          {local.label}
        </span>
      </Show>
      <div
        {...api().getControlProps()}
        data-slot="rating-control"
        class="flex items-center gap-0.5 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60"
      >
        <For each={api().items}>
          {(item) => {
            // Zag reports `highlighted` (the star is at or below the value or
            // hover) and `half` (exactly half). The left half is filled whenever
            // the star is highlighted; the right half only when it is not half.
            const state = () => api().getItemState({ index: item })
            const halfColor = (filled: boolean) =>
              filled ? 'text-ink-amber-6' : 'text-ink-gray-3'
            return (
              <span
                {...api().getItemProps({ index: item })}
                data-slot="rating-item"
                class={cn(
                  'relative inline-flex shrink-0',
                  SIZE[size()],
                  local.disabled ? 'cursor-default' : 'cursor-pointer',
                )}
              >
                <span
                  data-slot="rating-half"
                  aria-hidden="true"
                  class={cn(
                    'absolute inset-0 inline-flex items-center justify-center',
                    halfColor(state().highlighted),
                  )}
                  style={{ 'clip-path': 'inset(0 50% 0 0)' }}
                >
                  {local.icon?.(item - 1) ?? <Star />}
                </span>
                <span
                  data-slot="rating-half"
                  aria-hidden="true"
                  class={cn(
                    'absolute inset-0 inline-flex items-center justify-center',
                    halfColor(state().highlighted && !state().half),
                  )}
                  style={{ 'clip-path': 'inset(0 0 0 50%)' }}
                >
                  {local.icon?.(item - 1) ?? <Star />}
                </span>
              </span>
            )
          }}
        </For>
        <input {...api().getHiddenInputProps()} />
      </div>
    </div>
  )
}

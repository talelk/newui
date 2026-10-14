import * as zag from '@zag-js/slider'
import { For, type JSX, splitProps } from 'solid-js'
import { createId } from '../../lib/id'
import { cn } from '../../lib/tv'
import { createZagApi } from '../../lib/zag'

type SliderApi = ReturnType<typeof zag.connect>

type SliderSize = 'sm' | 'md'

export interface SliderProps {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  /** Visual size of the slider. Defaults to `sm`. */
  size?: SliderSize
  disabled?: boolean
  /** Accessible name for the thumb(s). Required when there is no visible label. */
  'aria-label'?: string
  class?: string
}

export function Slider(props: SliderProps): JSX.Element {
  const [local] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'min',
    'max',
    'step',
    'size',
    'disabled',
    'aria-label',
    'class',
  ])
  const size = () => local.size ?? 'sm'

  const { api } = createZagApi<SliderApi>(zag.machine, zag.connect, () => ({
    id: createId('slider'),
    value: local.value,
    defaultValue: local.defaultValue ?? [0],
    min: local.min ?? 0,
    max: local.max ?? 100,
    step: local.step ?? 1,
    disabled: local.disabled,
    onValueChange: (details: { value: number[] }) =>
      local.onValueChange?.(details.value),
  }))

  return (
    <div
      {...api().getRootProps()}
      data-slot="slider"
      class={cn(
        'relative flex w-full touch-none select-none items-center',
        size() === 'md' ? 'h-5' : 'h-4',
        'data-[disabled]:cursor-not-allowed',
        local.class,
      )}
    >
      <div
        {...api().getControlProps()}
        class="relative flex w-full items-center"
      >
        <div
          {...api().getTrackProps()}
          data-slot="slider-track"
          class={cn(
            'relative grow rounded-4 bg-surface-gray-3 data-[disabled]:bg-surface-gray-2',
            size() === 'md' ? 'h-1.5' : 'h-1',
          )}
        />
        <div
          {...api().getRangeProps()}
          data-slot="slider-range"
          class="absolute h-full rounded-4 bg-surface-gray-10 data-[disabled]:bg-surface-gray-4"
        />
        <For each={api().value}>
          {(_, index) => (
            // biome-ignore lint/a11y/useAriaPropsSupportedByRole: role="slider" is supplied by Zag's getThumbProps spread.
            <div
              {...api().getThumbProps({ index: index() })}
              data-slot="slider-thumb"
              aria-label={local['aria-label']}
              class={cn(
                'rounded-full bg-surface-base shadow-md transition-shadow duration-200 ease-out',
                size() === 'md' ? 'size-5' : 'size-4',
                'hover:ring-[6px] hover:ring-outline-gray-3/40',
                'focus:outline-none focus-visible:focus-ring',
                'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60',
              )}
            />
          )}
        </For>
        <For each={api().value}>
          {(_, index) => (
            <input {...api().getHiddenInputProps({ index: index() })} />
          )}
        </For>
      </div>
    </div>
  )
}

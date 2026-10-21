import * as zag from '@zag-js/slider'
import { For, type JSX, splitProps } from 'solid-js'
import { Field, useField } from '../../lib/field'
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
  id?: string
  label?: JSX.Element
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  class?: string
}

function SliderControl(props: SliderProps): JSX.Element {
  const field = useField()
  const machineId = createId('slider')
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
    id: machineId,
    ids: {
      thumb: (index: number) =>
        index === 0
          ? (props.id ?? field?.controlId() ?? `${machineId}-thumb-${index}`)
          : `${machineId}-thumb-${index}`,
      label: field?.labelId(),
    },
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
      data-invalid={field?.hasError() ? '' : undefined}
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
              id={api().getThumbProps({ index: index() })['id']}
              aria-labelledby={props.label ? field?.labelId() : undefined}
              aria-describedby={field?.describedBy()}
              aria-invalid={field?.hasError() ? 'true' : undefined}
              aria-label={local['aria-label']}
              class={cn(
                'rounded-full bg-surface-base shadow-md transition-shadow duration-200 ease-out',
                size() === 'md' ? 'size-5' : 'size-4',
                'hover:ring-[6px] hover:ring-outline-gray-3/40',
                'focus:outline-none focus-visible:focus-ring-blue motion-reduce:transition-none',
                field?.hasError() && 'ring-1 ring-outline-red-6',
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

/** The same label, supporting text and invalid-state contract as text entry. */
export function Slider(props: SliderProps): JSX.Element {
  return (
    <Field
      id={props.id}
      label={props.label}
      description={props.description}
      error={props.error}
      required={props.required}
      disabled={props.disabled}
    >
      <SliderControl {...props} />
    </Field>
  )
}

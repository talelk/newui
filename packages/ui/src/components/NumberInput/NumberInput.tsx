import * as zag from '@zag-js/number-input'
import { type JSX, Show, splitProps } from 'solid-js'
import { createId } from '../../lib/id'
import { cn } from '../../lib/tv'
import { createZagApi } from '../../lib/zag'

type NumberInputApi = ReturnType<typeof zag.connect>

export interface NumberInputProps {
  value?: string
  defaultValue?: string
  onValueChange?: (details: { value: string; valueAsNumber: number }) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  label?: JSX.Element
  class?: string
}

export function NumberInput(props: NumberInputProps): JSX.Element {
  const [local] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'min',
    'max',
    'step',
    'disabled',
    'label',
    'class',
  ])

  const { api } = createZagApi<NumberInputApi>(
    zag.machine,
    zag.connect,
    () => ({
      id: createId('number'),
      value: local.value,
      defaultValue: local.defaultValue ?? '',
      min: local.min,
      max: local.max,
      step: local.step ?? 1,
      disabled: local.disabled,
      onValueChange: (details: { value: string; valueAsNumber: number }) =>
        local.onValueChange?.(details),
    }),
  )

  const trigger =
    'grid w-6 place-items-center text-ink-gray-6 transition-colors hover:bg-surface-gray-2 disabled:cursor-not-allowed disabled:text-ink-gray-4 data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-gray-4'

  return (
    <div
      {...api().getRootProps()}
      data-slot="number-input"
      class={cn('flex w-full flex-col gap-1', local.class)}
    >
      <Show when={local.label}>
        <label
          {...api().getLabelProps()}
          for={api().getInputProps()['id']}
          class="text-base font-medium text-ink-gray-8"
        >
          {local.label}
        </label>
      </Show>
      <div
        {...api().getControlProps()}
        data-slot="number-input-control"
        class={cn(
          'flex items-stretch overflow-hidden rounded-4 border border-outline-gray-2 bg-surface-base',
          'focus-within:focus-ring',
          'data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-gray-2',
        )}
      >
        <input
          {...api().getInputProps()}
          class="w-full border-0 bg-transparent px-2 py-1.5 text-base text-ink-gray-8 outline-none placeholder:text-ink-gray-6 disabled:cursor-not-allowed"
        />
        <div class="flex flex-col divide-y divide-outline-gray-2 border-l border-outline-gray-2">
          <button
            {...api().getIncrementTriggerProps()}
            class={trigger}
            aria-label="Increment"
          >
            <svg
              viewBox="0 0 12 12"
              class="size-3"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="M6 2.5v7M2.5 6h7" stroke-linecap="round" />
            </svg>
          </button>
          <button
            {...api().getDecrementTriggerProps()}
            class={trigger}
            aria-label="Decrement"
          >
            <svg
              viewBox="0 0 12 12"
              class="size-3"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="M2.5 6h7" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

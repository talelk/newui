import { cn, Field, useField } from '@talelk/newui-atoms/internal'
import type { JSX } from 'solid-js'
import { createSignal, splitProps } from 'solid-js'
import { TimePicker } from '../TimePicker/TimePicker'

/** A selected range: `[from, to]` in canonical `HH:mm`, or `[]` when empty. */
export type TimeRangeValue = [string, string] | []

export interface TimeRangePickerProps {
  /** Controlled range as `[from, to]`, or `[]` when empty. */
  value?: TimeRangeValue
  defaultValue?: TimeRangeValue
  onValueChange?: (value: TimeRangeValue) => void
  /** Minute interval of both pickers' option lists. @default 15 */
  interval?: number
  disabled?: boolean
  /** @default Start */
  startLabel?: JSX.Element
  /** @default End */
  endLabel?: JSX.Element
  label?: JSX.Element
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  id?: string
  'aria-label'?: string
  class?: string
}

function TimeRangePickerControl(props: TimeRangePickerProps): JSX.Element {
  const field = useField()
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'interval',
    'disabled',
    'startLabel',
    'endLabel',
    'label',
    'aria-label',
    'class',
  ])

  // A half-open range (only the start picked) is held internally, like the
  // DateRangePicker's draft, so the start field does not snap back while the
  // end is still empty.
  const [draftStart, setDraftStart] = createSignal<string | null>()
  const start = () => draftStart() ?? local.value?.[0]
  const end = () => local.value?.[1]

  const commit = (from: string | null, to: string | null) => {
    if (from == null) {
      setDraftStart(undefined)
      local.onValueChange?.([])
      return
    }
    if (to == null) {
      setDraftStart(from)
      return
    }
    setDraftStart(undefined)
    local.onValueChange?.([from, to])
  }

  const bareName = () => local['aria-label'] ?? 'Choose time range'

  return (
    <div
      {...rest}
      data-slot="time-range-picker"
      data-disabled={local.disabled ? '' : undefined}
      class={cn('flex w-full flex-col gap-1', local.class)}
    >
      <fieldset
        data-slot="time-range-picker-control"
        data-invalid={field?.hasError() ? '' : undefined}
        class="flex items-start gap-2 border-0 p-0"
        aria-label={field?.hasLabel() ? undefined : bareName()}
      >
        <TimePicker
          class="min-w-0 flex-1"
          aria-label={
            typeof local.startLabel === 'string'
              ? local.startLabel
              : 'Start time'
          }
          value={start()}
          interval={local.interval}
          disabled={local.disabled}
          onValueChange={(value) => commit(value, end() ?? null)}
        />
        <span
          aria-hidden="true"
          class="grid h-7 place-items-center text-ink-gray-5"
        >
          –
        </span>
        <TimePicker
          class="min-w-0 flex-1"
          aria-label={
            typeof local.endLabel === 'string' ? local.endLabel : 'End time'
          }
          value={end()}
          interval={local.interval}
          disabled={local.disabled}
          onValueChange={(value) => commit(start() ?? null, value)}
        />
      </fieldset>
    </div>
  )
}

/**
 * A start and end time as one value: `[from, to]` in canonical `HH:mm`, or
 * `[]` while empty. Two `TimePicker`s under one field label, so the shared
 * labelling contract (P5) names the range once. A range that ends before it
 * starts (a night shift) is reported as-is — reordering is the app's call,
 * not this control's.
 */
export function TimeRangePicker(props: TimeRangePickerProps): JSX.Element {
  return (
    <Field
      id={props.id}
      label={props.label}
      description={props.description}
      error={props.error}
      required={props.required}
      disabled={props.disabled}
    >
      <TimeRangePickerControl {...props} />
    </Field>
  )
}

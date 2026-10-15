import {
  DateFormatter,
  type DateValue,
  isSameDay,
  toCalendarDateTime,
} from '@internationalized/date'
import * as zag from '@zag-js/date-picker'
import { createMemo, For, type JSX, Show, splitProps } from 'solid-js'
import { fieldSizes, popupFieldVariants } from '../../lib/control-styles'
import { dateTimeToIso, toDateTime } from '../../lib/date-value'
import { Field, useField } from '../../lib/field'
import { createId } from '../../lib/id'
import { Portal } from '../../lib/portal'
import { cn } from '../../lib/tv'
import { createZagApi } from '../../lib/zag'
import type {
  DatePickerAlign,
  DatePickerSide,
  DatePickerSize,
  DatePickerVariant,
} from '../DatePicker'
import { CalendarView } from '../DatePicker/CalendarView'
import { generateTimeOptions } from '../TimePicker/utils'

type DateTimePickerApi = ReturnType<typeof zag.connect>

export type DateTimePickerSize = DatePickerSize
export type DateTimePickerVariant = DatePickerVariant
export type DateTimePickerSide = DatePickerSide
export type DateTimePickerAlign = DatePickerAlign

export interface DateTimePickerProps {
  /**
   * Selected date and time as an ISO `YYYY-MM-DDTHH:mm` string (minute
   * precision), or `null` when empty. Input also accepts `YYYY-MM-DD`,
   * `YYYY-MM-DD HH:mm[:ss]` and `YYYY-MM-DDTHH:mm:ss`.
   */
  value?: string | null
  /** Uncontrolled initial value. */
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  /** Earliest selectable date/time (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm[:ss]`). */
  min?: string
  /** Latest selectable date/time (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm[:ss]`). */
  max?: string
  /** BCP 47 locale for formatting/parsing. */
  locale?: string
  /** Display format for the input, as `Intl.DateTimeFormatOptions` (ADR-0008). */
  format?: Intl.DateTimeFormatOptions
  /** Minute interval between generated time options. Default `30`. */
  interval?: number
  /** `id` of the rendered input. */
  id?: string
  /** Form field name. */
  name?: string
  placeholder?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  /** Prevents typing; the calendar still opens and selects. */
  readonly?: boolean
  /** Allow typing the date. Default `true`. */
  typeable?: boolean
  /** Keep the popover open after a pick. Default `false`. */
  keepOpen?: boolean
  /** Popover edge. Default `'bottom'`. */
  side?: DateTimePickerSide
  /** Popover alignment along the edge. Default `'start'`. */
  align?: DateTimePickerAlign
  /** Gap between trigger and popover, in pixels. Default `4`. */
  offset?: number
  /** Shows a clear control when a value is selected. */
  clearable?: boolean
  /** @default sm */
  size?: DateTimePickerSize
  variant?: DateTimePickerVariant
  /** Shared labelling contract (P5). */
  label?: JSX.Element
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  /** Accessible name when no visible `label` is rendered. */
  'aria-label'?: string
  /** Merged into the root. */
  class?: string
}

/** Date + time, matching the picker's ISO value shape. */
const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
}

const navButton =
  'grid size-7 place-items-center rounded-4 text-ink-gray-6 transition-colors hover:bg-surface-gray-3 hover:text-ink-gray-9 disabled:pointer-events-none'
const cellButton =
  'grid size-8 place-items-center rounded-3 text-base text-ink-gray-8 outline-none transition-colors hover:bg-surface-gray-3 data-[selected]:bg-surface-gray-10 data-[selected]:text-ink-base data-[today]:font-medium data-[outside-range]:text-ink-gray-4 data-[disabled]:pointer-events-none data-[disabled]:text-ink-gray-3 data-[unavailable]:pointer-events-none data-[unavailable]:text-ink-gray-3 data-[unavailable]:line-through'
const timeOption =
  'flex h-7 items-center justify-center rounded-4 px-2 text-base tabular-nums text-ink-gray-6 outline-none transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-8 data-[selected]:bg-surface-gray-3 data-[selected]:text-ink-gray-8'

/** A controlled selection array, or `undefined` to leave the machine in charge. */
function toValue(value?: string | null): DateValue[] | undefined {
  if (value === undefined) return undefined
  const date = toDateTime(value)
  return date ? [date] : []
}

type ControlProps = Omit<
  DateTimePickerProps,
  'label' | 'description' | 'error' | 'required'
>

function DateTimePickerControl(props: ControlProps): JSX.Element {
  const [local] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'min',
    'max',
    'locale',
    'format',
    'interval',
    'id',
    'name',
    'placeholder',
    'open',
    'defaultOpen',
    'onOpenChange',
    'disabled',
    'readonly',
    'typeable',
    'keepOpen',
    'side',
    'align',
    'offset',
    'clearable',
    'size',
    'variant',
    'class',
  ])

  const field = useField()
  const size = () => local.size ?? 'sm'
  const side = () => local.side ?? 'bottom'
  const align = () => local.align ?? 'start'
  const offset = () => local.offset ?? 4

  const readOnly = () => Boolean(local.readonly) || local.typeable === false

  const machineId = createId('date-time-picker')
  const { api } = createZagApi<DateTimePickerApi>(
    zag.machine,
    zag.connect,
    () => ({
      id: machineId,
      locale: local.locale ?? 'en-US',
      selectionMode: 'single',
      value: toValue(local.value),
      defaultValue: (() => {
        const initial = toDateTime(local.defaultValue)
        return initial ? [initial] : undefined
      })(),
      min: toDateTime(local.min),
      max: toDateTime(local.max),
      open: local.open,
      defaultOpen: local.defaultOpen,
      disabled: local.disabled,
      readOnly: readOnly(),
      closeOnSelect: !(local.keepOpen ?? false),
      required: field?.required(),
      invalid: field?.hasError(),
      name: local.name,
      openOnClick: true,
      placeholder: local.placeholder,
      format: (
        date: DateValue,
        details: { locale: string; timeZone: string },
      ) =>
        new DateFormatter(details.locale, {
          ...(local.format ?? DEFAULT_FORMAT),
          timeZone: details.timeZone,
        }).format(date.toDate(details.timeZone)),
      ids: field
        ? { input: () => field.controlId(), label: () => field.labelId() }
        : local.id
          ? { input: () => local.id as string }
          : undefined,
      positioning: { placement: `${side()}-${align()}`, gutter: offset() },
      onValueChange: (details: { value: DateValue[] }) =>
        local.onValueChange?.(dateTimeToIso(details.value[0])),
      onOpenChange: (details: { open: boolean }) =>
        local.onOpenChange?.(details.open),
    }),
  )

  const bareName = () =>
    props['aria-label'] ?? local.placeholder ?? 'Choose date and time'

  const selectedTime = () => {
    const value = api().value[0]
    if (!value || !('hour' in value)) return ''
    return `${value.hour.toString().padStart(2, '0')}:${value.minute
      .toString()
      .padStart(2, '0')}`
  }

  // Only bound the time list when the selected day is the min/max day, so
  // `min`/`max` keep day-level semantics otherwise.
  const minMinutes = () => {
    const min = toDateTime(local.min)
    const selected = api().value[0]
    if (min && selected && isSameDay(selected, min)) {
      return min.hour * 60 + min.minute
    }
    return null
  }
  const maxMinutes = () => {
    const max = toDateTime(local.max)
    const selected = api().value[0]
    if (max && selected && isSameDay(selected, max)) {
      return max.hour * 60 + max.minute
    }
    return null
  }

  const timeOptions = createMemo(() =>
    generateTimeOptions({
      interval: local.interval ?? 30,
      minMinutes: minMinutes(),
      maxMinutes: maxMinutes(),
    }),
  )

  function selectTime(option: string) {
    const [hour = 0, minute = 0] = option.split(':').map((part) => Number(part))
    const current = api().value[0]
    if (current) {
      api().setTime({ hour, minute, second: 0 }, 0)
      return
    }
    // No date yet: anchor the time to the focused day (today by default).
    const base = toCalendarDateTime(api().focusedValue)
    api().setValue([base.set({ hour, minute, second: 0, millisecond: 0 })])
  }

  return (
    <div
      {...api().getRootProps()}
      data-slot="date-time-picker"
      class={cn('flex w-full flex-col gap-1', local.class)}
    >
      <div
        {...api().getControlProps()}
        data-slot="date-time-picker-control"
        class={cn(
          'flex w-full items-center transition-colors',
          fieldSizes[size()],
          popupFieldVariants[local.variant ?? 'outline'],
          'data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-gray-2 data-[disabled]:opacity-60',
          'focus-within:focus-ring-blue data-[invalid]:border-outline-red-6',
        )}
      >
        <input
          {...api().getInputProps()}
          data-slot="date-time-picker-input"
          aria-label={field?.hasLabel() ? undefined : bareName()}
          aria-describedby={field?.describedBy()}
          aria-errormessage={field?.hasError() ? field?.errorId() : undefined}
          class={cn(
            'h-full w-full min-w-0 bg-transparent px-2 text-inherit outline-none',
            'placeholder:text-ink-gray-6 disabled:cursor-not-allowed',
            local.readonly && 'cursor-pointer',
          )}
        />

        <Show when={local.clearable && api().value.length > 0}>
          <button
            {...api().getClearTriggerProps()}
            type="button"
            aria-label="Clear date and time"
            class={cn(navButton, 'shrink-0')}
          >
            <span class="lucide-x size-3.5" aria-hidden="true" />
          </button>
        </Show>

        <button
          {...api().getTriggerProps()}
          type="button"
          aria-label="Choose date and time"
          disabled={local.disabled}
          class={cn(navButton, 'me-0.5 shrink-0')}
        >
          <span class="lucide-calendar-clock size-4" aria-hidden="true" />
        </button>
      </div>

      <Show when={api().open}>
        <Portal>
          <div
            {...api().getPositionerProps()}
            data-slot="date-time-picker-positioner"
            class="z-50"
          >
            <div
              {...api().getContentProps()}
              data-slot="date-time-picker-content"
              class="w-fit rounded-6 border border-outline-gray-1 bg-surface-elevation-1 p-3 text-ink-gray-9 shadow-lg focus-visible:outline-none"
            >
              <CalendarView
                api={api()}
                cellClass={cellButton}
                navClass={navButton}
              />

              <div
                data-slot="date-time-picker-time"
                class="mt-2 border-t border-outline-gray-1 pt-2"
              >
                <div
                  data-slot="date-time-picker-time-list"
                  class="grid max-h-32 grid-cols-4 gap-1 overflow-y-auto"
                >
                  <For each={timeOptions()}>
                    {(option) => (
                      <button
                        type="button"
                        aria-pressed={selectedTime() === option.value}
                        data-selected={
                          selectedTime() === option.value ? '' : undefined
                        }
                        data-value={option.value}
                        data-slot="date-time-picker-time-option"
                        class={timeOption}
                        onClick={() => selectTime(option.value)}
                      >
                        {option.label}
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

/**
 * A date + time picker. The trigger is a text input plus a calendar button; the
 * popover renders Zag's day grid (month/year drill-down) with an inline,
 * interval-spaced time list below it. Built on Zag's `date-picker` machine with
 * `@internationalized/date`, so keyboard, ARIA and focus come from the
 * primitive; the time list reuses `TimePicker`'s option generator.
 *
 * The value is an ISO `YYYY-MM-DDTHH:mm` string (minute precision), or `null`
 * when empty. The shared labelling contract (P5) is inherited: with labelling
 * props, `Field` renders them and the machine's input id points at `Field`'s
 * label.
 */
export function DateTimePicker(props: DateTimePickerProps): JSX.Element {
  const [local] = splitProps(props, [
    'label',
    'description',
    'error',
    'required',
  ])
  return (
    <Field
      id={props.id}
      label={local.label}
      description={local.description}
      error={local.error}
      required={local.required}
      disabled={props.disabled}
    >
      <DateTimePickerControl {...props} />
    </Field>
  )
}

import { DateFormatter, type DateValue } from '@internationalized/date'
import * as zag from '@zag-js/date-picker'
import { type JSX, Show, splitProps } from 'solid-js'
import { fieldSizes, popupFieldVariants } from '../../lib/control-styles'
import {
  type DateRangeValue,
  toDate,
  toRangeArray,
  toRangeValue,
} from '../../lib/date-value'
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

type DateRangePickerApi = ReturnType<typeof zag.connect>

export type DateRangePickerSize = DatePickerSize
export type DateRangePickerVariant = DatePickerVariant
export type DateRangePickerSide = DatePickerSide
export type DateRangePickerAlign = DatePickerAlign
export type { DateRangeValue }

export interface DateRangePickerProps {
  /**
   * Selected range as a `[from, to]` tuple of `YYYY-MM-DD` strings, or `[]`
   * when empty. A half-open range (only the start picked) is not reported; the
   * machine keeps it until the end lands.
   */
  value?: DateRangeValue | null
  /** Uncontrolled initial value. */
  defaultValue?: DateRangeValue | null
  onValueChange?: (value: DateRangeValue) => void
  /** Earliest selectable date (`YYYY-MM-DD`). */
  min?: string
  /** Latest selectable date (`YYYY-MM-DD`). */
  max?: string
  /** BCP 47 locale for formatting/parsing. */
  locale?: string
  /** Display format for the inputs, as `Intl.DateTimeFormatOptions` (ADR-0008). */
  format?: Intl.DateTimeFormatOptions
  /** `id` of the rendered start input. */
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
  /** Allow typing in the inputs. Default `true`. */
  typeable?: boolean
  /** Keep the calendar open after a range is picked. Default `false`. */
  keepOpen?: boolean
  /** Render two months side by side. */
  dualPane?: boolean
  /** Popover edge. Default `'bottom'`. */
  side?: DateRangePickerSide
  /** Popover alignment along the edge. Default `'start'`. */
  align?: DateRangePickerAlign
  /** Gap between trigger and popover, in pixels. Default `4`. */
  offset?: number
  /** Shows a clear control when a range is selected. */
  clearable?: boolean
  /** @default sm */
  size?: DateRangePickerSize
  variant?: DateRangePickerVariant
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

const navButton =
  'grid size-7 place-items-center rounded-4 text-ink-gray-6 transition-colors hover:bg-surface-gray-3 hover:text-ink-gray-9 disabled:pointer-events-none'
const cellButton =
  'grid size-8 place-items-center rounded-3 text-base text-ink-gray-8 outline-none transition-colors hover:bg-surface-gray-3 data-[selected]:bg-surface-gray-10 data-[selected]:text-ink-base data-[in-range]:bg-surface-gray-3 data-[today]:font-medium data-[outside-range]:text-ink-gray-4 data-[disabled]:pointer-events-none data-[disabled]:text-ink-gray-3 data-[unavailable]:pointer-events-none data-[unavailable]:text-ink-gray-3 data-[unavailable]:line-through'

type ControlProps = Omit<
  DateRangePickerProps,
  'label' | 'description' | 'error' | 'required'
>

function DateRangePickerControl(props: ControlProps): JSX.Element {
  const [local] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'min',
    'max',
    'locale',
    'format',
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
    'dualPane',
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

  const machineId = createId('date-range-picker')
  const { api } = createZagApi<DateRangePickerApi>(
    zag.machine,
    zag.connect,
    () => ({
      id: machineId,
      locale: local.locale ?? 'en-US',
      selectionMode: 'range',
      numOfMonths: local.dualPane ? 2 : 1,
      value: toRangeArray(local.value),
      defaultValue: (() => {
        const initial = toRangeArray(local.defaultValue)
        return initial?.length ? initial : undefined
      })(),
      min: toDate(local.min),
      max: toDate(local.max),
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
      format: local.format
        ? (date: DateValue, details: { locale: string; timeZone: string }) =>
            new DateFormatter(details.locale, {
              ...local.format,
              timeZone: details.timeZone,
            }).format(date.toDate(details.timeZone))
        : undefined,
      ids: field
        ? {
            input: (index: number) =>
              index === 0 ? field.controlId() : `${field.controlId()}-end`,
            label: () => field.labelId(),
          }
        : local.id
          ? {
              input: (index: number) =>
                index === 0 ? (local.id as string) : `${local.id}-end`,
            }
          : undefined,
      positioning: { placement: `${side()}-${align()}`, gutter: offset() },
      onValueChange: (details: { value: DateValue[] }) => {
        // A half-open range (only the start picked) is internal: the machine
        // keeps it for the hover preview, but the public value only ever moves
        // to a complete `[from, to]` or to `[]` (frappe-ui's contract).
        const dates = details.value.filter(
          (date): date is DateValue => date != null,
        )
        if (dates.length === 1) return
        local.onValueChange?.(toRangeValue(dates))
      },
      onOpenChange: (details: { open: boolean }) =>
        local.onOpenChange?.(details.open),
    }),
  )

  const bareName = () =>
    props['aria-label'] ?? local.placeholder ?? 'Choose date range'

  const inputClass =
    'h-full w-full min-w-0 bg-transparent px-2 text-inherit outline-none placeholder:text-ink-gray-6 disabled:cursor-not-allowed'

  return (
    <div
      {...api().getRootProps()}
      data-slot="date-range-picker"
      class={cn('flex w-full flex-col gap-1', local.class)}
    >
      <div
        {...api().getControlProps()}
        data-slot="date-range-picker-control"
        data-invalid={field?.hasError() ? '' : undefined}
        class={cn(
          'flex w-full items-center transition-colors',
          fieldSizes[size()],
          popupFieldVariants[local.variant ?? 'outline'],
          'data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-gray-2 data-[disabled]:opacity-60',
          'focus-within:focus-ring-blue data-[invalid]:border-outline-red-6',
        )}
      >
        <input
          {...api().getInputProps({ index: 0 })}
          data-slot="date-range-picker-input"
          aria-label={field?.hasLabel() ? undefined : bareName()}
          aria-describedby={field?.describedBy()}
          aria-errormessage={field?.hasError() ? field?.errorId() : undefined}
          class={cn(inputClass, local.readonly && 'cursor-pointer')}
        />
        <span class="shrink-0 text-ink-gray-5" aria-hidden="true">
          –
        </span>
        <input
          {...api().getInputProps({ index: 1 })}
          data-slot="date-range-picker-input-end"
          aria-label={field ? 'End date' : `${bareName()} end`}
          aria-describedby={field?.describedBy()}
          aria-errormessage={field?.hasError() ? field?.errorId() : undefined}
          class={cn(inputClass, local.readonly && 'cursor-pointer')}
        />

        <Show when={local.clearable && api().value.length > 0}>
          <button
            {...api().getClearTriggerProps()}
            type="button"
            aria-label="Clear date range"
            class={cn(navButton, 'shrink-0')}
          >
            <span class="lucide-x size-3.5" aria-hidden="true" />
          </button>
        </Show>

        <button
          {...api().getTriggerProps()}
          type="button"
          aria-label="Choose date range"
          disabled={local.disabled}
          class={cn(navButton, 'me-0.5 shrink-0')}
        >
          <span class="lucide-calendar size-4" aria-hidden="true" />
        </button>
      </div>

      <Show when={api().open}>
        <Portal>
          <div
            {...api().getPositionerProps()}
            data-slot="date-range-picker-positioner"
            class="z-50"
          >
            <div
              {...api().getContentProps()}
              data-slot="date-range-picker-content"
              class="w-fit rounded-6 border border-outline-gray-1 bg-surface-elevation-1 p-3 text-ink-gray-9 shadow-lg focus-visible:outline-none"
            >
              <CalendarView
                api={api()}
                cellClass={cellButton}
                navClass={navButton}
                dualPane={local.dualPane}
              />
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

/**
 * A date-range picker. The trigger is a pair of date inputs (start/end) plus a
 * calendar button; the popover renders Zag's `range` day grid, optionally as
 * two months (`dualPane`), with month/year drill-down. Built on Zag's
 * `date-picker` machine with `@internationalized/date`, so keyboard, ARIA,
 * focus and the hover-range preview come from the primitive.
 *
 * The value is a `[from, to]` tuple of ISO `YYYY-MM-DD` strings, or `[]` when
 * empty. The shared labelling contract (P5) is inherited: with labelling props,
 * `Field` renders them and the machine's start input id points at `Field`'s
 * label.
 */
export function DateRangePicker(props: DateRangePickerProps): JSX.Element {
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
      <DateRangePickerControl {...props} />
    </Field>
  )
}

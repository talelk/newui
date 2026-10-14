import { DateFormatter, type DateValue } from '@internationalized/date'
import * as zag from '@zag-js/date-picker'
import { For, type JSX, Show, splitProps } from 'solid-js'
import { toDate, toValueArray } from '../../lib/date-value'
import { Field, useField } from '../../lib/field'
import { createId } from '../../lib/id'
import { Portal } from '../../lib/portal'
import { cn } from '../../lib/tv'
import { createZagApi } from '../../lib/zag'
import type { InputSize, InputVariant } from '../TextInput'

type DatePickerApi = ReturnType<typeof zag.connect>

export type DatePickerSize = InputSize
export type DatePickerVariant = InputVariant

/** Edge the popover attaches to (CONTEXT: `side`). */
export type DatePickerSide = 'top' | 'bottom' | 'left' | 'right'
/** Placement along the side (CONTEXT: `align`). */
export type DatePickerAlign = 'start' | 'center' | 'end'

export interface DatePickerProps {
  /** Selected date as `YYYY-MM-DD`; `null` when nothing is selected. */
  value?: string | null
  /** Uncontrolled initial value. */
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  /** Earliest selectable date (`YYYY-MM-DD`). */
  min?: string
  /** Latest selectable date (`YYYY-MM-DD`). */
  max?: string
  /** BCP 47 locale for formatting/parsing. */
  locale?: string
  /**
   * Display format for the input text, as `Intl.DateTimeFormatOptions`
   * (ADR-0008: the picker is internationalized, not dayjs). Typing still parses
   * through Zag's locale parser.
   */
  format?: Intl.DateTimeFormatOptions
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
  /** Allow typing in the input. Default `true`. */
  typeable?: boolean
  /** Keep the calendar open after a date is picked. Default `false`. */
  keepOpen?: boolean
  /** Popover edge. Default `'bottom'`. */
  side?: DatePickerSide
  /** Popover alignment along the edge. Default `'start'`. */
  align?: DatePickerAlign
  /** Gap between trigger and popover, in pixels. Default `4`. */
  offset?: number
  /** Shows a clear control when a date is selected. */
  clearable?: boolean
  size?: DatePickerSize
  variant?: DatePickerVariant
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

const SIZE: Record<DatePickerSize, string> = {
  xs: 'h-6 rounded-3 text-xs',
  sm: 'h-7 rounded-4 text-base',
  md: 'h-8 rounded-4 text-base',
  lg: 'h-10 rounded-5 text-lg',
}

const VARIANT: Record<DatePickerVariant, string> = {
  subtle:
    'border border-surface-gray-2 bg-surface-gray-2 hover:border-outline-gray-3 hover:bg-surface-gray-3 data-[state=open]:border-outline-gray-4 data-[state=open]:bg-surface-base data-[state=open]:shadow-sm',
  outline:
    'border border-outline-gray-2 bg-surface-base hover:border-outline-gray-3 data-[state=open]:border-outline-gray-4 data-[state=open]:shadow-sm',
  ghost: 'border-0 bg-transparent',
}

const navButton =
  'grid size-7 place-items-center rounded-4 text-ink-gray-6 transition-colors hover:bg-surface-gray-3 hover:text-ink-gray-9 disabled:pointer-events-none'
const cellButton =
  'grid size-8 place-items-center rounded-3 text-base text-ink-gray-8 outline-none transition-colors hover:bg-surface-gray-3 data-[selected]:bg-surface-gray-10 data-[selected]:text-ink-base data-[today]:font-medium data-[outside-range]:text-ink-gray-4 data-[disabled]:pointer-events-none data-[disabled]:text-ink-gray-3 data-[unavailable]:pointer-events-none data-[unavailable]:text-ink-gray-3 data-[unavailable]:line-through'

type ControlProps = Omit<
  DatePickerProps,
  'label' | 'description' | 'error' | 'required'
>

function DatePickerControl(props: ControlProps): JSX.Element {
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

  // `typeable` is the picker-level vocabulary for the inverse of HTML readonly;
  // the legacy `readonly` prop keeps working (P13).
  const readOnly = () => Boolean(local.readonly) || local.typeable === false

  const { api } = createZagApi<DatePickerApi>(zag.machine, zag.connect, () => ({
    id: createId('date-picker'),
    locale: local.locale ?? 'en-US',
    selectionMode: 'single',
    value: toValueArray(local.value),
    defaultValue: (() => {
      const date = toDate(local.defaultValue)
      return date ? [date] : undefined
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
      ? { input: () => field.controlId(), label: () => field.labelId() }
      : local.id
        ? { input: () => local.id as string }
        : undefined,
    positioning: { placement: `${side()}-${align()}`, gutter: offset() },
    onValueChange: (details: { value: DateValue[] }) =>
      local.onValueChange?.(details.value[0]?.toString() ?? null),
    onOpenChange: (details: { open: boolean }) =>
      local.onOpenChange?.(details.open),
  }))

  const bareName = () =>
    props['aria-label'] ?? local.placeholder ?? 'Choose date'

  return (
    <div
      {...api().getRootProps()}
      data-slot="date-picker"
      class={cn('flex w-full flex-col gap-1', local.class)}
    >
      <div
        {...api().getControlProps()}
        data-slot="date-picker-control"
        class={cn(
          'flex w-full items-center transition-colors',
          SIZE[size()],
          VARIANT[local.variant ?? 'subtle'],
          'data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-gray-2 data-[disabled]:opacity-60',
          'focus-within:focus-ring',
        )}
      >
        <input
          {...api().getInputProps()}
          data-slot="date-picker-input"
          aria-label={field ? undefined : bareName()}
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
            aria-label="Clear date"
            class={cn(navButton, 'shrink-0')}
          >
            <span class="lucide-x size-3.5" aria-hidden="true" />
          </button>
        </Show>

        <button
          {...api().getTriggerProps()}
          type="button"
          aria-label="Choose date"
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
            data-slot="date-picker-positioner"
            class="z-50"
          >
            <div
              {...api().getContentProps()}
              data-slot="date-picker-content"
              class="w-fit rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3 text-ink-gray-9 shadow-lg focus-visible:outline-none"
            >
              <Show when={api().view === 'day'}>
                <div
                  {...api().getViewControlProps({ view: 'day' })}
                  class="mb-2 flex items-center justify-between gap-2"
                >
                  <button
                    {...api().getPrevTriggerProps({ view: 'day' })}
                    aria-label="Previous month"
                    class={navButton}
                  >
                    <span
                      class="lucide-chevron-left size-4"
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    {...api().getViewTriggerProps({ view: 'day' })}
                    type="button"
                    class="rounded-3 px-2 py-0.5 text-base-medium text-ink-gray-9 transition-colors hover:bg-surface-gray-3"
                  >
                    {api().visibleRangeText.start}
                  </button>
                  <button
                    {...api().getNextTriggerProps({ view: 'day' })}
                    aria-label="Next month"
                    class={navButton}
                  >
                    <span
                      class="lucide-chevron-right size-4"
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <table {...api().getTableProps({ view: 'day' })}>
                  <thead {...api().getTableHeaderProps({ view: 'day' })}>
                    <tr {...api().getTableRowProps({ view: 'day' })}>
                      <For each={api().weekDays}>
                        {(day) => (
                          <th
                            scope="col"
                            aria-label={day.long}
                            class="size-8 text-xs font-normal text-ink-gray-5"
                          >
                            {day.narrow}
                          </th>
                        )}
                      </For>
                    </tr>
                  </thead>
                  <tbody {...api().getTableBodyProps({ view: 'day' })}>
                    <For each={api().weeks}>
                      {(week) => (
                        <tr {...api().getTableRowProps({ view: 'day' })}>
                          <For each={week}>
                            {(value) => (
                              <td
                                {...api().getDayTableCellProps({ value })}
                                class="p-0"
                              >
                                <button
                                  {...api().getDayTableCellTriggerProps({
                                    value,
                                  })}
                                  type="button"
                                  class={cellButton}
                                >
                                  {value.day}
                                </button>
                              </td>
                            )}
                          </For>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </Show>

              <Show when={api().view === 'month'}>
                <div
                  {...api().getViewControlProps({ view: 'month' })}
                  class="mb-2 flex items-center justify-between gap-2"
                >
                  <button
                    {...api().getPrevTriggerProps({ view: 'month' })}
                    aria-label="Previous year"
                    class={navButton}
                  >
                    <span
                      class="lucide-chevron-left size-4"
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    {...api().getViewTriggerProps({ view: 'month' })}
                    type="button"
                    class="rounded-3 px-2 py-0.5 text-base-medium text-ink-gray-9 transition-colors hover:bg-surface-gray-3"
                  >
                    {api().visibleRange.start.year}
                  </button>
                  <button
                    {...api().getNextTriggerProps({ view: 'month' })}
                    aria-label="Next year"
                    class={navButton}
                  >
                    <span
                      class="lucide-chevron-right size-4"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <table {...api().getTableProps({ view: 'month', columns: 4 })}>
                  <tbody>
                    <For
                      each={api().getMonthsGrid({
                        columns: 4,
                        format: 'short',
                      })}
                    >
                      {(months) => (
                        <tr {...api().getTableBodyProps({ view: 'month' })}>
                          <For each={months}>
                            {(month) => (
                              <td
                                {...api().getMonthTableCellProps({
                                  ...month,
                                  columns: 4,
                                })}
                                class="p-0"
                              >
                                <button
                                  {...api().getMonthTableCellTriggerProps({
                                    ...month,
                                    columns: 4,
                                  })}
                                  type="button"
                                  class={cellButton}
                                >
                                  {month.label}
                                </button>
                              </td>
                            )}
                          </For>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </Show>

              <Show when={api().view === 'year'}>
                <div
                  {...api().getViewControlProps({ view: 'year' })}
                  class="mb-2 flex items-center justify-between gap-2"
                >
                  <button
                    {...api().getPrevTriggerProps({ view: 'year' })}
                    aria-label="Previous decade"
                    class={navButton}
                  >
                    <span
                      class="lucide-chevron-left size-4"
                      aria-hidden="true"
                    />
                  </button>
                  <span class="px-2 text-base-medium text-ink-gray-9">
                    {api().getDecade().start} – {api().getDecade().end}
                  </span>
                  <button
                    {...api().getNextTriggerProps({ view: 'year' })}
                    aria-label="Next decade"
                    class={navButton}
                  >
                    <span
                      class="lucide-chevron-right size-4"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <table {...api().getTableProps({ view: 'year', columns: 4 })}>
                  <tbody>
                    <For each={api().getYearsGrid({ columns: 4 })}>
                      {(years) => (
                        <tr {...api().getTableBodyProps({ view: 'year' })}>
                          <For each={years}>
                            {(year) => (
                              <td
                                {...api().getYearTableCellProps({
                                  ...year,
                                  columns: 4,
                                })}
                                class="p-0"
                              >
                                <button
                                  {...api().getYearTableCellTriggerProps({
                                    ...year,
                                    columns: 4,
                                  })}
                                  type="button"
                                  class={cellButton}
                                >
                                  {year.label}
                                </button>
                              </td>
                            )}
                          </For>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </Show>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

/**
 * A single-date picker. The trigger is a date input plus a calendar button; the
 * popover renders a Zag day grid with month/year drill-down (`getViewTriggerProps`
 * cycles day → month → year). Built on Zag's `date-picker` machine with
 * `@internationalized/date`, so keyboard, ARIA and focus come from the primitive.
 *
 * The shared labelling contract (P5) is inherited: with labelling props, `Field`
 * renders them and the machine's input id points at `Field`'s label.
 */
export function DatePicker(props: DatePickerProps): JSX.Element {
  const [local] = splitProps(props, [
    'label',
    'description',
    'error',
    'required',
  ])
  const hasLabeling = () =>
    Boolean(local.label || local.description || local.error || local.required)

  return (
    <Show when={hasLabeling()} fallback={<DatePickerControl {...props} />}>
      <Field
        id={props.id}
        label={local.label}
        description={local.description}
        error={local.error}
        required={local.required}
        disabled={props.disabled}
      >
        <DatePickerControl {...props} />
      </Field>
    </Show>
  )
}

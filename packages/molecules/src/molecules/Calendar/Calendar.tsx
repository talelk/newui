import {
  cn,
  createId,
  createZagApi,
  toDate,
  toValueArray,
} from '@talelk/newui-atoms/internal'
import * as zag from '@zag-js/date-picker'
import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'
import { CalendarView } from '../DatePicker/CalendarView'

type CalendarApi = ReturnType<typeof zag.connect>

export interface CalendarProps {
  /** Controlled selected date as a `YYYY-MM-DD` string (ADR-0008). */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Minimum selectable date, `YYYY-MM-DD`. */
  min?: string
  /** Maximum selectable date, `YYYY-MM-DD`. */
  max?: string
  /** @default en-US */
  locale?: string
  /** Render two months side by side. */
  dualPane?: boolean
  disabled?: boolean
  /** Accessible name for the grid when there is no visible label. */
  'aria-label'?: string
  class?: string
}

const navButton =
  'grid size-7 place-items-center rounded-4 text-ink-gray-6 transition-colors hover:bg-surface-gray-3 hover:text-ink-gray-9 disabled:pointer-events-none'
const cellButton =
  'grid size-8 place-items-center rounded-3 text-base text-ink-gray-8 outline-none transition-colors hover:bg-surface-gray-3 data-[selected]:bg-surface-gray-10 data-[selected]:text-ink-base data-[today]:font-medium data-[outside-range]:text-ink-gray-4 data-[disabled]:pointer-events-none data-[disabled]:text-ink-gray-3 data-[unavailable]:pointer-events-none data-[unavailable]:text-ink-gray-3 data-[unavailable]:line-through'

/**
 * The date grid on its own — no input, no popup, no trigger. The same day,
 * month and year drill-down the pickers use, mounted inline for surfaces that
 * *are* a date: a booking panel, a filter rail, a dashboard's scope picker.
 * The Zag date-picker machine still owns the keyboard and ARIA; it runs
 * permanently open. Values are `YYYY-MM-DD` strings per ADR-0008.
 */
export function Calendar(props: CalendarProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'min',
    'max',
    'locale',
    'dualPane',
    'disabled',
    'aria-label',
    'class',
  ])

  const machineId = createId('calendar')
  const { api } = createZagApi<CalendarApi>(zag.machine, zag.connect, () => ({
    id: machineId,
    locale: local.locale ?? 'en-US',
    selectionMode: 'single',
    numOfMonths: local.dualPane ? 2 : 1,
    value: toValueArray(local.value),
    defaultValue: toValueArray(local.defaultValue),
    min: toDate(local.min),
    max: toDate(local.max),
    disabled: local.disabled,
    open: true,
    openOnClick: false,
    closeOnSelect: false,
    'aria-label': local['aria-label'],
    onValueChange: (details: { value: zag.DateValue[] }) =>
      local.onValueChange?.(details.value[0]?.toString() ?? ''),
  }))

  return (
    <div
      {...rest}
      {...api().getContentProps()}
      data-slot="calendar"
      data-disabled={local.disabled ? '' : undefined}
      class={cn(
        // `w-max` keeps the grid's natural width; `max-w-full` with
        // `overflow-x-auto` turns the frame into its own scroll container, so
        // even a dual-pane grid narrows to its context instead of pushing the
        // page wide.
        'inline-flex w-max max-w-full flex-col overflow-x-auto rounded-card border border-outline-gray-1 bg-surface-base p-3',
        local.class,
      )}
    >
      <CalendarView
        api={api()}
        cellClass={cellButton}
        navClass={navButton}
        dualPane={local.dualPane}
      />
    </div>
  )
}

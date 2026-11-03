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
import { card } from '../Card'
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

// Cell/nav looks are the shared date-family constants in ../DatePicker/CalendarView.

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
        // The frame is the shared Card surface (one elevation/border/radius
        // recipe for every framed molecule), sized to the grid: `w-max`
        // keeps its natural width; `max-w-full` with `overflow-x-auto` turns
        // the frame into its own scroll container, so even a dual-pane grid
        // narrows to its context instead of pushing the page wide.
        card({ elevation: 'none', padding: 'none' }),
        'inline-flex w-max max-w-full overflow-x-auto p-3',
        local.class,
      )}
    >
      <CalendarView api={api()} dualPane={local.dualPane} />
    </div>
  )
}

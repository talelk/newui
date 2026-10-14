import type { DateValue } from '@internationalized/date'
import type * as zag from '@zag-js/date-picker'
import { For, Index, type JSX, Show } from 'solid-js'

type DatePickerApi = ReturnType<typeof zag.connect>

export interface CalendarViewProps {
  /** The connected Zag `date-picker` api; reads stay reactive through the prop. */
  api: DatePickerApi
  /** Classes for the day/month/year cell buttons. */
  cellClass: string
  /** Classes for the prev/next/view-trigger buttons. */
  navClass: string
  /** Render two months side by side in the day view. */
  dualPane?: boolean
}

/**
 * The shared day/month/year grid of the date family (`DateRangePicker`,
 * `DateTimePicker`). It is a thin renderer over a Zag `date-picker` api: the
 * machine owns keyboard, ARIA and range/hover state, this owns only markup.
 *
 * `DatePicker` predates this module and keeps its own inline grid (its public
 * surface is frozen); the two newer pickers share this one so the day/month/year
 * drill-down is written once.
 */
export function CalendarView(props: CalendarViewProps): JSX.Element {
  function MonthGrid(gridProps: {
    weeks: DateValue[][]
    visibleRange: { start: DateValue; end: DateValue }
    pane: string
  }): JSX.Element {
    return (
      <table {...props.api.getTableProps({ view: 'day', id: gridProps.pane })}>
        <thead {...props.api.getTableHeaderProps({ view: 'day' })}>
          <tr {...props.api.getTableRowProps({ view: 'day' })}>
            <Index each={props.api.weekDays}>
              {(day) => (
                <th
                  scope="col"
                  aria-label={day().long}
                  class="size-8 text-xs font-normal text-ink-gray-5"
                >
                  {day().narrow}
                </th>
              )}
            </Index>
          </tr>
        </thead>
        <tbody {...props.api.getTableBodyProps({ view: 'day' })}>
          {/*
            `Index`, not `For`: the range machine re-renders on every pointer
            move (the hover preview), and `For` keys by item identity — the
            `DateValue`s are fresh objects each render, so it would recreate the
            day buttons mid-gesture and swallow the click. `Index` reuses the
            nodes and only updates their attributes.
          */}
          <Index each={gridProps.weeks}>
            {(week) => (
              <tr {...props.api.getTableRowProps({ view: 'day' })}>
                <Index each={week()}>
                  {(value) => (
                    <td
                      {...props.api.getDayTableCellProps({
                        value: value(),
                        visibleRange: gridProps.visibleRange,
                      })}
                      class="p-0"
                    >
                      <button
                        {...props.api.getDayTableCellTriggerProps({
                          value: value(),
                          visibleRange: gridProps.visibleRange,
                        })}
                        type="button"
                        class={props.cellClass}
                      >
                        {value().day}
                      </button>
                    </td>
                  )}
                </Index>
              </tr>
            )}
          </Index>
        </tbody>
      </table>
    )
  }

  return (
    <>
      <Show when={props.api.view === 'day'}>
        <div
          {...props.api.getViewControlProps({ view: 'day' })}
          class="mb-2 flex items-center justify-between gap-2"
        >
          <button
            {...props.api.getPrevTriggerProps({ view: 'day' })}
            aria-label="Previous month"
            class={props.navClass}
          >
            <span class="lucide-chevron-left size-4" aria-hidden="true" />
          </button>
          <button
            {...props.api.getViewTriggerProps({ view: 'day' })}
            type="button"
            class="rounded-3 px-2 py-0.5 text-base-medium text-ink-gray-9 transition-colors hover:bg-surface-gray-3"
          >
            {props.dualPane
              ? props.api.visibleRangeText.formatted
              : props.api.visibleRangeText.start}
          </button>
          <button
            {...props.api.getNextTriggerProps({ view: 'day' })}
            aria-label="Next month"
            class={props.navClass}
          >
            <span class="lucide-chevron-right size-4" aria-hidden="true" />
          </button>
        </div>

        <div class="flex gap-4">
          <MonthGrid
            weeks={props.api.weeks}
            visibleRange={props.api.visibleRange}
            pane="left"
          />
          <Show when={props.dualPane}>
            <MonthGrid
              weeks={props.api.getOffset({ months: 1 }).weeks}
              visibleRange={props.api.getOffset({ months: 1 }).visibleRange}
              pane="right"
            />
          </Show>
        </div>
      </Show>

      <Show when={props.api.view === 'month'}>
        <div
          {...props.api.getViewControlProps({ view: 'month' })}
          class="mb-2 flex items-center justify-between gap-2"
        >
          <button
            {...props.api.getPrevTriggerProps({ view: 'month' })}
            aria-label="Previous year"
            class={props.navClass}
          >
            <span class="lucide-chevron-left size-4" aria-hidden="true" />
          </button>
          <button
            {...props.api.getViewTriggerProps({ view: 'month' })}
            type="button"
            class="rounded-3 px-2 py-0.5 text-base-medium text-ink-gray-9 transition-colors hover:bg-surface-gray-3"
          >
            {props.api.visibleRange.start.year}
          </button>
          <button
            {...props.api.getNextTriggerProps({ view: 'month' })}
            aria-label="Next year"
            class={props.navClass}
          >
            <span class="lucide-chevron-right size-4" aria-hidden="true" />
          </button>
        </div>
        <table {...props.api.getTableProps({ view: 'month', columns: 4 })}>
          <tbody>
            <For
              each={props.api.getMonthsGrid({ columns: 4, format: 'short' })}
            >
              {(months) => (
                <tr {...props.api.getTableBodyProps({ view: 'month' })}>
                  <For each={months}>
                    {(month) => (
                      <td
                        {...props.api.getMonthTableCellProps({
                          ...month,
                          columns: 4,
                        })}
                        class="p-0"
                      >
                        <button
                          {...props.api.getMonthTableCellTriggerProps({
                            ...month,
                            columns: 4,
                          })}
                          type="button"
                          class={props.cellClass}
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

      <Show when={props.api.view === 'year'}>
        <div
          {...props.api.getViewControlProps({ view: 'year' })}
          class="mb-2 flex items-center justify-between gap-2"
        >
          <button
            {...props.api.getPrevTriggerProps({ view: 'year' })}
            aria-label="Previous decade"
            class={props.navClass}
          >
            <span class="lucide-chevron-left size-4" aria-hidden="true" />
          </button>
          <span class="px-2 text-base-medium text-ink-gray-9">
            {props.api.getDecade().start} – {props.api.getDecade().end}
          </span>
          <button
            {...props.api.getNextTriggerProps({ view: 'year' })}
            aria-label="Next decade"
            class={props.navClass}
          >
            <span class="lucide-chevron-right size-4" aria-hidden="true" />
          </button>
        </div>
        <table {...props.api.getTableProps({ view: 'year', columns: 4 })}>
          <tbody>
            <For each={props.api.getYearsGrid({ columns: 4 })}>
              {(years) => (
                <tr {...props.api.getTableBodyProps({ view: 'year' })}>
                  <For each={years}>
                    {(year) => (
                      <td
                        {...props.api.getYearTableCellProps({
                          ...year,
                          columns: 4,
                        })}
                        class="p-0"
                      >
                        <button
                          {...props.api.getYearTableCellTriggerProps({
                            ...year,
                            columns: 4,
                          })}
                          type="button"
                          class={props.cellClass}
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
    </>
  )
}

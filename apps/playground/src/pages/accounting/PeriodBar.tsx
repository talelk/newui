import { Button } from '@talelk/newui-atoms'
import {
  DateRangePicker,
  type DateRangeValue,
  Select,
  TabButtons,
} from '@talelk/newui-molecules'
import { type JSX, Show } from 'solid-js'

export type PeriodGrain = 'Monthly' | 'Quarterly'

const DEFAULT_RANGE: DateRangeValue = ['2026-04-01', '2026-09-30']

/**
 * The accounting period controls as one flat toolbar.
 *
 * The generic FilterBar is built around a search field leading a card; this
 * page has no search on four of its five tabs, so the card left a third of its
 * width empty and pushed the quick ranges into the middle. This row puts the
 * period shortcuts at the content edge, keeps the exact range compact, and
 * shows Reset only when the period differs from the default.
 */
export function PeriodBar(props: {
  range: DateRangeValue
  onRangeChange: (value: DateRangeValue) => void
  grain: PeriodGrain
  onGrainChange: (value: PeriodGrain) => void
  showGrain: boolean
  canReset: boolean
  onReset: () => void
}): JSX.Element {
  const quickValue = () => {
    const [start, end] = props.range
    if (start === '2026-09-01' && end === '2026-09-30') return 'month'
    if (start === '2026-07-01' && end === '2026-09-30') return 'quarter'
    if (start === DEFAULT_RANGE[0] && end === DEFAULT_RANGE[1]) return 'six'
    return ''
  }
  const setQuick = (value: string) => {
    props.onRangeChange(
      value === 'month'
        ? ['2026-09-01', '2026-09-30']
        : value === 'quarter'
          ? ['2026-07-01', '2026-09-30']
          : DEFAULT_RANGE,
    )
  }
  return (
    <div class="flex flex-col gap-2 rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-1 sm:flex-row sm:items-center">
      <TabButtons
        label="Reporting period shortcuts"
        variant="ghost"
        value={quickValue()}
        onValueChange={setQuick}
        options={[
          { label: 'September', value: 'month' },
          { label: 'Q3 2026', value: 'quarter' },
          { label: 'Last six months', value: 'six' },
        ]}
      />
      <div class="flex flex-wrap items-center gap-2 sm:ms-auto">
        <Show when={props.showGrain}>
          <div class="w-36 max-w-full">
            <Select
              aria-label="Aggregate"
              size="sm"
              variant="subtle"
              class="w-full"
              value={props.grain}
              options={[
                { label: 'Monthly', value: 'Monthly' },
                { label: 'Quarterly', value: 'Quarterly' },
              ]}
              onValueChange={(value) =>
                props.onGrainChange(
                  value === 'Quarterly' ? 'Quarterly' : 'Monthly',
                )
              }
            />
          </div>
        </Show>
        <DateRangePicker
          aria-label="Reporting period"
          value={props.range}
          onValueChange={props.onRangeChange}
          format={{ month: 'short', day: 'numeric', year: 'numeric' }}
          class="w-full sm:w-[19rem]"
        />
        <Show when={props.canReset}>
          <Button variant="ghost" size="sm" onClick={props.onReset}>
            Reset
          </Button>
        </Show>
      </div>
    </div>
  )
}

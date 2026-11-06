import { Button } from '@talelk/newui-atoms'
import { type Accessor, createMemo, createSignal, type JSX } from 'solid-js'

/**
 * The chart demos' shared state toggles (H13, spec/history/examples-refresh.md §1).
 *
 * Eight demos repeated the same body: three signals, three toggle buttons,
 * then a chart fed `empty ? [] : data`, `loading` and an error string.
 * Only the chart and its rows differ, so the chart arrives as a child
 * function and receives an accessor for the resolved state — an accessor,
 * not a snapshot, so toggling updates the mounted chart in place. This module imports `Button`
 * only — never a chart — or every per-file demo chunk would drag all of
 * `@talelk/newui-charts` behind it.
 */

/** The monthly series the cartesian demos share. */
export const MONTHLY_ACTIVITY = [
  { month: 'Jan', value: 12 },
  { month: 'Feb', value: 18 },
  { month: 'Mar', value: 15 },
]

/**
 * A longer monthly series for the interaction demos: a zoom window or a
 * brush range needs more than three points to mean anything.
 */
export const MONTHLY_TREND = [
  { month: 'Jan', value: 12 },
  { month: 'Feb', value: 18 },
  { month: 'Mar', value: 15 },
  { month: 'Apr', value: 22 },
  { month: 'May', value: 28 },
  { month: 'Jun', value: 24 },
  { month: 'Jul', value: 31 },
  { month: 'Aug', value: 36 },
  { month: 'Sep', value: 30 },
  { month: 'Oct', value: 34 },
  { month: 'Nov', value: 41 },
  { month: 'Dec', value: 46 },
]

/** The stage series the donut and funnel demos share. */
export const STAGE_ACTIVITY = [
  { name: 'Visits', value: 100 },
  { name: 'Trials', value: 60 },
  { name: 'Paid', value: 24 },
]

export interface ChartDemoState<T> {
  data: T[]
  loading: boolean
  error?: string
}

export function ChartDemoControls<T>(props: {
  data: T[]
  children: (state: Accessor<ChartDemoState<T>>) => JSX.Element
}): JSX.Element {
  const [loading, setLoading] = createSignal(false)
  const [empty, setEmpty] = createSignal(false)
  const [error, setError] = createSignal(false)
  const state = createMemo<ChartDemoState<T>>(() => ({
    data: empty() ? [] : props.data,
    loading: loading(),
    error: error() ? 'Could not load activity.' : undefined,
  }))
  return (
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap gap-2">
        <Button aria-pressed={empty()} onClick={() => setEmpty(!empty())}>
          Toggle empty
        </Button>
        <Button aria-pressed={loading()} onClick={() => setLoading(!loading())}>
          Toggle loading
        </Button>
        <Button aria-pressed={error()} onClick={() => setError(!error())}>
          Toggle error
        </Button>
      </div>
      {props.children(state)}
    </div>
  )
}

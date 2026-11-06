import { toDate, toNumber } from './format'
import type { ResolvedXAxis } from './options'
import type { ChartBrushSelection, ChartZoomWindow } from './types'

/**
 * The pure half of the chart interactions: what an echarts payload means in
 * this library's vocabulary, and what option the current signal implies.
 *
 * Everything here trades in data values — a category label, a date, a number —
 * never echarts indices or percents. The wrapper boundary (`axisInteractions`)
 * translates at the edges; nothing above this file sees an echarts internal.
 */

/** The x column as the plot draws it, plus the axis it sits on. */
export type AxisValues = {
  /** x values in draw order — the row order `plotRows` settled on. */
  values: unknown[]
  /** What the axis actually is, config and data taken together. */
  type: ResolvedXAxis['type']
}

/** The sort position of a value on this axis, or `null` when unreadable. */
function position(value: unknown, type: ResolvedXAxis['type']): number | null {
  if (type === 'time') return toDate(value)?.getTime() ?? null
  if (type === 'value') return toNumber(value)
  return null
}

/** The index of a data value in the x column, or the nearest one after it. */
export function valueIndex(
  values: unknown[],
  value: unknown,
  type: ResolvedXAxis['type'],
): number {
  const target = String(value)
  const exact = values.findIndex((candidate) => String(candidate) === target)
  if (exact !== -1) return exact

  const at = position(value, type)
  if (at === null) return type === 'category' ? 0 : -1
  for (let index = 0; index < values.length; index += 1) {
    const candidate = position(values[index], type)
    if (candidate !== null && candidate >= at) return index
  }
  return values.length - 1
}

/** The value at an index, clamped into the column. */
function valueAt(values: unknown[], index: number): number | string {
  const clamped = Math.max(0, Math.min(index, values.length - 1))
  return (values[clamped] as number | string) ?? ''
}

/**
 * The dataZoom component the current window implies. The builder re-emits it
 * from the signal on every option build, so a `notMerge` rebuild restores the
 * window instead of silently resetting it — the one rule every controlled
 * interaction on this lifecycle obeys.
 */
export function buildZoomOption(
  axis: AxisValues,
  window: ChartZoomWindow | undefined,
): Record<string, unknown> {
  const slider = {
    type: 'slider',
    xAxisIndex: 0,
    // Out-of-window rows leave the plot rather than drawing as gaps.
    filterMode: 'filter',
    // A value window does not drift when the data grows; a percent one does.
    rangeMode: ['value', 'value'],
    bottom: 0,
    height: 16,
    fillerColor: 'rgba(128, 128, 160, 0.12)',
    borderColor: 'transparent',
    handleStyle: { color: '#888' },
    moveHandleStyle: { color: '#888' },
    textStyle: { fontSize: 10 },
  }
  if (!window) {
    return { dataZoom: [{ ...slider, start: 0, end: 100 }] }
  }
  return { dataZoom: [{ ...slider, ...windowCoords(window, axis) }] }
}

/**
 * What a `datazoom` payload says about the window. The payload carries
 * percents and — when echarts resolved them — start/end values, which for a
 * category axis are indices. Both spellings land on data values here.
 */
export function zoomFromEvent(
  payload: unknown,
  axis: AxisValues,
): ChartZoomWindow | undefined {
  const batch = (payload as { batch?: unknown[] })?.batch
  const event = (Array.isArray(batch) ? batch[0] : payload) as
    | { start?: number; end?: number; startValue?: number; endValue?: number }
    | undefined
  if (!event || typeof event !== 'object') return undefined

  const { values, type } = axis
  if (!values.length) return undefined

  const percentIndex = (percent: number) =>
    Math.round((percent / 100) * (values.length - 1))

  let from: number | string
  let to: number | string
  if (
    typeof event.startValue === 'number' &&
    typeof event.endValue === 'number'
  ) {
    if (type === 'category') {
      from = valueAt(values, event.startValue)
      to = valueAt(values, event.endValue)
    } else {
      from = event.startValue
      to = event.endValue
    }
  } else if (typeof event.start === 'number' && typeof event.end === 'number') {
    from = valueAt(values, percentIndex(event.start))
    to = valueAt(values, percentIndex(event.end))
  } else {
    return undefined
  }
  return { from, to }
}

/** The brush component the current selection implies, areas and all. */
export function buildBrushOption(
  axis: AxisValues,
  selection: ChartBrushSelection | null,
): Record<string, unknown> {
  const areas = selection ? [brushCoords(selection, axis)] : []
  return {
    brush: [
      {
        xAxisIndex: 0,
        brushType: 'lineX',
        brushMode: 'single',
        transformable: true,
        throttleType: 'debounce',
        throttleDelay: 100,
        // Everything outside the selection dims; inside keeps its colour.
        outOfBrush: { colorAlpha: 0.3 },
        brushStyle: {
          color: 'rgba(128, 128, 160, 0.15)',
          borderColor: 'rgba(128, 128, 160, 0.5)',
          borderWidth: 1,
        },
        areas,
      },
    ],
  }
}

/**
 * What a `brushSelected` payload selected: the raw data indices of every
 * series, collapsed to the x values they span. No indices, no areas, no
 * echarts internals — the public payload is the range.
 */
export function brushFromEvent(
  payload: unknown,
  axis: AxisValues,
): ChartBrushSelection | null {
  const batch = (
    payload as { batch?: { selected?: { dataIndex?: number[] }[] } }
  )?.batch
  const entries = Array.isArray(batch) ? batch : []
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (const area of entries) {
    for (const series of area.selected ?? []) {
      for (const index of series.dataIndex ?? []) {
        if (index < min) min = index
        if (index > max) max = index
      }
    }
  }
  if (!Number.isFinite(min) || !axis.values.length) return null
  return { from: valueAt(axis.values, min), to: valueAt(axis.values, max) }
}

/** The window as echarts addresses it: indices for categories, values else. */
export function windowCoords(
  window: ChartZoomWindow,
  axis: AxisValues,
): { startValue: number; endValue: number } {
  return {
    startValue:
      axis.type === 'category'
        ? valueIndex(axis.values, window.from, axis.type)
        : (position(window.from, axis.type) ?? 0),
    endValue:
      axis.type === 'category'
        ? valueIndex(axis.values, window.to, axis.type)
        : (position(window.to, axis.type) ?? 0),
  }
}

/** The selection as brush areas, for `dispatchAction({ type: 'brush' })`. */
export function brushCoords(
  selection: ChartBrushSelection,
  axis: AxisValues,
): {
  brushType: 'lineX'
  xAxisIndex: number
  coordRange: [number, number]
} {
  const coords = windowCoords(selection, axis)
  return {
    brushType: 'lineX',
    // The area must name its coordinate system, or echarts treats it as a
    // global brush and asserts on a missing pixel range.
    xAxisIndex: 0,
    coordRange: [coords.startValue, coords.endValue],
  }
}

/** How far one keyboard step moves, as a share of the visible window. */
const KEYBOARD_STEP = 0.25

/**
 * The window one keyboard command produces. `in`/`out` shrink or grow the
 * window around its middle; `left`/`right` slide it. Indices make this work
 * for every axis type; the result is read back as data values.
 */
export function zoomStep(
  window: ChartZoomWindow | undefined,
  axis: AxisValues,
  action: 'in' | 'out' | 'left' | 'right',
): ChartZoomWindow {
  const { values } = axis
  if (!values.length) return { from: '', to: '' }
  const max = values.length - 1
  const current = window ?? {
    from: valueAt(values, 0),
    to: valueAt(values, max),
  }
  const start = valueIndex(values, current.from, axis.type)
  const end = valueIndex(values, current.to, axis.type)
  let first = Math.min(start, end)
  let last = Math.max(start, end)
  const span = last - first
  const step = Math.max(1, Math.round(span * KEYBOARD_STEP))

  if (action === 'in') {
    // Two points is the floor: there is nothing left to take out.
    if (span <= 1)
      return { from: valueAt(values, first), to: valueAt(values, last) }
    first += step
    last -= step
    if (last - first < 1) {
      const middle = Math.round((first + last) / 2)
      first = middle
      last = middle + 1
    }
  } else if (action === 'out') {
    first -= step
    last += step
  } else {
    const shift = action === 'left' ? -step : step
    first += shift
    last += shift
  }

  // Clamp inside the column. A slide keeps its span at the edge — pinned at
  // an edge it simply does not move — while zoom just clips.
  if (action === 'left' || action === 'right') {
    if (first < 0) {
      last -= first
      first = 0
    }
    if (last > max) {
      first -= last - max
      last = max
    }
    first = Math.max(0, first)
    last = Math.min(max, last)
  } else {
    first = Math.max(0, first)
    last = Math.min(max, last)
  }
  return { from: valueAt(values, first), to: valueAt(values, last) }
}

/** The rows inside a window — the fallback table tracks the current one. */
export function windowedRows(
  rows: Record<string, unknown>[],
  xKey: string,
  window: ChartZoomWindow | undefined,
  axis: AxisValues,
): Record<string, unknown>[] {
  if (!window) return rows
  const fromIndex = valueIndex(axis.values, window.from, axis.type)
  const toIndex = valueIndex(axis.values, window.to, axis.type)
  const first = Math.min(fromIndex, toIndex)
  const last = Math.max(fromIndex, toIndex)
  return rows.filter((row) => {
    const index = valueIndex(axis.values, row[xKey], axis.type)
    return index >= first && index <= last
  })
}

/** What the windowed table says about itself, e.g. `Showing Jan – Mar of 12`. */
export function windowCaption(
  window: ChartZoomWindow | undefined,
  total: number,
): string | undefined {
  if (!window) return undefined
  return `Showing ${String(window.from)} \u2013 ${String(window.to)} of ${total} points`
}

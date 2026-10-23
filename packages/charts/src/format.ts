import type { TimeGrain } from './types'

/** A number, or `null` for anything that does not read as one. */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

/** `total_sales` -> `Total Sales`. Used for series names and axis titles. */
export function formatLabel(name: string): string {
  if (!name) return ''
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Keeps whole numbers whole instead of forcing a `.00` on every tick. */
function guessPrecision(value: number): number {
  if (!value || Number.isNaN(value)) return 0
  const str = value.toString()
  const decimalIndex = str.indexOf('.')
  if (decimalIndex === -1) return 0
  return Math.min(str.length - decimalIndex - 1, 2)
}

/**
 * A fixed locale, so a number groups and compresses the same on the server and
 * in the browser. A locale-dependent axis label would differ between the two
 * and reflow a chart on hydration; the caller can still format through `format`.
 */
const NUMBER_LOCALE = 'en-US'

/**
 * A number as it prints: grouped, with `precision` decimals, or compressed to a
 * short form (`1.5K`, `2.4M`) when `shorten` is set.
 */
export function formatValue(
  value: number,
  precision?: number,
  shorten = false,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return ''

  if (shorten) {
    return new Intl.NumberFormat(NUMBER_LOCALE, {
      notation: 'compact',
      maximumFractionDigits: precision ?? 1,
    }).format(value)
  }

  const digits = precision ?? guessPrecision(value)
  return new Intl.NumberFormat(NUMBER_LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

/** `0.4` -> `<1%`: a rounded `0%` on a slice that is visibly there reads as a bug. */
export function formatPercent(percent: number): string {
  if (!percent) return '0%'
  if (percent < 1) return '<1%'
  return `${Math.round(percent)}%`
}

const ISO_DATE = /^\d{4}-\d{2}(-\d{2})?([T ]\d{2}:\d{2}(:\d{2})?)?/

/**
 * A `Date`, or a string that is unambiguously one (`2024-03-01`, with an
 * optional time). Loose parsing is deliberately out: a category column full of
 * `"12"` would otherwise silently land on a time axis.
 */
export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** True when every value present in the column is a date, and at least one is. */
export function isTemporal(values: unknown[]): boolean {
  const present = values.filter(
    (v) => v !== null && v !== undefined && v !== '',
  )
  return present.length > 0 && present.every((v) => toDate(v) !== null)
}

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** Spacing under which a series is read as being of that grain. */
const GRAIN_BY_SPACING: [number, TimeGrain][] = [
  [MINUTE, 'second'],
  [HOUR, 'minute'],
  [DAY, 'hour'],
  [7 * DAY, 'day'],
  [28 * DAY, 'week'],
  [90 * DAY, 'month'],
  [365 * DAY, 'quarter'],
]

/**
 * The grain a series of timestamps is sampled at, from the median gap between
 * them — the median so one missing month does not coarsen the whole axis.
 */
export function inferTimeGrain(values: unknown[]): TimeGrain {
  const times = values
    .map(toDate)
    .filter((d): d is Date => d !== null)
    .map((d) => d.getTime())
    .sort((a, b) => a - b)
  if (times.length < 2) return 'day'

  const gaps = times.slice(1).map((time, i) => time - (times[i] ?? time))
  gaps.sort((a, b) => a - b)
  const median = gaps[Math.floor(gaps.length / 2)] ?? 0

  const match = GRAIN_BY_SPACING.find(([limit]) => median < limit)
  return match ? match[1] : 'year'
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * One tick of a time axis, named by the coarsest unit it lands on. A monthly
 * series reads "Mar", and the tick that opens a year names the year instead so
 * "Jan 2023, Apr 2023" does not repeat the year as noise.
 *
 * Deterministic and locale-free: an axis label is layout, and it should not
 * change width with the reader's locale.
 */
export function formatTimeAxisLabel(
  value: unknown,
  grain: TimeGrain = 'day',
  level = 0,
): string {
  const date =
    value instanceof Date
      ? value
      : typeof value === 'number'
        ? new Date(value)
        : toDate(value)
  if (!date || Number.isNaN(date.getTime())) return ''

  const month = MONTHS[date.getMonth()] ?? ''
  if (grain === 'year' || level > 0 || date.getMonth() === 0) {
    return String(date.getFullYear())
  }
  if (grain === 'quarter') return `${month} ${date.getFullYear()}`
  return month
}

/** How a value of the x column reads; values arrive raw from the row. */
export function formatAxisValue(
  value: unknown,
  type: 'category' | 'time' | 'value',
  grain?: TimeGrain,
): string {
  if (type === 'time') return formatTimeAxisLabel(value, grain)
  if (type === 'value') return formatValue(Number(value))
  return value === null || value === undefined ? '' : String(value)
}

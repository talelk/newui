/**
 * Pure transforms over rows the app already fetched.
 *
 * `aggregate` groups rows with the same eleven metric names table aggregation
 * uses, so one vocabulary spans tables and transforms; `timeBucket` and
 * `rollup` produce chart series from a time column. These are plain functions
 * — no signals, no query, no components — and past their size the answer is
 * server-side, per server mode's own doctrine.
 */

/** The kit's eleven aggregation metrics, shared with table aggregation. */
export type Metric =
  | 'sum'
  | 'count'
  | 'min'
  | 'max'
  | 'extent'
  | 'mean'
  | 'median'
  | 'unique'
  | 'uniqueCount'
  | 'first'
  | 'last'

/** The bucket units {@link timeBucket} and {@link rollup} understand. */
export type TimeUnit = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'

/** A metric applied to one field. `count` ignores the field's values. */
export interface MetricSpec {
  field: string
  metric: Metric
}

/** A row is whatever the app's query returned. */
export type AggregateRow = Record<string, unknown>

/** Options for {@link aggregate}. */
export interface AggregateOptions {
  /** Group-by columns. The output row carries each group's value. */
  by: string | readonly string[]
  /** Output column → the field to aggregate and the metric to apply. */
  metrics: Record<string, MetricSpec>
}

/** A bucketed series point, shaped for a chart's `{ x, y }` series. */
export interface RollupPoint {
  /** The start of the bucket, in local time. */
  bucket: Date
  value: unknown
}

/** Options for {@link rollup}. */
export interface RollupOptions {
  /** The row's date column. */
  field: string
  unit: TimeUnit
  /**
   * What to compute per bucket. A bare metric name counts rows (its field is
   * the date column, which is what a count of a time series means); pass a
   * {@link MetricSpec} to aggregate a value column per bucket.
   */
  metric?: Metric | MetricSpec
}

/** A date, an ISO string, or an epoch — anything a chart hands back. */
export type DateLike = Date | string | number

function toDate(value: unknown): Date {
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  if (typeof value === 'string') return new Date(value)
  return new Date(Number.NaN)
}

/** Coerce to a number for the numeric metrics; `undefined` when not numeric. */
function numeric(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

/** Identity for `unique`/`uniqueCount`: JSON so objects compare by shape. */
function identity(value: unknown): string {
  if (value === undefined) return 'undefined'
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

function uniqueValues(values: readonly unknown[]): unknown[] {
  const seen = new Set<string>()
  const out: unknown[] = []
  for (const value of values) {
    const key = identity(value)
    if (!seen.has(key)) {
      seen.add(key)
      out.push(value)
    }
  }
  return out
}

function median(values: readonly number[]): number | undefined {
  if (values.length === 0) return undefined
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[middle]
  const low = sorted[middle - 1]
  const high = sorted[middle]
  if (low === undefined || high === undefined) return undefined
  return (low + high) / 2
}

/** Apply one metric to a group's rows. Internal to the transform module. */
function applyMetric(rows: readonly AggregateRow[], spec: MetricSpec): unknown {
  const values = rows.map((row) => row[spec.field])
  switch (spec.metric) {
    case 'count':
      return rows.length
    case 'sum': {
      let total = 0
      for (const value of values) total += numeric(value) ?? 0
      return total
    }
    case 'min': {
      let best: number | undefined
      for (const value of values) {
        const n = numeric(value)
        if (n !== undefined && (best === undefined || n < best)) best = n
      }
      return best
    }
    case 'max': {
      let best: number | undefined
      for (const value of values) {
        const n = numeric(value)
        if (n !== undefined && (best === undefined || n > best)) best = n
      }
      return best
    }
    case 'extent': {
      let low: number | undefined
      let high: number | undefined
      for (const value of values) {
        const n = numeric(value)
        if (n === undefined) continue
        if (low === undefined || n < low) low = n
        if (high === undefined || n > high) high = n
      }
      if (low === undefined || high === undefined) return undefined
      return [low, high]
    }
    case 'mean': {
      const numbers = values
        .map(numeric)
        .filter((n): n is number => n !== undefined)
      if (numbers.length === 0) return undefined
      return (
        numbers.reduce((total, n) => total + n, 0) / (numbers.length as number)
      )
    }
    case 'median': {
      const numbers = values
        .map(numeric)
        .filter((n): n is number => n !== undefined)
      return median(numbers)
    }
    case 'unique':
      return uniqueValues(values)
    case 'uniqueCount':
      return uniqueValues(values).length
    case 'first':
      return values[0]
    case 'last':
      return values[values.length - 1]
  }
}

/** A stable group key for a row's `by` values; dates group by their instant. */
function groupKey(row: AggregateRow, by: readonly string[]): string {
  return JSON.stringify(
    by.map((key) => {
      const value = row[key]
      return value instanceof Date ? value.toISOString() : value
    }),
  )
}

/**
 * Group rows by `by` and compute each named metric per group.
 *
 * The output rows carry the group columns plus one column per metrics key,
 * in the order groups first appear. `min`/`max`/`extent`/`mean`/`median`
 * ignore non-numeric values (and empty groups yield `undefined`); `count`
 * counts rows, and `first`/`last` keep the row's own value.
 */
export function aggregate(
  rows: readonly AggregateRow[],
  options: AggregateOptions,
): AggregateRow[] {
  const by = typeof options.by === 'string' ? [options.by] : options.by
  const groups = new Map<string, AggregateRow[]>()
  const groupValues = new Map<string, unknown[]>()
  for (const row of rows) {
    const key = groupKey(row, by)
    const bucket = groups.get(key)
    if (bucket) {
      bucket.push(row)
    } else {
      groups.set(key, [row])
      groupValues.set(
        key,
        by.map((column) => {
          const value = row[column]
          return value instanceof Date ? new Date(value.getTime()) : value
        }),
      )
    }
  }

  const out: AggregateRow[] = []
  for (const [key, bucket] of groups) {
    const result: AggregateRow = {}
    const values = groupValues.get(key) ?? []
    by.forEach((column, index) => {
      result[column] = values[index]
    })
    for (const [id, spec] of Object.entries(options.metrics)) {
      result[id] = applyMetric(bucket, spec)
    }
    out.push(result)
  }
  return out
}

/**
 * Floor a date to the start of its bucket, in local time.
 *
 * Weeks start on Monday; months, quarters and years start on their first day
 * at midnight. An unparseable date yields an Invalid Date, so a chart can
 * still map it — `rollup` skips those rows instead.
 */
export function timeBucket(date: DateLike, unit: TimeUnit): Date {
  const value = toDate(date)
  if (Number.isNaN(value.getTime())) return new Date(Number.NaN)
  const bucket = new Date(value.getTime())
  switch (unit) {
    case 'hour':
      bucket.setMinutes(0, 0, 0)
      return bucket
    case 'day':
      bucket.setHours(0, 0, 0, 0)
      return bucket
    case 'week': {
      bucket.setHours(0, 0, 0, 0)
      // getDay(): Sunday is 0; shift back to the Monday that starts the week.
      const shift = (bucket.getDay() + 6) % 7
      bucket.setDate(bucket.getDate() - shift)
      return bucket
    }
    case 'month':
      bucket.setHours(0, 0, 0, 0)
      bucket.setDate(1)
      return bucket
    case 'quarter':
      bucket.setHours(0, 0, 0, 0)
      bucket.setDate(1)
      bucket.setMonth(Math.floor(bucket.getMonth() / 3) * 3)
      return bucket
    case 'year':
      bucket.setHours(0, 0, 0, 0)
      bucket.setDate(1)
      bucket.setMonth(0)
      return bucket
  }
}

/**
 * Turn a time column into a chart series: bucket the rows by `unit`, apply
 * `metric` per bucket, and return the buckets in ascending order.
 *
 * Rows whose date column does not parse are skipped — a chart wants the
 * series it can place, not a hole. Rows are read in the given order, so
 * `first`/`last` follow the input's order, not the timeline's.
 */
export function rollup(
  rows: readonly AggregateRow[],
  options: RollupOptions,
): RollupPoint[] {
  const spec: MetricSpec =
    typeof options.metric === 'string'
      ? { field: options.field, metric: options.metric }
      : (options.metric ?? { field: options.field, metric: 'count' })
  const groups = new Map<number, AggregateRow[]>()
  for (const row of rows) {
    const bucket = timeBucket(row[options.field] as DateLike, options.unit)
    if (Number.isNaN(bucket.getTime())) continue
    const key = bucket.getTime()
    const bucketRows = groups.get(key)
    if (bucketRows) {
      bucketRows.push(row)
    } else {
      groups.set(key, [row])
    }
  }
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([time, bucketRows]) => ({
      bucket: new Date(time),
      value: applyMetric(bucketRows, spec),
    }))
}

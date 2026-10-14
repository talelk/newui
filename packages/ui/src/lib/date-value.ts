import {
  CalendarDateTime,
  type DateValue,
  parseDate,
} from '@internationalized/date'

/**
 * Boundary conversions between the pickers' ISO string values and the
 * `@internationalized/date` `DateValue` objects the Zag `date-picker` machine
 * operates on (ADR-0008).
 *
 * Kept in `lib/` so `DatePicker`, `DateRangePicker` and `DateTimePicker` share
 * one parse/stringify path rather than three drifting copies. Nothing here is
 * exported from the package root: these are implementation details of the date
 * family, not public API.
 */

/** Parse a `YYYY-MM-DD` string, tolerating anything invalid as "no value". */
export function toDate(value?: string | null): DateValue | undefined {
  if (!value) return undefined
  try {
    return parseDate(value)
  } catch {
    return undefined
  }
}

/** A controlled selection array, or `undefined` to leave the machine in charge. */
export function toValueArray(value?: string | null): DateValue[] | undefined {
  if (value === undefined) return undefined
  const date = toDate(value)
  return date ? [date] : []
}

/** The `[from, to]` tuple a range picker reports; `[]` when empty. */
export type DateRangeValue = [string, string] | []

/**
 * Parse a date range into the machine's selection array. `undefined` leaves the
 * machine in charge (uncontrolled); `null`/`[]` is an explicit empty selection.
 */
export function toRangeArray(
  value?: DateRangeValue | null,
): DateValue[] | undefined {
  if (value === undefined) return undefined
  if (!value || value.length === 0) return []
  return value
    .map((part) => toDate(part))
    .filter((date): date is DateValue => date !== undefined)
}

/** The public range tuple for a machine selection, or `[]` while half-open. */
export function toRangeValue(dates: DateValue[]): DateRangeValue {
  const from = dates[0]
  const to = dates[1]
  if (!from || !to) return []
  return [from.toString(), to.toString()]
}

/**
 * Parse a `YYYY-MM-DD`, `YYYY-MM-DDTHH:mm[:ss]` or `YYYY-MM-DD HH:mm[:ss]`
 * string into a `CalendarDateTime` (time defaults to midnight). Invalid input
 * reads as "no value".
 */
export function toDateTime(
  value?: string | null,
): CalendarDateTime | undefined {
  if (!value) return undefined
  const match =
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(
      value.trim(),
    )
  if (!match) return undefined
  return new CalendarDateTime(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4] ?? 0),
    Number(match[5] ?? 0),
    Number(match[6] ?? 0),
  )
}

/** `CalendarDate`/`CalendarDateTime` → ISO `YYYY-MM-DD` (minute precision). */
export function dateTimeToIso(value: DateValue | undefined): string | null {
  if (!value) return null
  const hh = 'hour' in value ? value.hour : 0
  const mm = 'minute' in value ? value.minute : 0
  return `${value.year.toString().padStart(4, '0')}-${value.month
    .toString()
    .padStart(2, '0')}-${value.day.toString().padStart(2, '0')}T${hh
    .toString()
    .padStart(2, '0')}:${mm.toString().padStart(2, '0')}`
}

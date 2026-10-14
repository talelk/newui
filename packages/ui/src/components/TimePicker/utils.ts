/**
 * Pure time helpers for TimePicker.
 *
 * The canonical value shape is `HH:mm` (24-hour), optionally `HH:mm:ss` when
 * seconds were typed. Parsing, range checks and option generation all hang off
 * those forms — no date library, because the picker never needs a calendar.
 */

export interface TimeOption {
  value: string
  label: string
}

export interface ParsedTime {
  valid: boolean
  /** Two-digit 24-hour hours. */
  hh24: string
  /** Two-digit minutes. */
  mm: string
  /** Two-digit seconds, present only when the input carried seconds. */
  ss?: string
  /** Total minutes from midnight. */
  total: number
}

export const DEFAULT_INTERVAL = 15

const INVALID: ParsedTime = { valid: false, hh24: '', mm: '', total: 0 }

/**
 * Parse human-typed times: `3p`, `3pm`, `3.30pm`, `15:00`, `1500`, `15`,
 * `9:30:15 am`. Returns canonical components plus total minutes from midnight.
 */
export function parseFlexibleTime(input: string): ParsedTime {
  if (!input) return INVALID
  let s = input.trim().toLowerCase()
  if (!s) return INVALID
  s = s.replace(/\./g, '')
  s = s.replace(/(\d)(am|pm)$/, '$1 $2')

  // Bare 3- or 4-digit forms: `930` → `9:30`, `1500` → `15:00`.
  const compact = /^(\d{3,4})\s*([ap]m)?$/.exec(s)
  if (compact) {
    const digits = compact[1] ?? ''
    const ap = compact[2]
    const hh = digits.length === 3 ? digits.slice(0, 1) : digits.slice(0, 2)
    const mm = digits.slice(-2)
    s = ap ? `${hh}:${mm} ${ap}` : `${hh}:${mm}`
  }

  const match = /^(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?\s*([ap]m)?$/.exec(s)
  if (!match) return INVALID
  const hhStr = match[1] ?? ''
  const mmStr = match[2]
  const ssStr = match[3]
  const ap = match[4]

  let hh = Number.parseInt(hhStr, 10)
  if (Number.isNaN(hh) || hh < 0 || hh > 23) return INVALID
  if (ssStr && !mmStr) return INVALID

  const mm = mmStr ? Number.parseInt(mmStr, 10) : 0
  if (Number.isNaN(mm) || mm < 0 || mm > 59) return INVALID

  let ss: number | undefined
  if (ssStr) {
    ss = Number.parseInt(ssStr, 10)
    if (Number.isNaN(ss) || ss < 0 || ss > 59) return INVALID
  }

  if (ap) {
    if (hh < 1 || hh > 12) return INVALID
    if (hh === 12 && ap === 'am') hh = 0
    else if (hh < 12 && ap === 'pm') hh += 12
  }

  return {
    valid: true,
    hh24: hh.toString().padStart(2, '0'),
    mm: mm.toString().padStart(2, '0'),
    ss: ss != null ? ss.toString().padStart(2, '0') : undefined,
    total: hh * 60 + mm,
  }
}

/** Coerce any accepted time string to canonical `HH:mm` / `HH:mm:ss`. */
export function normalize24(raw: string): string {
  if (!raw) return ''
  if (/^\d{2}:\d{2}$/.test(raw)) return raw
  if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) return raw
  const parsed = parseFlexibleTime(raw)
  if (!parsed.valid) return ''
  return parsed.ss
    ? `${parsed.hh24}:${parsed.mm}:${parsed.ss}`
    : `${parsed.hh24}:${parsed.mm}`
}

/** Total minutes (0–1439) from an `HH:mm[:ss]` string, or null if malformed. */
export function minutesFromHHMM(str: string): number | null {
  if (!str) return null
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(str)
  if (!match) return null
  const h = Number.parseInt(match[1] ?? '', 10)
  const m = Number.parseInt(match[2] ?? '', 10)
  if (Number.isNaN(h) || Number.isNaN(m) || h > 23 || m > 59) return null
  return h * 60 + m
}

/** Whether a minute-of-day total falls outside `[min, max]` (either may be null). */
export function isOutOfRange(
  totalMinutes: number,
  minMinutes: number | null,
  maxMinutes: number | null,
): boolean {
  if (minMinutes != null && totalMinutes < minMinutes) return true
  if (maxMinutes != null && totalMinutes > maxMinutes) return true
  return false
}

/**
 * Build interval-spaced options across the day, optionally bounded by min/max.
 * Values are canonical `HH:mm`; labels are the same (the picker shows 24-hour).
 */
export function generateTimeOptions({
  interval,
  minMinutes,
  maxMinutes,
}: {
  interval: number
  minMinutes: number | null
  maxMinutes: number | null
}): TimeOption[] {
  const step = interval > 0 ? interval : DEFAULT_INTERVAL
  const out: TimeOption[] = []
  for (let m = 0; m < 1440; m += step) {
    if (isOutOfRange(m, minMinutes, maxMinutes)) continue
    const hh = Math.floor(m / 60)
      .toString()
      .padStart(2, '0')
    const mm = (m % 60).toString().padStart(2, '0')
    const value = `${hh}:${mm}`
    out.push({ value, label: value })
  }
  return out
}

/** The `HH:mm` head of a value that may carry seconds. */
export function baseValue(val: string): string {
  return val.length === 8 ? val.slice(0, 5) : val
}

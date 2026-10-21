// ---------------------------------------------------------------------------
// Duration helpers: convert between a seconds value and human-readable text.
// ---------------------------------------------------------------------------

/**
 * Named display presets (smart zero-omission; `long` also pluralizes):
 *   short — "1h 30m 45s"
 *   long  — "1 hour 30 minutes 45 seconds"
 *   colon — "1:30:45"
 */
export type DurationFormatPreset = 'short' | 'long' | 'colon'

/**
 * How a duration is rendered: a named preset, or a token template string
 * rendered literally — `h`/`hh`, `m`/`mm`, `s`/`ss`, with single-quoted text
 * taken as a literal (e.g. `h'h' m'm' s's'` → "2h 2m 3s", `hh:mm:ss` → "02:02:03").
 */
// `string & {}` keeps preset autocomplete while still accepting any template.
export type DurationFormat = DurationFormatPreset | (string & {})

/**
 * Format a duration in seconds as text.
 *
 * `format` is either a named preset — which applies smart zero-omission and
 * (for `long`) pluralization — or a token template rendered literally:
 *
 *   formatDuration(5445)                    // "1h 30m 45s"   (short preset, default)
 *   formatDuration(90)                      // "1m 30s"       (preset omits zero parts)
 *   formatDuration(5445, 'long')            // "1 hour 30 minutes 45 seconds"
 *   formatDuration(5445, 'colon')           // "1:30:45"
 *   formatDuration(5445, "h'h' m'm' s's'")  // "1h 30m 45s"   (template, all parts)
 *   formatDuration(90,   "h'h' m'm' s's'")  // "0h 1m 30s"
 *   formatDuration(7323, 'hh:mm:ss')        // "02:02:03"
 */
export function formatDuration(
  totalSeconds: number | null | undefined,
  format: DurationFormat = 'short',
): string {
  if (totalSeconds === null || totalSeconds === undefined) return ''

  const seconds = Number(totalSeconds)
  if (Number.isNaN(seconds)) return ''

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (format === 'short') return formatShort(hours, minutes, secs)
  if (format === 'long') return formatLong(hours, minutes, secs)
  if (format === 'colon') return formatColon(hours, minutes, secs)
  return renderTemplate(format, hours, minutes, secs)
}

// ---------------------------------------------------------------------------
// Token template engine.
//
// Outside single quotes, runs of h / m / s are unit tokens; a run of length
// >= 2 zero-pads to two digits (`hh` → "02"). Single-quoted text is emitted
// literally so the unit letters can appear as labels (`'h'` → "h"); `''` is a
// literal apostrophe. Any other character passes through unchanged.
//
//   "h'h' m'm' s's'" → "1h 30m 45s"
//   "hh:mm:ss"       → "01:30:45"
// ---------------------------------------------------------------------------
function renderTemplate(
  template: string,
  hours: number,
  minutes: number,
  secs: number,
): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  let out = ''
  let i = 0

  while (i < template.length) {
    const ch = template.charAt(i)

    if (ch === "'") {
      i++
      if (template.charAt(i) === "'") {
        out += "'"
        i++
        continue
      }
      while (i < template.length && template.charAt(i) !== "'") {
        out += template.charAt(i)
        i++
      }
      i++ // skip the closing quote
      continue
    }

    if (ch === 'h' || ch === 'm' || ch === 's') {
      let len = 1
      while (template.charAt(i + len) === ch) len++
      const value = ch === 'h' ? hours : ch === 'm' ? minutes : secs
      out += len >= 2 ? pad(value) : String(value)
      i += len
      continue
    }

    out += ch
    i++
  }

  return out
}

function formatShort(hours: number, minutes: number, secs: number): string {
  const parts: string[] = []
  if (hours) parts.push(`${hours}h`)
  if (minutes) parts.push(`${minutes}m`)
  if (secs) parts.push(`${secs}s`)
  return parts.length ? parts.join(' ') : '0s'
}

function formatLong(hours: number, minutes: number, secs: number): string {
  const parts: string[] = []
  if (hours) parts.push(hours === 1 ? '1 hour' : `${hours} hours`)
  if (minutes) parts.push(minutes === 1 ? '1 minute' : `${minutes} minutes`)
  if (secs) parts.push(secs === 1 ? '1 second' : `${secs} seconds`)
  return parts.length ? parts.join(' ') : '0 seconds'
}

function formatColon(hours: number, minutes: number, secs: number): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  if (hours) return `${hours}:${pad(minutes)}:${pad(secs)}`
  return `${minutes}:${pad(secs)}`
}

// ---------------------------------------------------------------------------
// Parse: human-readable string → seconds (integer) or null if invalid.
//
// Supported formats (case-insensitive, spaces optional, any unit order):
//   1h 30m 45s | 4m 3h 4s | 4sec 3hour 4min | 1h30m45s
//   1:30:45    | 1:30     | :45
//   90         | 90s      (bare integer treated as seconds)
// ---------------------------------------------------------------------------
export function parseDuration(str: string): number | null {
  const input = str.trim().toLowerCase()
  if (!input) return null

  const colonSeconds = parseColon(input)
  if (colonSeconds !== null) return colonSeconds

  // Bare integer: treated as seconds.
  if (/^\d+$/.test(input)) return parseInt(input, 10)

  return parseUnits(input)
}

// Colon-separated: h:m:s or m:s or :s. Groups are not bounded to 0-59:
// out-of-range parts overflow by design, so "1:75" parses to 135s (1m + 75s)
// and "5:99" to 399s. This mirrors stopwatch-style entry and is harmless.
function parseColon(input: string): number | null {
  const match = input.match(/^(\d+):(\d+):(\d+)$|^(\d+):(\d+)$|^:(\d+)$/)
  if (!match) return null

  const h = match[1]
  const m = match[2]
  const s = match[3]
  const mm = match[4]
  const ss = match[5]
  const sOnly = match[6]

  if (h !== undefined) {
    return (
      parseInt(h, 10) * 3600 +
      parseInt(m ?? '0', 10) * 60 +
      parseInt(s ?? '0', 10)
    )
  }
  if (mm !== undefined) {
    return parseInt(mm, 10) * 60 + parseInt(ss ?? '0', 10)
  }
  return parseInt(sOnly ?? '0', 10)
}

// Named units in any order: scan (number)(unit) tokens left-to-right and
// verify no unexpected text exists between tokens. Rejects duplicate units.
function parseUnits(input: string): number | null {
  const tokenRe = /(\d+)\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)/g
  const tokens: { value: number; unit: string }[] = []
  let lastEnd = 0
  let match = tokenRe.exec(input)

  while (match !== null) {
    if (input.slice(lastEnd, match.index).trim() !== '') return null
    const value = parseInt(match[1] ?? '0', 10)
    const unit = (match[2] ?? '').charAt(0)
    tokens.push({ value, unit })
    lastEnd = match.index + match[0].length
    match = tokenRe.exec(input)
  }

  if (input.slice(lastEnd).trim() !== '') return null
  if (tokens.length === 0) return null

  const seen = new Set<string>()
  let total = 0
  for (const { value, unit } of tokens) {
    if (seen.has(unit)) return null
    seen.add(unit)
    if (unit === 'h') total += value * 3600
    else if (unit === 'm') total += value * 60
    else total += value
  }
  return total
}

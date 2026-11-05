import {
  type Accessor,
  createContext,
  createMemo,
  createSignal,
  type JSX,
  untrack,
  useContext,
} from 'solid-js'
import {
  defaultsFor,
  encodeValue,
  pruneDefaults,
  withPruning,
} from './url-serialize'
import {
  createUrlState,
  type UrlStateAdapter,
  type UrlStateValue,
} from './url-state'

/**
 * The connective tissue of an analytics dashboard: one shared time range,
 * one shared filter record, and one cross-filter slot that every widget
 * reads and writes.
 *
 * `createDashboardState` owns the signals; `DashboardProvider` and
 * `useDashboardState` keep charts, KPI cards and tables from prop-drilling
 * them through the widget grid. What is reproducible by link — the preset,
 * the custom dates, the cross-filter, every declared filter — round-trips
 * through `createUrlState` when the app supplies an adapter, and stays a
 * plain signal without one, so tests and SSR stay clean.
 */

/** The named ranges the kit ships. `'custom'` means the user set the dates. */
export type TimeRangePreset = '7d' | '30d' | 'qtd' | 'ytd' | 'custom'

/** The shared time window every widget filters by. */
export interface TimeRange {
  /** Which preset produced this range; `'custom'` means set dates. */
  preset: TimeRangePreset
  /** Inclusive start — local midnight of the first day. */
  from: Date
  /** Inclusive end — local end-of-day of the last day. */
  to: Date
}

/** The one widget click other widgets filter by. */
export interface CrossFilter {
  /** The column the click came from. */
  column: string
  /** The clicked value. */
  value: string | number | boolean
}

/** Options for {@link createDashboardState}. */
export interface DashboardStateOptions {
  /** Initial range. Defaults to the current 7 days. */
  timeRange?: { preset?: TimeRangePreset; from?: Date; to?: Date }
  /**
   * The shared filter record. Declared keys get their own URL params
   * (`f:<key>`); the empty string means unset.
   */
  filters?: Record<string, UrlStateValue | undefined>
  /** Router bridge. Present (and `sync` not false), state round-trips to the URL. */
  adapter?: UrlStateAdapter
  /** Turn URL writing off while still reading the adapter for deep links. */
  sync?: boolean
  /** Clock seam for tests. Defaults to `() => new Date()`. */
  now?: () => Date
}

/** The handle {@link createDashboardState} returns. */
export interface DashboardState {
  /** The current window. Preset ranges are computed from `now()` on read. */
  timeRange(): TimeRange
  /**
   * `'7d' | '30d' | 'qtd' | 'ytd'` recomputes the window; a partial with
   * dates marks the range `'custom'`. An unknown preset is ignored.
   */
  setTimeRange(next: TimeRangePreset | Partial<TimeRange>): void
  /** The shared filters, declared and ad hoc. Unset keys read `undefined`. */
  filters(): Record<string, UrlStateValue | undefined>
  /** One filter. `undefined` returns it to its declared default. */
  setFilter(key: string, value: UrlStateValue | undefined): void
  /** Apply several filters at once — a merge, not a replacement. */
  setFilters(next: Record<string, UrlStateValue | undefined>): void
  /** The active cross-filter, or `null`. One slot, one value. */
  cross(): CrossFilter | null
  /**
   * Set the cross-filter, replacing whatever held the slot. Setting the same
   * column and value again clears it — the chip the widget's own click
   * toggles — and `null` clears it outright.
   */
  setCross(next: CrossFilter | null): void
  /** The params this state serializes to right now (for "copy link"). */
  params(): URLSearchParams
}

const PRESET_NAMES: readonly TimeRangePreset[] = [
  '7d',
  '30d',
  'qtd',
  'ytd',
  'custom',
]

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  )
}

/** The window a named preset stands for, ending with today. */
function presetRange(
  preset: Exclude<TimeRangePreset, 'custom'>,
  now: Date,
): { from: Date; to: Date } {
  const to = endOfDay(now)
  switch (preset) {
    case '7d':
      return {
        from: startOfDay(
          new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6),
        ),
        to,
      }
    case '30d':
      return {
        from: startOfDay(
          new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29),
        ),
        to,
      }
    case 'qtd':
      return {
        from: startOfDay(
          new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1),
        ),
        to,
      }
    case 'ytd':
      return { from: startOfDay(new Date(now.getFullYear(), 0, 1)), to }
  }
}

function isPreset(value: unknown): value is TimeRangePreset {
  return (
    typeof value === 'string' &&
    (PRESET_NAMES as readonly string[]).includes(value)
  )
}

function isCrossFilter(value: unknown): value is CrossFilter {
  if (value === null || typeof value !== 'object') return false
  const candidate = value as Partial<CrossFilter>
  return (
    typeof candidate.column === 'string' &&
    (typeof candidate.value === 'string' ||
      typeof candidate.value === 'number' ||
      typeof candidate.value === 'boolean')
  )
}

/**
 * Create the shared dashboard state. Call it once, at the root of the
 * dashboard, and hand the result to `DashboardProvider`; widgets read it
 * through `useDashboardState`.
 */
export function createDashboardState(
  options: DashboardStateOptions = {},
): DashboardState {
  const now = options.now ?? (() => new Date())
  const sync = options.sync ?? options.adapter !== undefined
  const adapter = sync ? options.adapter : undefined

  // A `'custom'` seed without both dates is not a range; fall back to 7d
  // rather than invent one.
  const seededFrom = options.timeRange?.from
  const seededTo = options.timeRange?.to
  const seededCustom =
    options.timeRange?.preset === 'custom' &&
    seededFrom !== undefined &&
    seededTo !== undefined
  const seedPreset: TimeRangePreset =
    options.timeRange?.preset === 'custom' && !seededCustom
      ? '7d'
      : (options.timeRange?.preset ?? '7d')

  const declared = Object.keys(options.filters ?? {})
  const urlInitial: Record<string, UrlStateValue> = {
    range: seedPreset,
    from: seededCustom && seededFrom ? seededFrom.toISOString() : '',
    to: seededCustom && seededTo ? seededTo.toISOString() : '',
    cross: '',
  }
  for (const key of declared) {
    urlInitial[`f:${key}`] = options.filters?.[key] ?? ''
  }
  const defaults = defaultsFor(urlInitial)

  const url = createUrlState(urlInitial, {
    ...(adapter ? { adapter: withPruning(adapter, defaults) } : {}),
  })

  // Reading `createUrlState`'s record by key runs into the
  // `noUncheckedIndexedAccess` wall; this keeps every accessor honest.
  const read = (key: string): UrlStateValue => {
    const accessor = (
      url as unknown as Record<string, Accessor<UrlStateValue> | undefined>
    )[key]
    return accessor ? accessor() : ''
  }

  // Undeclared filter keys arrive at runtime (a cross-filter writing a new
  // column, say). They live in one signal of their own and still serialize.
  const [extraFilters, setExtraFilters] = createSignal<
    Record<string, UrlStateValue>
  >({})

  const timeRange = createMemo<TimeRange>(() => {
    const preset = read('range')
    if (isPreset(preset) && preset !== 'custom') {
      return { preset, ...presetRange(preset, now()) }
    }
    const from = Date.parse(String(read('from')))
    const to = Date.parse(String(read('to')))
    if (!Number.isNaN(from) && !Number.isNaN(to)) {
      return { preset: 'custom', from: new Date(from), to: new Date(to) }
    }
    // A custom range whose dates no longer parse is a stale link: reset the
    // window, keep the label, do not crash.
    return { preset: 'custom', ...presetRange('7d', now()) }
  })

  function setTimeRange(next: TimeRangePreset | Partial<TimeRange>): void {
    if (typeof next === 'string') {
      if (!isPreset(next)) {
        console.warn(
          `[newui-data] createDashboardState: "${next}" is not a time-range preset; ignored.`,
        )
        return
      }
      url.set('range', next)
      if (next !== 'custom') {
        url.set('from', undefined)
        url.set('to', undefined)
      }
      return
    }
    const preset = next.preset ?? 'custom'
    if (isPreset(preset) && preset !== 'custom') {
      url.set('range', preset)
      url.set('from', undefined)
      url.set('to', undefined)
      return
    }
    const current = untrack(timeRange)
    const from = next.from ?? current.from
    const to = next.to ?? current.to
    url.set('range', 'custom')
    url.set('from', from.toISOString())
    url.set('to', to.toISOString())
  }

  const cross = createMemo<CrossFilter | null>(() => {
    const raw = String(read('cross'))
    if (raw === '') return null
    try {
      const parsed = JSON.parse(raw) as unknown
      return isCrossFilter(parsed) ? parsed : null
    } catch {
      return null
    }
  })

  function setCross(next: CrossFilter | null): void {
    if (next === null) {
      url.set('cross', undefined)
      return
    }
    const current = untrack(cross)
    // One slot: the same click twice is a toggle, not a second filter.
    if (
      current !== null &&
      current.column === next.column &&
      current.value === next.value
    ) {
      url.set('cross', undefined)
      return
    }
    url.set('cross', JSON.stringify(next))
  }

  function filterValue(key: string): UrlStateValue | undefined {
    const raw = declared.includes(key)
      ? read(`f:${key}`)
      : (extraFilters()[key] ?? '')
    return raw === '' ? undefined : raw
  }

  const filters = createMemo(() => {
    const out: Record<string, UrlStateValue | undefined> = {}
    for (const key of declared) out[key] = filterValue(key)
    for (const key of Object.keys(extraFilters())) {
      if (!declared.includes(key)) out[key] = filterValue(key)
    }
    return out
  })

  function setFilter(key: string, value: UrlStateValue | undefined): void {
    if (declared.includes(key)) {
      url.set(`f:${key}`, value)
      return
    }
    setExtraFilters((extras) => ({ ...extras, [key]: value ?? '' }))
  }

  function setFilters(next: Record<string, UrlStateValue | undefined>): void {
    for (const [key, value] of Object.entries(next)) setFilter(key, value)
  }

  function params(): URLSearchParams {
    const out = url.params()
    for (const [key, value] of Object.entries(extraFilters())) {
      if (value === undefined || value === '') out.delete(`f:${key}`)
      else out.set(`f:${key}`, encodeValue(value))
    }
    return pruneDefaults(out, defaults)
  }

  return {
    timeRange,
    setTimeRange,
    filters,
    setFilter,
    setFilters,
    cross,
    setCross,
    params,
  }
}

const DashboardContext = createContext<Accessor<DashboardState>>()

/**
 * Publish one `createDashboardState` to the widget grid, so a chart three
 * levels down reads the same time range without a prop on every card.
 */
export function DashboardProvider(props: {
  state: DashboardState
  children: JSX.Element
}): JSX.Element {
  const state = createMemo(() => props.state)
  return (
    <DashboardContext.Provider value={state}>
      {props.children}
    </DashboardContext.Provider>
  )
}

/** The dashboard state published by the enclosing `DashboardProvider`. */
export function useDashboardState(): DashboardState {
  const state = useContext(DashboardContext)
  if (!state) {
    throw new Error(
      'useDashboardState must be used within <DashboardProvider> (create the state with createDashboardState)',
    )
  }
  return state()
}

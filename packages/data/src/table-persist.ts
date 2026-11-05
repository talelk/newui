import type { Accessor } from 'solid-js'
import { type ConfigStorage, createConfigStore } from './config-store'
import { defaultsFor, withPruning } from './url-serialize'
import {
  createUrlState,
  type UrlStateAdapter,
  type UrlStateValue,
} from './url-state'

/**
 * What a table remembers, and where it lives.
 *
 * `createTablePersist` splits table state by *who owns the question*:
 *
 * - The **URL half** — sorting, column filters, density, page size — is what
 *   makes a link reproducible, so it serializes through `createUrlState`
 *   behind the app's router adapter, pruned to only what differs from the
 *   default.
 * - The **storage half** — the column layout (visibility, order, sizing,
 *   pinning) — is a personal preference that should survive a shared link,
 *   so it lives in a versioned `createConfigStore` document.
 *
 * The document carries the whole state, so a returning user gets their sort
 * back even when the URL says nothing; the URL wins when it does. A persisted
 * column that no longer exists in the table is dropped on read, not hidden
 * forever.
 */

/** Envelope-free payload version: a document without `v` predates this shape. */
const TABLE_PERSIST_SCHEMA_VERSION = 1

/** The `type` discriminator on the stored envelope. */
const TABLE_PERSIST_DOC_TYPE = 'table-view'

/** How the table's columns are laid out. Mirrors the TanStack column state. */
export interface TableColumnLayout {
  /** Sparse visibility map — an absent column is visible. */
  visibility: Record<string, boolean>
  /** Left-to-right column ids. */
  order: string[]
  /** Pixel widths, keyed by column id. */
  sizing: Record<string, number>
  /** Pinned column ids, in pinned order. */
  pinning: { left: string[]; right: string[] }
}

/** One sort entry. */
export type TableSorting = { id: string; desc: boolean }

/** One active column filter. */
export type TableColumnFilter = { id: string; value: UrlStateValue }

/** Row density, matching the table organism's axis. */
export type TableDensity = 'comfortable' | 'compact'

/** Everything `createTablePersist` remembers. */
export interface TablePersistState {
  columns?: TableColumnLayout
  sorting?: TableSorting[]
  columnFilters?: TableColumnFilter[]
  density?: TableDensity
  pageSize?: number
}

/** The stored document: the state plus its payload version. */
export interface TablePersistDoc extends TablePersistState {
  v?: number
}

/** Options for {@link createTablePersist}. */
export interface TablePersistOptions {
  /** Stable id — namespaces the URL keys and the document name. */
  id: string
  /** Router bridge for the URL half. Absent means the URL is never touched. */
  url?: { adapter?: UrlStateAdapter }
  /** Backend for the document. Defaults to `localStorage`. */
  storage?: ConfigStorage
  /**
   * Called when a persist fails — a storage backend that rejects the write,
   * or a document that no longer parses. The table keeps working either way;
   * the app decides whether to say so.
   */
  onPersistError?: (error: Error) => void
}

/** The result of {@link createTablePersist}. */
export interface TablePersist {
  /**
   * Read the persisted state for a table with these column ids. A persisted
   * column that is gone from the table is dropped from the layout and named
   * in `dropped`; new columns are appended to the order, visible.
   */
  hydrate(columns: readonly string[]): TablePersistState & { dropped: string[] }
  /** Write the table's current state — both halves, whatever is present. */
  commit(state: Partial<TablePersistState>): void
  /** Forget everything persisted for this id. */
  reset(): void
}

/** The storage namespace every persisted table shares. */
const STORE_KEY = 'newui.tables'

function isLayout(value: unknown): value is TableColumnLayout {
  if (value === null || typeof value !== 'object') return false
  const layout = value as Partial<TableColumnLayout>
  return (
    typeof layout.visibility === 'object' &&
    layout.visibility !== null &&
    Array.isArray(layout.order) &&
    typeof layout.sizing === 'object' &&
    layout.sizing !== null &&
    typeof layout.pinning === 'object' &&
    layout.pinning !== null &&
    Array.isArray(layout.pinning.left) &&
    Array.isArray(layout.pinning.right)
  )
}

function isSorting(value: unknown): value is TableSorting[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        entry !== null &&
        typeof entry === 'object' &&
        typeof (entry as TableSorting).id === 'string' &&
        typeof (entry as TableSorting).desc === 'boolean',
    )
  )
}

function isColumnFilters(value: unknown): value is TableColumnFilter[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        entry !== null &&
        typeof entry === 'object' &&
        typeof (entry as TableColumnFilter).id === 'string',
    )
  )
}

/**
 * Upgrade anything a store hands back to the current shape. A payload with
 * no `v` predates the versioned document: it wrote `columns` as the visible
 * ids and `sort` instead of `sorting`. Fields that fail validation are
 * dropped rather than trusted — a half-readable document is still better
 * than none.
 */
function normalizeDoc(payload: unknown): TablePersistState {
  if (payload === null || typeof payload !== 'object') return {}
  const doc = payload as Record<string, unknown>
  const legacy = doc['v'] === undefined
  const state: TablePersistState = {}

  const sorting = legacy ? doc['sort'] : doc['sorting']
  if (isSorting(sorting)) state.sorting = sorting

  const filters = doc['columnFilters']
  if (isColumnFilters(filters)) state.columnFilters = filters

  const density = doc['density']
  if (density === 'comfortable' || density === 'compact')
    state.density = density

  const pageSize = doc['pageSize']
  if (
    typeof pageSize === 'number' &&
    Number.isInteger(pageSize) &&
    pageSize > 0
  ) {
    state.pageSize = pageSize
  }

  const columns = doc['columns']
  if (legacy && Array.isArray(columns)) {
    // v0: the array of visible ids was the whole layout.
    const ids = columns.filter((id): id is string => typeof id === 'string')
    state.columns = {
      visibility: Object.fromEntries(ids.map((id) => [id, true])),
      order: ids,
      sizing: {},
      pinning: { left: [], right: [] },
    }
  } else if (isLayout(columns)) {
    state.columns = columns
  }
  return state
}

/**
 * Create the persistence binding for one table. Call it once per table id,
 * `hydrate` with the current column ids before first paint, and `commit`
 * with the table's state whenever it changes.
 */
export function createTablePersist(options: TablePersistOptions): TablePersist {
  const { id } = options
  const reportError = (error: Error): void => {
    options.onPersistError?.(error)
  }

  const urlKeys: Record<string, UrlStateValue> = {
    [`${id}.sort`]: [],
    [`${id}.filters`]: [],
    [`${id}.density`]: '',
    [`${id}.pageSize`]: 0,
  }
  const url = createUrlState(urlKeys, {
    ...(options.url?.adapter
      ? {
          adapter: withPruning(options.url.adapter, defaultsFor(urlKeys)),
        }
      : {}),
  })

  // Reading `createUrlState`'s record by key runs into the
  // `noUncheckedIndexedAccess` wall; this keeps every accessor honest.
  const read = (key: string): UrlStateValue => {
    const accessor = (
      url as unknown as Record<string, Accessor<UrlStateValue> | undefined>
    )[key]
    return accessor ? accessor() : ''
  }

  const store = createConfigStore({
    key: STORE_KEY,
    ...(options.storage ? { storage: options.storage } : {}),
    migrate: (doc) => normalizeDoc(doc),
  })

  function readDoc(): TablePersistState {
    const loaded = store.load<TablePersistDoc>(id)
    if (loaded) return normalizeDoc(loaded.doc)
    // Absent is silence; present-but-unreadable is a story the app hears once.
    if (options.storage?.getItem(`${STORE_KEY}:${id}`) !== null) {
      reportError(
        new Error(
          `createTablePersist: the stored document for "${id}" is unreadable and was treated as absent.`,
        ),
      )
    }
    return {}
  }

  function readUrl(): Partial<TablePersistState> {
    const state: Partial<TablePersistState> = {}
    const sort = read(`${id}.sort`)
    if (isSorting(sort) && sort.length > 0) state.sorting = sort
    const filters = read(`${id}.filters`)
    if (isColumnFilters(filters) && filters.length > 0)
      state.columnFilters = filters
    const density = read(`${id}.density`)
    if (density === 'comfortable' || density === 'compact')
      state.density = density
    const pageSize = read(`${id}.pageSize`)
    if (
      typeof pageSize === 'number' &&
      Number.isInteger(pageSize) &&
      pageSize > 0
    ) {
      state.pageSize = pageSize
    }
    return state
  }

  /**
   * Fit a persisted layout to the table that exists now: gone columns are
   * dropped, new ones appended visible, everything else in order.
   */
  function fitColumns(
    persisted: TableColumnLayout,
    current: readonly string[],
    dropped: Set<string>,
  ): TableColumnLayout {
    const keep = new Set(current)
    const order: string[] = []
    for (const column of persisted.order) {
      if (typeof column !== 'string') continue
      if (keep.has(column)) {
        if (!order.includes(column)) order.push(column)
      } else {
        dropped.add(column)
      }
    }
    for (const column of current) {
      if (!order.includes(column)) order.push(column)
    }

    const visibility: Record<string, boolean> = {}
    for (const [column, visible] of Object.entries(persisted.visibility)) {
      if (!keep.has(column)) dropped.add(column)
      else if (typeof visible === 'boolean') visibility[column] = visible
    }
    const sizing: Record<string, number> = {}
    for (const [column, width] of Object.entries(persisted.sizing)) {
      if (!keep.has(column)) dropped.add(column)
      else if (typeof width === 'number' && width > 0) sizing[column] = width
    }
    const pin = (side: readonly unknown[]): string[] =>
      side.filter((column): column is string => {
        if (typeof column !== 'string') return false
        if (keep.has(column)) return true
        dropped.add(column)
        return false
      })

    return {
      visibility,
      order,
      sizing,
      pinning: {
        left: pin(persisted.pinning.left),
        right: pin(persisted.pinning.right),
      },
    }
  }

  return {
    hydrate(columns: readonly string[]) {
      const persisted = readDoc()
      const state: TablePersistState & { dropped: string[] } = {
        ...persisted,
        ...readUrl(),
        dropped: [],
      }
      if (persisted.columns) {
        const dropped = new Set(state.dropped)
        state.columns = fitColumns(persisted.columns, columns, dropped)
        state.dropped = [...dropped]
      }
      return state
    },

    commit(state: Partial<TablePersistState>) {
      if (state.sorting) url.set(`${id}.sort`, state.sorting)
      if (state.columnFilters) url.set(`${id}.filters`, state.columnFilters)
      if (state.density) url.set(`${id}.density`, state.density)
      if (state.pageSize) url.set(`${id}.pageSize`, state.pageSize)

      const current = readDoc()
      const next: TablePersistDoc = {
        ...current,
        ...state,
        v: TABLE_PERSIST_SCHEMA_VERSION,
      }
      try {
        if (!store.save(id, next, { type: TABLE_PERSIST_DOC_TYPE })) {
          reportError(
            new Error(
              `createTablePersist: the storage backend rejected the write for "${id}" (quota or disabled storage). The table state is not persisted.`,
            ),
          )
        }
      } catch (error) {
        reportError(
          error instanceof Error
            ? error
            : new Error(`createTablePersist: persisting "${id}" failed.`),
        )
      }
    },

    reset() {
      store.remove(id)
      for (const key of Object.keys(urlKeys)) {
        url.set(key, undefined)
      }
    },
  }
}

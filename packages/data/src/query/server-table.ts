import type { QueryKey } from '@tanstack/solid-query'
import type { Accessor } from 'solid-js'
import {
  createUrlState,
  type UrlStateAdapter,
  type UrlStateValue,
} from '../url-state'

/**
 * The query state of a server-mode table.
 *
 * `createServerTableState` owns the slices a server-mode `DataTable` mirrors:
 * sorting, column filters, the global filter and pagination. It is a store,
 * not a hook — the page creates it once and wires its accessors and setters
 * into the table's controlled props, so the same state drives the request, the
 * query key and (with a router adapter) the URL.
 *
 * The reset rule lives here as it does in the table: a sort or filter change
 * returns the result to page 0, because page 3 of a result set that just
 * changed shape is not a page anyone asked for.
 *
 * The slices are structural copies of TanStack Table's state shapes — this
 * package never imports the table engine, so the app is the only place the
 * two meet.
 */

// Type aliases, not interfaces: the slices serialize through `createUrlState`,
// whose value contract needs the implicit index signature a type alias carries.

/** One sort entry: a column id and its direction. */
export type ServerTableSort = {
  id: string
  desc: boolean
}

/** One column filter: a column id and its value. */
export type ServerTableColumnFilter = {
  id: string
  value: unknown
}

/** Where the user is in the result set. */
export type ServerTablePagination = {
  pageIndex: number
  pageSize: number
}

export interface ServerTableStateOptions {
  /** What the page renders before the URL or the user has said anything. */
  initial?: {
    sorting?: ServerTableSort[]
    columnFilters?: ServerTableColumnFilter[]
    globalFilter?: string
    pagination?: Partial<ServerTablePagination>
  }
  /**
   * Pipe the slices through `createUrlState` so they serialize to query
   * parameters. Keys are namespaced (`table.sorting` by default) so one URL
   * can host several surfaces. Without an adapter the store is plain signals.
   */
  sync?: {
    adapter?: UrlStateAdapter
    /** Query-key namespace for the slices. Defaults to `table`. */
    namespace?: string
  }
}

export interface ServerTableState {
  sorting: Accessor<ServerTableSort[]>
  columnFilters: Accessor<ServerTableColumnFilter[]>
  globalFilter: Accessor<string>
  pagination: Accessor<ServerTablePagination>
  /** Replaces the sort entries and returns to page 0. */
  setSorting: (next: ServerTableSort[]) => void
  /** Replaces the column filters and returns to page 0. */
  setColumnFilters: (next: ServerTableColumnFilter[]) => void
  /** Replaces the search term and returns to page 0. */
  setGlobalFilter: (next: string) => void
  /** Moves within the result set. */
  setPageIndex: (pageIndex: number) => void
  /** Resizes the page, preserving the top row. */
  setPageSize: (pageSize: number) => void
  /** The whole pagination slice at once. */
  setPagination: (next: ServerTablePagination) => void
  /**
   * The slices as one query key, so two pages with the same table state share
   * one request. Pass the collection's own key as `base`.
   */
  key: (base?: QueryKey) => QueryKey
}

const DEFAULT_NAMESPACE = 'table'

/**
 * A server-mode table's sorting, filtering and pagination as one store,
 * optionally serialized to the URL.
 */
export function createServerTableState(
  options: ServerTableStateOptions = {},
): ServerTableState {
  const ns = options.sync?.namespace ?? DEFAULT_NAMESPACE
  const initialPagination: ServerTablePagination = {
    pageIndex: 0,
    pageSize: 10,
    ...options.initial?.pagination,
  }
  // The slices are typed by TanStack's shapes, not by `UrlStateValue`; the
  // URL layer only ever JSON-round-trips them, so the boundary is a cast.
  const initial: Record<string, UrlStateValue> = {
    [`${ns}.sorting`]: options.initial?.sorting ?? [],
    [`${ns}.columnFilters`]: (options.initial?.columnFilters ??
      []) as UrlStateValue,
    [`${ns}.globalFilter`]: options.initial?.globalFilter ?? '',
    [`${ns}.pagination`]: initialPagination,
  }
  const url = createUrlState(initial, { adapter: options.sync?.adapter })

  // `createUrlState` types every key as `UrlStateValue`; the store re-types
  // them back. Values round-trip through JSON, so the casts are the whole
  // story — the URL never sees a value this file did not write.
  const signals = url as unknown as Record<string, Accessor<UrlStateValue>>
  const read = <T>(key: string): Accessor<T> => {
    const accessor = signals[key]
    if (!accessor) throw new Error(`createUrlState is missing key "${key}"`)
    return () => accessor() as T
  }
  const sorting = read<ServerTableSort[]>(`${ns}.sorting`)
  const columnFilters = read<ServerTableColumnFilter[]>(`${ns}.columnFilters`)
  const globalFilter = read<string>(`${ns}.globalFilter`)
  const pagination = read<ServerTablePagination>(`${ns}.pagination`)

  const setPagination = (next: ServerTablePagination) => {
    url.set(`${ns}.pagination`, next)
  }
  /** The reset rule: a changed query starts at page 0. */
  const resetPageIndex = () => {
    const current = pagination()
    if (current.pageIndex !== 0) setPagination({ ...current, pageIndex: 0 })
  }

  return {
    sorting,
    columnFilters,
    globalFilter,
    pagination,
    setSorting: (next) => {
      url.set(`${ns}.sorting`, next)
      resetPageIndex()
    },
    setColumnFilters: (next) => {
      url.set(`${ns}.columnFilters`, next as UrlStateValue)
      resetPageIndex()
    },
    setGlobalFilter: (next) => {
      url.set(`${ns}.globalFilter`, next)
      resetPageIndex()
    },
    setPageIndex: (pageIndex) => {
      setPagination({ ...pagination(), pageIndex })
    },
    setPageSize: (pageSize) => {
      const current = pagination()
      const size = Math.max(1, pageSize)
      const topRow = current.pageIndex * current.pageSize
      setPagination({
        pageIndex: Math.floor(topRow / size),
        pageSize: size,
      })
    },
    setPagination,
    key: (base = []) => [
      ...base,
      {
        sorting: sorting(),
        columnFilters: columnFilters(),
        globalFilter: globalFilter(),
        pagination: pagination(),
      },
    ],
  }
}

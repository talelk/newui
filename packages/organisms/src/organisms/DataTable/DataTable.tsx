import { Button, button, Checkbox, cn, TextInput } from '@talelk/newui-atoms'
import { createControllableSignal } from '@talelk/newui-atoms/internal'
import {
  card,
  Pagination,
  Popover,
  ScrollTable,
  ScrollTableHead,
} from '@talelk/newui-molecules'
import {
  type AggregationFnDef,
  aggregationFn_count,
  aggregationFn_extent,
  aggregationFn_first,
  aggregationFn_last,
  aggregationFn_max,
  aggregationFn_mean,
  aggregationFn_median,
  aggregationFn_min,
  aggregationFn_sum,
  aggregationFn_unique,
  aggregationFn_uniqueCount,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnSizingState,
  columnFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFilteredRowModel,
  createGroupedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  createTable,
  type ExpandedState,
  type ExpandedStateList,
  filterFn_arrHas,
  filterFn_arrIncludes,
  filterFn_arrIncludesAll,
  filterFn_arrIncludesSome,
  filterFn_between,
  filterFn_betweenInclusive,
  filterFn_empty,
  filterFn_endsWith,
  filterFn_equals,
  filterFn_equalsString,
  filterFn_equalsStringSensitive,
  filterFn_includesString,
  filterFn_includesStringSensitive,
  filterFn_inDateRange,
  filterFn_inNumberRange,
  filterFn_notEmpty,
  filterFn_startsWith,
  filterFn_weakEquals,
  flexRender,
  type GroupingState,
  globalFilteringFeature,
  type Header,
  type PaginationState,
  type Row,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  type SortingState,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type Updater,
} from '@tanstack/solid-table'
import { createVirtualizer } from '@tanstack/solid-virtual'
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  on,
  onCleanup,
  Show,
  untrack,
} from 'solid-js'
import { DataState } from '../DataState'
import { SelectionBar } from '../SelectionBar'
import { ColumnMenu } from './ColumnMenu'
import {
  ColumnFilter,
  type ColumnOps,
  ColumnResizeHandle,
  createHeaderDrag,
  type DataTableFilterFacet,
  moveColumnBy,
  moveColumnTo,
  orderedLeafIds,
  SizedCol,
} from './column-ops'

/**
 * The eleven aggregations a column can ask for by name. They are TanStack's
 * own, registered so the string a page writes resolves to the function that
 * computes it.
 */
const aggregationFns = {
  count: aggregationFn_count,
  extent: aggregationFn_extent,
  first: aggregationFn_first,
  last: aggregationFn_last,
  max: aggregationFn_max,
  mean: aggregationFn_mean,
  median: aggregationFn_median,
  min: aggregationFn_min,
  sum: aggregationFn_sum,
  unique: aggregationFn_unique,
  uniqueCount: aggregationFn_uniqueCount,
}

/**
 * Built on the first table, not when the module is evaluated.
 *
 * A page can import this entry for `ScrollTable` alone (the accounting ledger
 * does); if the feature set were a module-level `const`, evaluating the module
 * would build it — and rollup could not drop the table engine behind it.
 */
function createFeatures() {
  return tableFeatures({
    columnFilteringFeature,
    columnGroupingFeature,
    columnOrderingFeature,
    columnPinningFeature,
    columnResizingFeature,
    columnSizingFeature,
    columnVisibilityFeature,
    globalFilteringFeature,
    rowAggregationFeature,
    rowExpandingFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    expandedRowModel: createExpandedRowModel(),
    filteredRowModel: createFilteredRowModel(),
    groupedRowModel: createGroupedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortedRowModel: createSortedRowModel(),
    aggregationFns,
    sortFns: {
      alphanumeric: sortFn_alphanumeric,
      datetime: sortFn_datetime,
      text: sortFn_text,
    },
    // The eighteen built-ins, named the way TanStack names them: a column's
    // `filterFn` string resolves here. Global search never needed this map —
    // it uses core's own import — so the search box is unaffected.
    filterFns: {
      arrHas: filterFn_arrHas,
      arrIncludes: filterFn_arrIncludes,
      arrIncludesAll: filterFn_arrIncludesAll,
      arrIncludesSome: filterFn_arrIncludesSome,
      between: filterFn_between,
      betweenInclusive: filterFn_betweenInclusive,
      empty: filterFn_empty,
      endsWith: filterFn_endsWith,
      equals: filterFn_equals,
      equalsString: filterFn_equalsString,
      equalsStringSensitive: filterFn_equalsStringSensitive,
      inDateRange: filterFn_inDateRange,
      inNumberRange: filterFn_inNumberRange,
      includesString: filterFn_includesString,
      includesStringSensitive: filterFn_includesStringSensitive,
      notEmpty: filterFn_notEmpty,
      startsWith: filterFn_startsWith,
      weakEquals: filterFn_weakEquals,
    },
  })
}

type Features = ReturnType<typeof createFeatures>

/** A row as the table sees it: identity, sub-rows, and the state it carries. */
export type DataTableRow<T extends object> = Row<Features, T>

/** The eleven built-in aggregations, named the way TanStack names them. */
export type AggregationFnName =
  | 'count'
  | 'extent'
  | 'first'
  | 'last'
  | 'max'
  | 'mean'
  | 'median'
  | 'min'
  | 'sum'
  | 'unique'
  | 'uniqueCount'

/** Aggregates a column's values across one group's rows. */
export type AggregationFn<T extends object> = (rows: T[]) => unknown

/**
 * TanStack's column definition plus the two kit-level knobs that do not live
 * on its own options: `aggregate` (what the summary footer and grouped cells
 * compute) and `groupable` (whether the column may be grouped).
 */
export type DataTableColumn<T extends object> = ColumnDef<Features, T> & {
  /** Aggregation for this column's grouped cells and summary footer. */
  aggregate?: AggregationFnName | AggregationFn<T>
  /** Allow this column in `grouping`. Defaults to `true`. */
  groupable?: boolean
  /**
   * Render a filter button in the header that opens the control matching
   * this column's `filterFn`. The state is TanStack's `columnFilters` — the
   * same array server mode sends to the backend.
   */
  filterable?: boolean
}

/** Maps `aggregate` onto TanStack's `aggregationFn` option. */
function aggregationOption<T extends object>(
  aggregate: AggregationFnName | AggregationFn<T> | undefined,
): AggregationFnDef<Features, T> | AggregationFnName | undefined {
  if (aggregate === undefined) return undefined
  if (typeof aggregate === 'string') return aggregate
  return {
    aggregate: (context) => aggregate(context.rows.map((row) => row.original)),
  }
}

/**
 * Resolves the kit-level column knobs onto TanStack's options. Nested column
 * groups (multi-level headers) carry their leaves, so the walk recurses.
 */
function resolveColumns<T extends object>(
  columns: readonly DataTableColumn<T>[],
): ColumnDef<Features, T>[] {
  return columns.map((column) => {
    const nested = (column as { columns?: readonly DataTableColumn<T>[] })
      .columns
    const aggregate = aggregationOption(column.aggregate)
    const resolved: ColumnDef<Features, T> = {
      ...column,
      ...(aggregate === undefined ? {} : { aggregationFn: aggregate }),
      ...(column.groupable === undefined
        ? {}
        : { enableGrouping: column.groupable }),
      ...(nested ? { columns: resolveColumns(nested) } : {}),
    }
    return resolved
  })
}

/** Where a column appears in the mobile card, when `meta.mobile` is set. */
export type DataTableMobileRole =
  | 'title'
  | 'subtitle'
  | 'amount'
  | 'status'
  | 'meta'

/** The library reads `meta.align`, `meta.mobile` and `meta.editable`; all optional. */

/**
 * The accent rule on the leading edge of the row that holds keyboard focus:
 * an inset shadow, so it adds no width and survives the sticky first column.
 */
const ACTIVE_ROW_EDGE =
  'group-focus-within/row:shadow-[inset_2px_0_0_0_var(--outline-blue-6)]'

export interface DataTableColumnMeta {
  align?: 'end'
  mobile?: DataTableMobileRole
  /**
   * The cell edits in place when the table is `editable`. `editInput` picks
   * the editor (default `text`).
   */
  editable?: boolean
  editInput?: 'text' | 'number'
}

/** Which columns are frozen to each edge of the horizontal scroll. */
export interface DataTablePinned {
  start?: string[]
  end?: string[]
}

/** A column may be a single id or a list; the table normalizes to a list. */
export type DataTablePinValue = string | string[]

/**
 * Normalize one pin prop into a list of column ids. A bare `string` is the
 * single-pin form the table shipped before issue #20.
 */
function pinIds(value: DataTablePinValue | undefined): string[] {
  if (value === undefined) return []
  return Array.isArray(value) ? [...value] : [value]
}

export interface DataTableProps<T extends { id: string }> {
  title: string
  rows: T[]
  columns: DataTableColumn<T>[]
  actionLabel?: string
  onRowsAction?: (ids: string[]) => void
  /** Pages whose FilterBar owns search hide the table's own. */
  hideSearch?: boolean
  /** Selection checkboxes + bulk action. Default on; off for read tables. */
  selectable?: boolean
  /** Per-row eligibility; ineligible rows cannot be selected. */
  rowSelectable?: (row: T) => boolean
  /** Page-supplied context shown beside Search, e.g. "18 expenses · Sep 2026". */
  caption?: JSX.Element
  /** Skeleton state while the rows are in flight. */
  loading?: boolean
  /** Error state; the table is replaced by the shared DataState. */
  error?: JSX.Element
  onRetry?: () => void
  /**
   * Row height: `compact` (the default, about 28px rows) or `comfortable`
   * (about 36px) for touch-first or reading-heavy screens.
   */
  density?: 'comfortable' | 'compact'
  /** Width at which the table becomes cards. Default `sm` (640px). */
  cardBreakpoint?: 'sm' | 'md' | 'lg'
  /** Total or scope shown beside the count in the mobile selection bar. */
  selectionSummary?: (ids: string[]) => JSX.Element
  /**
   * Window the body: only the rows near the viewport stay mounted, measured
   * as they render so variable heights stay honest. The toolbar stays put and
   * the header stays sticky — the scroll region is the body. Off by default;
   * below the card breakpoint the card layout owns the surface and ignores
   * it. In server mode the page size stays the page size: the virtualiser
   * windows the current page's rows, nothing more.
   */
  virtual?: boolean
  pageSize?: number
  /** Footer noun: "32 transactions". Defaults to "records". */
  recordsLabel?: string
  emptyTitle?: string
  emptyHint?: string
  /** Empty-state reset for externally filtered pages (beats Clear search). */
  onClearFilters?: () => void
  /**
   * Freeze columns to the start edge of the horizontal scroll — the
   * identifiers that must stay visible while the rest move. One id or many;
   * controlled: changes go through `onPinnedColumnsChange`.
   */
  pinnedStart?: DataTablePinValue
  /** Freeze columns to the end edge — typically the row actions. */
  pinnedEnd?: DataTablePinValue
  defaultPinnedStart?: DataTablePinValue
  defaultPinnedEnd?: DataTablePinValue
  onPinnedColumnsChange?: (pinned: DataTablePinned) => void
  /**
   * Header operations: resize, reorder and the per-column menu. The state
   * they change is app-owned — `columnOrder`, `columnSizing` and the pin
   * props carry it out, and persistence belongs to `createTablePersist`.
   */
  columnOps?: ColumnOps
  /**
   * Server-provided facet counts for the filter popovers, keyed by column
   * id. No client faceting engine: counting over unknown-size data is a lie.
   */
  facets?: Record<string, DataTableFilterFacet[]>
  /** Controlled column order (leaf ids); changes report through the handler. */
  columnOrder?: ColumnOrderState
  onColumnOrderChange?: (order: ColumnOrderState) => void
  /** User-resized widths keyed by column id, in pixels. */
  columnSizing?: ColumnSizingState
  onColumnSizingChange?: (sizing: ColumnSizingState) => void
  /**
   * Turn on inline editing: columns whose `meta.editable` is set render a
   * click-to-edit cell. Values are app-owned — edits arrive through
   * `onCellChange`, and the table shows whatever the next `rows` carry.
   */
  editable?: boolean
  onCellChange?: (id: string, columnId: string, value: string) => void
  /**
   * Server mode: the backend owns sorting, filtering and pagination over the
   * whole result set, and `rows` is the current page. Presence of `server` is
   * the switch — the table stops deriving those axes from `rows` and mirrors
   * the app's state instead. `total` is the only count the table trusts;
   * `-1` means unknown, and the pager drives Next from `getCanNextPage()`.
   */
  server?: { total: number }
  /**
   * Row identity, defaulting to `row.id`. Required stable across requests in
   * server mode so selection survives paging.
   */
  getRowId?: (row: T) => string
  /** Controlled sorting slice; changes report through `onSortingChange`. */
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  /** Controlled column filters; the table reports, the app decides. */
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  /** Controlled search term (server mode). */
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  /** Controlled pagination slice. `pageSize` alone stays initial-only. */
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  /**
   * Column ids rows are grouped by, in order. Controlled: the table reports
   * through `onGroupingChange` and renders whatever the next `rows` carry.
   * In server mode the app echoes it back and rows arrive with `subRows`
   * populated — server grouping is real rows, not synthetic ones.
   */
  grouping?: GroupingState
  onGroupingChange?: (grouping: GroupingState) => void
  /**
   * What happens to a grouped column's own column: `reorder` (default) moves
   * it to the front, `remove` takes it out of the column list.
   */
  groupingMode?: 'reorder' | 'remove'
  /**
   * Override the default grouped cell — expander, column name, row count and
   * the aggregated values of the columns that ask for them.
   */
  renderGroupedCell?: (row: DataTableRow<T>) => JSX.Element
  /**
   * Footer row of totals: `page` aggregates the visible page, `all` the whole
   * filtered result. Defaults to `none`.
   */
  summary?: 'none' | 'page' | 'all'
  /**
   * Server-computed totals keyed by column id (server mode). Presence sets
   * `manualAggregation`: the table renders these and computes nothing.
   */
  aggregates?: Record<string, number>
  /** Nested data: a row's children, the same shape as `rows`. */
  getSubRows?: (row: T) => T[] | undefined
  /**
   * Detail panel rendered under an expanded row. Turns every row into one
   * that can expand, and the expander is the keyboard affordance.
   */
  renderDetail?: (row: T) => JSX.Element
  /**
   * Fires when a row expands, before its children are on screen — the hook
   * for server-side lazy children.
   */
  onRowExpand?: (row: T) => void
  /**
   * Filter tree data from its leaves: a parent survives because a descendant
   * matches, not because its own fields do.
   */
  filterFromLeafRows?: boolean
}

/**
 * A click-to-edit cell. Enter or blur commits; Escape cancels. The value is
 * the row's raw field, not the formatted render.
 */
function EditableCell(props: {
  id: string
  columnId: string
  value: string
  label: string
  type: 'text' | 'number'
  alignEnd: boolean
  onCommit: (id: string, columnId: string, value: string) => void
}): JSX.Element {
  const [editing, setEditing] = createSignal(false)
  // Seeded at open time (the trigger click), never read while closed.
  const [draft, setDraft] = createSignal('')
  const commit = (original: string) => {
    setEditing(false)
    const value = draft().trim()
    if (value !== original) props.onCommit(props.id, props.columnId, value)
  }
  return (
    <Show
      when={editing()}
      fallback={
        <button
          type="button"
          data-slot="data-table-edit-trigger"
          // The name leads with the visible text: a speech user saying what
          // they see must still land on this control.
          aria-label={`${props.value || '—'} — edit ${props.label} of ${props.id}`}
          class={cn(
            '-mx-1 w-full cursor-text rounded-3 px-1 py-0.5 text-start hover:bg-surface-gray-2 focus-visible:focus-ring',
            props.alignEnd && 'text-end',
          )}
          onClick={() => {
            setDraft(props.value)
            setEditing(true)
          }}
        >
          <Show
            when={props.value !== ''}
            fallback={<span class="text-ink-gray-5">—</span>}
          >
            {props.value}
          </Show>
        </button>
      }
    >
      <TextInput
        aria-label={`Edit ${props.label} of ${props.id}`}
        // The editor opens on the user's click; focus belongs there.
        ref={(el) => queueMicrotask(() => el.focus())}
        type={props.type}
        value={draft()}
        size="xs"
        onInput={(event) => setDraft(event.currentTarget.value)}
        onBlur={() => commit(props.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit(props.value)
          if (event.key === 'Escape') setEditing(false)
        }}
        class="min-w-0"
      />
    </Show>
  )
}

/**
 * The control that opens a row: children, or the detail panel. It is a button
 * so keyboard users reach expansion the same way they reach everything else,
 * and it carries no Escape handling — closing is the same click that opened.
 */
function Expander<T extends { id: string }>(props: {
  row: Row<Features, T>
  /** What the control names, defaulting to the row's own id. A synthetic
   *  group row has no id of its own, so the group value stands in. */
  label?: string
}): JSX.Element {
  return (
    <button
      type="button"
      data-slot="data-table-expander"
      aria-expanded={props.row.getIsExpanded()}
      aria-label={`Expand ${props.label ?? props.row.original.id}`}
      class="inline-flex size-6 shrink-0 items-center justify-center rounded-3 focus-visible:focus-ring hover:bg-surface-gray-2"
      onClick={() => props.row.toggleExpanded()}
    >
      <span
        aria-hidden="true"
        class={cn(
          'lucide-chevron-right size-4 transition-transform',
          props.row.getIsExpanded() && 'rotate-90',
        )}
      />
    </button>
  )
}

/**
 * A collection as a table: search, sort, page, hide columns, select rows,
 * pin one column to each scroll edge, edit cells in place, group rows,
 * total them, and open any row to its children or its detail.
 *
 * TanStack Table is the engine; this is the kit's composition of it. The surface
 * lives in `@talelk/newui-organisms`: it composes controls and owns the TanStack Table
 * engine. The headless `@talelk/newui-data` package remains independent of rendering.
 */
export function DataTable<T extends { id: string }>(
  props: DataTableProps<T>,
): JSX.Element {
  // Selection exists to feed the bulk action. A read table with no action
  // would render a checkbox that can never do anything.
  const selectable = () =>
    props.selectable !== false && props.onRowsAction !== undefined
  const selection: DataTableColumn<T> = {
    id: 'select',
    enableHiding: false,
    enableSorting: false,
    // The checkbox column is chrome, not data: it keeps a fixed width when the
    // table sizes its columns, and it is never resized or reordered.
    size: 44,
    minSize: 44,
    maxSize: 44,
    enableResizing: false,
    header: (context) => (
      <Checkbox
        aria-label="Select all rows on this page"
        checked={context.table.getIsAllPageRowsSelected()}
        indeterminate={context.table.getIsSomePageRowsSelected()}
        onCheckedChange={(value) =>
          context.table.toggleAllPageRowsSelected(value)
        }
      />
    ),
    cell: (context) => (
      <Checkbox
        aria-label={`Select ${context.row.original.id}`}
        checked={context.row.getIsSelected()}
        disabled={!context.row.getCanSelect()}
        onCheckedChange={(value) => context.row.toggleSelected(value)}
      />
    ),
  }
  const resolvedColumns = createMemo(() =>
    resolveColumns(
      selectable() ? [selection, ...props.columns] : props.columns,
    ),
  )
  const [pinned, setPinned] = createControllableSignal<DataTablePinned>({
    value: () =>
      props.pinnedStart === undefined && props.pinnedEnd === undefined
        ? undefined
        : {
            start: pinIds(props.pinnedStart),
            end: pinIds(props.pinnedEnd),
          },
    defaultValue: {
      start: pinIds(props.defaultPinnedStart),
      end: pinIds(props.defaultPinnedEnd),
    },
    onChange: (next) => props.onPinnedColumnsChange?.(next),
  })
  /**
   * The pinning slice, kept reference-stable. The state getter is read on
   * every unrelated state change (TanStack syncs each slice back into its
   * atom), and a fresh `{start, end}` object each time would rewrite the
   * pinning atom and rebuild the header groups — which throws away the
   * resize handle's focus mid-keyboard-resize.
   */
  const columnPinningState = createMemo(() => {
    const pinnedValue = pinned()
    return {
      start: pinnedValue.start ?? [],
      end: pinnedValue.end ?? [],
    }
  })
  // ── server mode ────────────────────────────────────────────────────────
  // `server` presence is the switch: the table mirrors the slices the app
  // owns and lets TanStack's `manual*` flags stop the row models from
  // re-deriving what the backend already decided. In client mode none of
  // this is wired, so the engine keeps today's behavior untouched.
  const serverMode = () => props.server !== undefined
  const serverTotal = () => props.server?.total ?? 0
  const totalKnown = () => serverTotal() >= 0
  const [sortingSlice, setSortingSlice] =
    createControllableSignal<SortingState>({
      value: () => props.sorting,
      defaultValue: [],
      onChange: (next) => props.onSortingChange?.(next),
    })
  const [columnFiltersSlice, setColumnFiltersSlice] =
    createControllableSignal<ColumnFiltersState>({
      value: () => props.columnFilters,
      defaultValue: [],
      onChange: (next) => props.onColumnFiltersChange?.(next),
    })
  const [globalFilterSlice, setGlobalFilterSlice] =
    createControllableSignal<string>({
      value: () => props.globalFilter,
      defaultValue: '',
      onChange: (next) => props.onGlobalFilterChange?.(next),
    })
  /**
   * The page size the table starts on. A virtualised body defaults to one
   * page of the whole result — the window, not pagination, is what bounds the
   * DOM — while an explicit `pageSize` still wins and server mode keeps the
   * page size the backend was queried with.
   */
  const defaultPageSize = () =>
    untrack(() => props.pageSize) ??
    (props.virtual === true ? Number.MAX_SAFE_INTEGER : 10)
  const [paginationSlice, setPaginationSlice] =
    createControllableSignal<PaginationState>({
      value: () => props.pagination,
      defaultValue: {
        pageIndex: 0,
        pageSize: defaultPageSize(),
      },
      onChange: (next) => props.onPaginationChange?.(next),
    })
  // Grouping is controllable in both modes: the table reports, the app owns
  // the list. In server mode the app echoes it back and the rows it sends
  // carry their own sub-rows, so `manualGrouping` stops the engine from
  // re-deriving groups the backend already made.
  const [groupingSlice, setGroupingSlice] =
    createControllableSignal<GroupingState>({
      value: () => props.grouping,
      defaultValue: [],
      onChange: (next) => props.onGroupingChange?.(next),
    })
  /**
   * Column order and user-resized widths: the two pieces of layout a reader
   * owns. Both stay app state — the table reports, the app (or the config
   * store behind `createTablePersist`) decides.
   */
  const [columnOrderSlice, setColumnOrderSlice] =
    createControllableSignal<ColumnOrderState>({
      value: () => props.columnOrder,
      defaultValue: [],
      onChange: (next) => props.onColumnOrderChange?.(next),
    })
  const [columnSizingSlice, setColumnSizingSlice] =
    createControllableSignal<ColumnSizingState>({
      value: () => props.columnSizing,
      defaultValue: {},
      onChange: (next) => props.onColumnSizingChange?.(next),
    })
  /**
   * Expanded rows live here so the expander can fire `onRowExpand` before the
   * children arrive. The slice is what the engine reads, so flattening
   * sub-rows into view stays TanStack's job.
   */
  const [expandedSlice, setExpandedSlice] = createControllableSignal<
    ExpandedState | undefined
  >({
    defaultValue: {},
  })
  /**
   * A row that opens is the signal to go fetch its children; a row that
   * closes is not. Comparing the two id maps is what keeps the callback off
   * every unrelated state change.
   */
  const handleExpandedChange = (updater: Updater<ExpandedState>) => {
    const current: ExpandedState | undefined = expandedSlice()
    const before: ExpandedStateList =
      current === undefined || current === true ? {} : current
    const after =
      typeof updater === 'function'
        ? (updater as (old: ExpandedState) => ExpandedState)(before)
        : updater
    setExpandedSlice(after)
    if (!props.onRowExpand) return
    const wasOpen = (id: string) => after !== true && before[id] === true
    if (after === true) {
      // `true` means "every row": the ones that were closed just opened.
      for (const row of table.getCoreRowModel().flatRows) {
        if (!wasOpen(row.id)) props.onRowExpand(row.original)
      }
      return
    }
    for (const [id, open] of Object.entries(after)) {
      if (!open || wasOpen(id)) continue
      const row = table.getRow(id)
      if (row) props.onRowExpand(row.original)
    }
  }
  /**
   * TanStack routes every state change through `setStateSlice`, handing the
   * handler a resolver of the current value. The slices above are the source
   * of truth in server mode, so the resolver is applied to the signal, not to
   * the table's internal atoms.
   */
  const applySlice = <S,>(
    get: () => S,
    set: (next: S) => void,
    updater: Updater<S>,
  ): boolean => {
    const current = get()
    const next =
      typeof updater === 'function'
        ? (updater as (old: S) => S)(current)
        : updater
    if (next === current) return false
    set(next)
    return true
  }
  /** The reset rule: a changed query starts over at page 0. */
  const resetPageIndex = () => {
    if (paginationSlice().pageIndex !== 0) table.setPageIndex(0)
  }
  const handleSortingChange = (updater: Updater<SortingState>) => {
    if (applySlice(sortingSlice, setSortingSlice, updater)) resetPageIndex()
  }
  const handleColumnFiltersChange = (updater: Updater<ColumnFiltersState>) => {
    if (applySlice(columnFiltersSlice, setColumnFiltersSlice, updater))
      resetPageIndex()
  }
  const handleGlobalFilterChange = (updater: Updater<string | undefined>) => {
    // `resetGlobalFilter` hands over `undefined`; the store's empty string is
    // the same "no search" the input shows, so normalize before comparing.
    const current = globalFilterSlice()
    const next =
      (typeof updater === 'function'
        ? (updater as (old: string) => string)(current)
        : updater) ?? ''
    if (next === current) return
    setGlobalFilterSlice(next)
    resetPageIndex()
  }
  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    applySlice(paginationSlice, setPaginationSlice, updater)
  }
  const editable = () =>
    props.editable === true && props.onCellChange !== undefined
  const editMeta = (meta: unknown) => {
    const columnMeta = meta as DataTableColumnMeta | undefined
    return columnMeta?.editable === true
      ? { input: columnMeta.editInput ?? 'text' }
      : undefined
  }
  /** Which edge (if any) a column id is frozen to. */
  const pinOf = (columnId: string): 'start' | 'end' | undefined => {
    if (pinned().start?.includes(columnId)) return 'start'
    if (pinned().end?.includes(columnId)) return 'end'
    return undefined
  }
  /** Move one column's pin, keeping each edge a list and the other edge as-is. */
  const pinColumn = (
    columnId: string,
    edge: 'start' | 'end' | 'unpin',
  ): void => {
    const current = pinned()
    const start = (current.start ?? []).filter((id) => id !== columnId)
    const end = (current.end ?? []).filter((id) => id !== columnId)
    if (edge === 'start') start.push(columnId)
    if (edge === 'end') end.push(columnId)
    setPinned({ start, end })
  }
  /** Sticky cell chrome: opaque card surface over the scrolling columns. */
  const pinClass = (edge: 'start' | 'end' | undefined) =>
    edge === 'start'
      ? 'sticky start-0 z-raised bg-surface-elevation-1 group-hover/row:bg-surface-gray-1 group-focus-within/row:bg-surface-blue-1 data-[selected]:bg-surface-blue-1 data-[selected]:group-hover/row:bg-surface-blue-2 border-e border-outline-gray-1'
      : edge === 'end'
        ? 'sticky end-0 z-raised bg-surface-elevation-1 group-hover/row:bg-surface-gray-1 group-focus-within/row:bg-surface-blue-1 data-[selected]:bg-surface-blue-1 data-[selected]:group-hover/row:bg-surface-blue-2 border-s border-outline-gray-1'
        : ''
  const table = createTable<Features, T>({
    features: createFeatures(),
    get data() {
      return props.rows
    },
    get columns() {
      return resolvedColumns()
    },
    get state() {
      const shared = {
        columnPinning: columnPinningState(),
        columnOrder: columnOrderSlice(),
        columnSizing: columnSizingSlice(),
        // The per-column filters live in this slice in both modes: TanStack's
        // `setStateSlice` writes nothing itself once the app supplies the
        // handler, so owning it here is what makes the header control filter
        // in client mode and mirror the app in server mode.
        columnFilters: columnFiltersSlice(),
        grouping: groupingSlice(),
        expanded: expandedSlice() ?? {},
      }
      if (!serverMode()) return shared
      return {
        ...shared,
        sorting: sortingSlice(),
        globalFilter: globalFilterSlice(),
        pagination: paginationSlice(),
      }
    },
    getRowId: (row) => props.getRowId?.(row) ?? row.id,
    get getSubRows() {
      return props.getSubRows
    },
    /**
     * A row can expand when it has children, and also when the page asked for
     * a detail panel — the panel is the payload of that expansion.
     */
    get getRowCanExpand() {
      return (row: Row<Features, T>) =>
        row.subRows.length > 0 || props.renderDetail !== undefined
    },
    get enableRowSelection() {
      return (row: Row<Features, T>) =>
        props.rowSelectable?.(row.original) ?? true
    },
    initialState: {
      // Initial only: later pageSize changes do not repaginate the table.
      pagination: {
        pageIndex: 0,
        pageSize: defaultPageSize(),
      },
    },
    // Server mode (issue #18): the `manual*` flags are TanStack's own
    // vocabulary for "this axis happens outside the table". The row-model
    // getters above then return the current page as-is, and the controlled
    // slices carry the app's state. `pageCount` drives clamping and the
    // pager; `-1` is the engine's own "unknown".
    get manualSorting() {
      return serverMode()
    },
    get manualFiltering() {
      return serverMode()
    },
    get manualPagination() {
      return serverMode()
    },
    /**
     * Server grouping is real rows, not synthetic ones: the backend returned
     * the groups, so the engine must not re-derive them.
     */
    get manualGrouping() {
      return serverMode()
    },
    /** Totals the backend computed are totals the table renders verbatim. */
    get manualAggregation() {
      return props.aggregates !== undefined
    },
    /** Expanded rows are paginated with their parents, so a page holds them. */
    get paginateExpandedRows() {
      return true
    },
    get filterFromLeafRows() {
      return props.filterFromLeafRows === true
    },
    get groupedColumnMode() {
      return props.groupingMode ?? 'reorder'
    },
    get pageCount() {
      if (!serverMode()) return undefined
      if (!totalKnown()) return -1
      return Math.max(1, Math.ceil(serverTotal() / paginationSlice().pageSize))
    },
    onGroupingChange: (updater) => {
      if (applySlice(groupingSlice, setGroupingSlice, updater)) resetPageIndex()
    },
    // Layout axes: reported like every other slice, but a reorder or a resize
    // changes no rows, so it never resets the page.
    onColumnOrderChange: (updater) => {
      applySlice(columnOrderSlice, setColumnOrderSlice, updater)
    },
    onColumnSizingChange: (updater) => {
      applySlice(columnSizingSlice, setColumnSizingSlice, updater)
    },
    onExpandedChange: handleExpandedChange,
    // The per-column filters are reported in both modes: the header control
    // writes them in client mode, the app owns them in server mode. Either way
    // the slice above is the source, so a filter change always starts over.
    onColumnFiltersChange: handleColumnFiltersChange,
    ...(serverMode()
      ? {
          onSortingChange: handleSortingChange,
          onGlobalFilterChange: handleGlobalFilterChange,
          onPaginationChange: handlePaginationChange,
        }
      : {}),
  })
  // Externally filtered pages hand over a new row set per filter change;
  // staying on page 3 of a 6-row result would show an empty page. In server
  // mode the churn is the paging — every page change arrives as new rows —
  // so the page index belongs to the slices, not to this effect.
  createEffect(
    on(
      () => props.rows,
      () => {
        if (!serverMode()) table.setPageIndex(0)
      },
      { defer: true },
    ),
  )
  /**
   * The page's rows. The filter atom is read here as well as through the row
   * model: the model caches, so a `columnFilters` change that no JSX reads
   * would leave the body showing the previous result.
   */
  const pageRows = createMemo(() => {
    table.atoms.columnFilters.get()
    return table.getRowModel().rows
  })
  const opsActive = () => props.columnOps !== undefined
  /** A column opts into a header filter button with `filterable`. */
  const filterableOf = (column: { columnDef: unknown }): boolean =>
    (column.columnDef as DataTableColumn<T>).filterable === true
  const resizable = () => props.columnOps?.resizable === true
  const reorderable = () => props.columnOps?.reorderable === true
  const menuEnabled = () =>
    props.columnOps !== undefined && props.columnOps.menu !== false
  /**
   * Header pointer-drag: drop before the header whose midpoint the pointer
   * crosses. The order is TanStack's `columnOrder` — the same vocabulary the
   * menu's Move entries write.
   */
  const drag = createHeaderDrag({
    enabled: reorderable,
    order: () => orderedLeafIds(table),
    move: (id, targetId) => moveColumnTo(table, id, targetId),
  })
  /**
   * Sticky cells that need a pin inset. One pin per edge sits at the edge —
   * the class does that. Two or more need the measured offset, so cells are
   * tracked and written imperatively (the `style` prop is not the idiom).
   */
  const stickyCells = new Map<string, Set<HTMLElement>>()
  const stickyHeaders = new Map<string, HTMLElement>()
  const insetApplied = new Set<string>()
  const trackCell = (columnId: string, el: HTMLElement | undefined): void => {
    if (!el) return
    let cells = stickyCells.get(columnId)
    if (!cells) {
      cells = new Set()
      stickyCells.set(columnId, cells)
    }
    cells.add(el)
  }
  const widthOf = (columnId: string): number => {
    const rect = stickyHeaders.get(columnId)?.getBoundingClientRect()
    if (rect && rect.width > 0) return rect.width
    const column = table.getColumn(columnId)
    return column ? column.getSize() : 150
  }
  const setInset = (
    columnId: string,
    edge: 'start' | 'end',
    px: number | undefined,
  ): void => {
    const property =
      edge === 'start' ? 'inset-inline-start' : 'inset-inline-end'
    const cells = stickyCells.get(columnId)
    if (!cells) return
    for (const cell of cells) {
      if (!cell.isConnected) cells.delete(cell)
      else if (px === undefined) cell.style.removeProperty(property)
      else cell.style.setProperty(property, `${px}px`)
    }
  }
  createEffect(() => {
    const pin = pinned()
    columnSizingSlice()
    const visible = table.getVisibleLeafColumns().map((column) => column.id)
    const union = new Set([...(pin.start ?? []), ...(pin.end ?? [])])
    for (const id of [...insetApplied]) {
      if (union.has(id)) continue
      setInset(id, 'start', undefined)
      setInset(id, 'end', undefined)
      insetApplied.delete(id)
    }
    const applyEdge = (edge: 'start' | 'end', pinnedIds: string[]): void => {
      const ordered = pinnedIds
        .filter((id) => visible.includes(id))
        .sort((a, b) => visible.indexOf(a) - visible.indexOf(b))
      if (ordered.length < 2) {
        // Single pin: the class pins it to the edge; drop any stale inset.
        for (const id of ordered) {
          setInset(id, edge, undefined)
          insetApplied.delete(id)
        }
        return
      }
      if (edge === 'start') {
        let offset = 0
        for (const id of ordered) {
          setInset(id, 'start', offset)
          insetApplied.add(id)
          offset += widthOf(id)
        }
        return
      }
      let offset = 0
      for (let index = ordered.length - 1; index >= 0; index -= 1) {
        const id = ordered[index] as string
        setInset(id, 'end', offset)
        insetApplied.add(id)
        offset += widthOf(id)
      }
    }
    applyEdge('start', pin.start ?? [])
    applyEdge('end', pin.end ?? [])
  })
  const alignEnd = (meta: unknown): boolean =>
    (meta as DataTableColumnMeta | undefined)?.align === 'end'
  const mobileRole = (meta: unknown) =>
    (meta as DataTableColumnMeta | undefined)?.mobile
  const hasMobileCards = createMemo(() =>
    props.columns.some((column) => mobileRole(column.meta)),
  )
  /** The empty row spans every cell the page renders, checkbox included. */
  const emptyColSpan = () =>
    table.getVisibleLeafColumns().length + (selectable() ? 1 : 0)
  // `flatRows`, not `rows`: a tree row can be selected under a parent that is
  // not, and the bulk action must still see it.
  const selected = () =>
    table.getFilteredSelectedRowModel().flatRows.map((row) => row.original.id)
  const status = () =>
    props.loading
      ? ('loading' as const)
      : props.error
        ? ('error' as const)
        : ('ready' as const)
  const runAction = () => {
    props.onRowsAction?.(selected())
    table.resetRowSelection()
  }
  const cellPad = () =>
    props.density === 'comfortable'
      ? 'px-table-cell-x py-2'
      : 'px-table-cell-x py-table-cell-y'
  const cardHiddenClass = () =>
    props.cardBreakpoint === 'lg'
      ? 'lg:hidden'
      : props.cardBreakpoint === 'md'
        ? 'md:hidden'
        : 'sm:hidden'
  const tableHiddenClass = () =>
    props.cardBreakpoint === 'lg'
      ? 'hidden lg:block'
      : props.cardBreakpoint === 'md'
        ? 'hidden md:block'
        : 'hidden sm:block'
  const emptyAction = () => {
    // Do not offer to reset a filter this table does not own. With `hideSearch`
    // the page's FilterBar is the only reset path, so it must provide one.
    if (props.hideSearch && !props.onClearFilters) return undefined
    return (
      <Button
        onClick={() => {
          if (props.onClearFilters) props.onClearFilters()
          else table.resetGlobalFilter()
        }}
      >
        {props.onClearFilters ? 'Reset filters' : 'Clear search'}
      </Button>
    )
  }
  /**
   * The table's own controls. The toolbar is stable at every width: when an
   * external FilterBar owns search and there is no caption, the table title
   * fills the space, so a selection never inserts a row or moves the menu.
   */
  const pageCount = () =>
    serverMode()
      ? totalKnown()
        ? Math.max(1, Math.ceil(serverTotal() / paginationSlice().pageSize))
        : Number.POSITIVE_INFINITY
      : Math.max(
          1,
          Math.ceil(
            table.getFilteredRowModel().rows.length /
              table.atoms.pagination.get().pageSize,
          ),
        )
  /** Zag's page count derives from a row count, so unknown total needs a floor. */
  const pagerCount = () => {
    if (!serverMode()) return table.getFilteredRowModel().rows.length
    if (totalKnown()) return serverTotal()
    const { pageIndex, pageSize } = paginationSlice()
    return (pageIndex + 2) * pageSize
  }
  const columnLabel = (column: {
    id: string
    columnDef: { header?: unknown }
  }) =>
    typeof column.columnDef.header === 'string'
      ? column.columnDef.header
      : column.id
  /**
   * The header's own content: the sort button, or the definition's header
   * verbatim. Column operations wrap around it; they never replace it.
   */
  const headerContent = (header: Header<Features, T>): JSX.Element => (
    <Show
      when={header.column.getCanSort()}
      fallback={flexRender(header.column.columnDef.header, header.getContext())}
    >
      <button
        type="button"
        class="group/sort inline-flex items-center gap-1 rounded-3 focus-visible:focus-ring"
        onClick={header.column.getToggleSortingHandler()}
      >
        {flexRender(header.column.columnDef.header, header.getContext())}
        <span aria-hidden="true">
          <span
            aria-hidden="true"
            class={cn(
              'inline-block size-3.5 align-middle',
              header.column.getIsSorted() === 'asc'
                ? 'lucide-arrow-up text-ink-gray-9'
                : header.column.getIsSorted() === 'desc'
                  ? 'lucide-arrow-down text-ink-gray-9'
                  : 'lucide-arrow-up-down text-ink-gray-4 group-hover/sort:text-ink-gray-7',
            )}
          />
        </span>
      </button>
    </Show>
  )
  const columnMenu = () => (
    <div data-slot="data-table-columns" class="max-sm:hidden">
      <Popover.Root>
        <Popover.Trigger class={button({ variant: 'outline', size: 'sm' })}>
          Columns
        </Popover.Trigger>
        <Popover.Content>
          <div class="flex min-w-44 flex-col gap-2 p-1">
            <For
              each={table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide())}
            >
              {(column) => (
                <Checkbox
                  label={columnLabel(column)}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(value)}
                />
              )}
            </For>
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  )
  /**
   * Rows that stand for a group rather than a record: TanStack's synthetic
   * grouped rows, and in server mode the real rows the backend grouped.
   */
  const isGroupRow = (row: Row<Features, T>) =>
    row.getIsGrouped() ||
    (serverMode() &&
      groupingSlice().length > 0 &&
      row.subRows.length > 0 &&
      row.parentId === undefined)
  /** How many records sit under one group row, counting through nesting. */
  const groupRowCount = (row: Row<Features, T>): number =>
    row.subRows.length === 0
      ? 1
      : row.subRows.reduce((total, sub) => total + groupRowCount(sub), 0)
  /** The grouped column's header text, so the cell names what it groups. */
  const groupColumnLabel = (row: Row<Features, T>) => {
    const columnId = row.groupingColumnId ?? groupingSlice()[0]
    const column = columnId ? table.getColumn(columnId) : undefined
    return column ? columnLabel(column) : (columnId ?? '')
  }
  /** The value every row in the group shares. A server-grouped row carries
   *  no `groupingValue`, so the grouped column's own value stands in. */
  const groupValue = (row: Row<Features, T>) =>
    row.groupingValue ??
    row.getValue(row.groupingColumnId ?? groupingSlice()[0] ?? '')
  /** Aggregated values a grouped cell shows next to the count. */
  const aggregatedCells = (row: Row<Features, T>) =>
    row.getVisibleCells().filter((cell) => cell.getIsAggregated?.() === true)
  const spanCells = () =>
    table.getVisibleLeafColumns().filter((column) => column.id !== 'select')
      .length
  // ── virtualized body (issue #21) ───────────────────────────────────────
  // The windowing virtualiser measures what it mounts, so a wrapped title and
  // a one-liner cost what they actually take. What it windows is `bodyUnits`
  // — one item per `<tr>` the body renders — so groups, expanded children
  // and detail panels are all accounted for without the virtualiser learning
  // about any of them.
  const virtualOn = () => props.virtual === true
  /**
   * The body's row model: every entry is one `<tr>`. Group rows and records
   * come from the flattened page model — expanded children included — and a
   * detail panel is the row under the one it describes.
   */
  type BodyUnit = {
    index: number
    key: string
    row: Row<Features, T>
    kind: 'group' | 'record' | 'detail'
  }
  const bodyUnits = createMemo((): BodyUnit[] => {
    const units: BodyUnit[] = []
    for (const row of pageRows()) {
      const grouped = isGroupRow(row)
      units.push({
        index: units.length,
        key: row.id,
        row,
        kind: grouped ? 'group' : 'record',
      })
      if (props.renderDetail !== undefined && row.getIsExpanded() && !grouped)
        units.push({
          index: units.length,
          key: `${row.id}:detail`,
          row,
          kind: 'detail',
        })
    }
    return units
  })
  const [scrollEl, setScrollEl] = createSignal<HTMLElement | undefined>()
  const [headerSize, setHeaderSize] = createSignal(0)
  /**
   * The scroll region owns a header that eats part of it. `scrollMargin` is
   * that header's height: without it the window sits a header above what is
   * actually on screen, and the first rows blank out at the top edge.
   */
  createEffect(() => {
    const el = scrollEl()
    if (!el) return
    const head = el.querySelector('thead')
    setHeaderSize(head ? head.getBoundingClientRect().height : 0)
    const observer = new ResizeObserver(() => {
      const current = el.querySelector('thead')
      setHeaderSize(current ? current.getBoundingClientRect().height : 0)
    })
    if (head) observer.observe(head)
    onCleanup(() => observer.disconnect())
  })
  const virtualizer = createVirtualizer<HTMLElement, HTMLTableRowElement>({
    get count() {
      return virtualOn() ? bodyUnits().length : 0
    },
    getScrollElement: () =>
      scrollEl()?.isConnected ? (scrollEl() ?? null) : null,
    estimateSize: () => (props.density === 'comfortable' ? 38 : 30),
    overscan: 8,
    get scrollMargin() {
      return headerSize()
    },
    getItemKey: (index) => bodyUnits()[index]?.key ?? String(index),
  })
  /** The rows inside the window, in order. Off, the whole page is "windowed". */
  const renderedUnits = createMemo((): BodyUnit[] => {
    const units = bodyUnits()
    if (!virtualOn()) return units
    return virtualizer
      .getVirtualItems()
      .map((item) => units[item.index])
      .filter((unit): unit is BodyUnit => unit !== undefined)
  })
  /**
   * The gap the window leaves above and below itself, as spacer rows. Item
   * starts include `scrollMargin`; the header is already in the DOM, so the
   * spacer subtracts it back out.
   */
  const topSpacer = () => {
    const first = virtualizer.getVirtualItems()[0]
    return first ? Math.max(0, first.start - headerSize()) : 0
  }
  const bottomSpacer = () => {
    const items = virtualizer.getVirtualItems()
    const last = items[items.length - 1]
    if (!last) return 0
    return Math.max(0, virtualizer.getTotalSize() + headerSize() - last.end)
  }
  /**
   * A body row's ref: the virtualiser measures what it mounts, and
   * `data-index` is how the element finds its item again.
   */
  const measureRow = (
    unit: BodyUnit,
    el: HTMLTableRowElement | undefined,
  ): void => {
    if (!el || !virtualOn()) return
    el.setAttribute('data-index', String(unit.index))
    virtualizer.measureElement(el)
  }
  /** The gap the window leaves at either edge — a row, not a positioned div. */
  const SpacerRow = (spacerProps: { height: number }): JSX.Element => (
    <tr data-slot="data-table-spacer">
      <td
        colspan={spanCells()}
        class="border-0 p-0"
        style={{ height: `${spacerProps.height}px` }}
      />
    </tr>
  )
  /**
   * A group row reads as a drawer pulled out from behind the records: the
   * recessed surface, the expander as the keyboard affordance, and the count
   * the group exists to summarize.
   */
  const groupRow = (
    row: Row<Features, T>,
    ref?: (el: HTMLTableRowElement | undefined) => void,
  ) => (
    <tr
      ref={ref}
      data-slot="data-table-group-row"
      class="group/row border-b border-outline-gray-1 bg-surface-gray-1 hover:bg-surface-gray-2"
    >
      <td colspan={spanCells()} class={cn(cellPad(), 'text-interface')}>
        <Show
          when={props.renderGroupedCell}
          fallback={
            <div class="flex flex-wrap items-center gap-2">
              <Expander row={row} label={String(groupValue(row))} />
              <span class="font-medium">{groupColumnLabel(row)}</span>
              <span class="text-ink-gray-7">{String(groupValue(row))}</span>
              <span class="text-caption text-ink-gray-7 tabular-nums">
                {groupRowCount(row)}
              </span>
              <For each={aggregatedCells(row)}>
                {(cell) => (
                  <span class="text-caption text-ink-gray-7 tabular-nums">
                    {columnLabel(cell.column)}: {String(cell.getValue())}
                  </span>
                )}
              </For>
            </div>
          }
        >
          {props.renderGroupedCell?.(row)}
        </Show>
      </td>
    </tr>
  )
  /** The detail panel, spanning the record's own columns. */
  const detailRow = (
    row: Row<Features, T>,
    ref?: (el: HTMLTableRowElement | undefined) => void,
  ) => (
    <tr ref={ref} data-slot="data-table-detail">
      <td
        colspan={spanCells()}
        class={cn(cellPad(), 'bg-surface-gray-1 text-interface')}
      >
        {props.renderDetail?.(row.original)}
      </td>
    </tr>
  )
  /** A record row: its cells, the expander when it opens, the pin chrome. */
  const recordRow = (
    row: Row<Features, T>,
    ref?: (el: HTMLTableRowElement | undefined) => void,
  ): JSX.Element => (
    <tr
      ref={ref}
      data-slot="data-table-row"
      class="group/row border-b border-outline-gray-1 hover:bg-surface-gray-1 focus-within:bg-surface-blue-1 data-[selected]:bg-surface-blue-1 data-[selected]:hover:bg-surface-blue-2"
      data-selected={row.getIsSelected() ? '' : undefined}
    >
      <For each={row.getVisibleCells()}>
        {(cell, index) => {
          const edge = pinOf(cell.column.id)
          const editingMeta = editable()
            ? editMeta(cell.column.columnDef.meta)
            : undefined
          const raw = (row.original as Record<string, unknown>)[cell.column.id]
          return (
            <td
              ref={(el) => trackCell(cell.column.id, el)}
              class={cn(
                alignEnd(cell.column.columnDef.meta)
                  ? `${cellPad()} text-end text-interface`
                  : `${cellPad()} text-interface`,
                pinClass(edge),
                // The active row — the one holding keyboard focus — carries
                // the accent rule on its leading edge.
                index() === 0 && ACTIVE_ROW_EDGE,
              )}
              data-selected={row.getIsSelected() ? '' : undefined}
              data-column={cell.column.id}
              data-pin-edge={edge}
            >
              {/* The first cell of a row that opens carries the expander, so
                  keyboard users reach it. */}
              <Show
                when={
                  index() === 0 &&
                  (row.subRows.length > 0 || props.renderDetail !== undefined)
                }
              >
                <span class="me-1 inline-flex align-middle">
                  <Expander row={row} />
                </span>
              </Show>
              <Show
                when={editingMeta}
                fallback={flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext(),
                )}
              >
                <EditableCell
                  id={row.original.id}
                  columnId={cell.column.id}
                  value={raw == null ? '' : String(raw)}
                  label={columnLabel(
                    cell.column as unknown as {
                      id: string
                      columnDef: { header?: unknown }
                    },
                  )}
                  type={editingMeta?.input === 'number' ? 'number' : 'text'}
                  alignEnd={alignEnd(cell.column.columnDef.meta)}
                  onCommit={props.onCellChange ?? (() => {})}
                />
              </Show>
            </td>
          )
        }}
      </For>
    </tr>
  )
  /**
   * The summary row's value for one column: the server's total when it sent
   * one, otherwise the aggregation over exactly the rows this summary covers.
   */
  const summaryValue = (columnId: string): unknown => {
    const totals = props.aggregates
    if (totals !== undefined) return totals[columnId]
    if (props.summary !== 'page' && props.summary !== 'all') return undefined
    const column = table.getColumn(columnId)
    if (!column) return undefined
    return props.summary === 'page'
      ? column.getAggregationValue({
          rows: table.getRowModel().rows,
          maxDepth: Number.POSITIVE_INFINITY,
        })
      : column.getAggregationValue({
          rows: table.getFilteredRowModel().rows,
          maxDepth: Number.POSITIVE_INFINITY,
        })
  }
  const hasSummary = () => props.summary === 'page' || props.summary === 'all'
  const summaryRow = () => (
    <tfoot>
      <tr data-slot="data-table-summary">
        <For
          each={table
            .getVisibleLeafColumns()
            .filter((column) => column.id !== 'select')}
        >
          {(column) => (
            <td
              class={cn(
                alignEnd(column.columnDef.meta)
                  ? `${cellPad()} text-end text-interface`
                  : `${cellPad()} text-interface`,
                'border-t border-outline-gray-1 font-medium',
              )}
            >
              <Show when={summaryValue(column.id) !== undefined}>
                {String(summaryValue(column.id))}
              </Show>
            </td>
          )}
        </For>
      </tr>
    </tfoot>
  )
  return (
    <section
      class={cn(card({ padding: 'none' }), 'block min-w-0')}
      aria-label={props.title}
      data-slot="data-table"
    >
      <div
        data-slot="data-table-toolbar"
        class="flex flex-wrap items-center justify-between gap-control-gap px-3 py-1.5"
      >
        <Show when={!props.hideSearch}>
          <div class="w-full sm:w-72">
            <TextInput
              type="search"
              aria-label={`Search ${props.title.toLowerCase()}`}
              placeholder={`Search ${props.title.toLowerCase()}…`}
              value={String(table.atoms.globalFilter.get() ?? '')}
              onInput={(event) => {
                table.setGlobalFilter(event.currentTarget.value)
                table.setPageIndex(0)
              }}
            />
          </div>
        </Show>
        <Show when={props.caption}>
          <p class="min-w-0 text-caption text-ink-gray-7">{props.caption}</p>
        </Show>
        <Show when={props.hideSearch && !props.caption}>
          <span class="min-w-0 text-interface-medium text-ink-gray-9">
            {props.title}
          </span>
        </Show>
        <div class="ms-auto flex flex-wrap items-center gap-2">
          <Show when={props.onRowsAction && selected().length}>
            <span class="text-caption text-ink-gray-7 tabular-nums">
              {props.selectionSummary?.(selected())}
            </span>
            <Button variant="outline" class="max-sm:hidden" onClick={runAction}>
              {props.actionLabel ?? 'Update selected'} ({selected().length})
            </Button>
          </Show>
          {columnMenu()}
        </div>
      </div>
      <Show
        when={status() === 'ready'}
        fallback={
          <DataState
            status={status()}
            error={props.error}
            onRetry={props.onRetry}
            rows={6}
          />
        }
      >
        <Show when={hasMobileCards() && table.getRowModel().rows.length > 0}>
          <div
            data-slot="data-table-cards"
            class={`flex flex-col gap-2 p-card-pad-compact ${cardHiddenClass()}`}
          >
            {/* The bulk row earns its place only once a selection exists: at
                zero it is a lone checkbox beside "0 selected", and the cards'
                own checkboxes are how a selection starts. */}
            <Show when={selectable() && selected().length > 0}>
              <div class="flex items-center justify-between gap-2 px-1">
                <Checkbox
                  aria-label={`Select all ${props.title} on this page`}
                  padded
                  class="size-10"
                  checked={table.getIsAllPageRowsSelected()}
                  indeterminate={table.getIsSomePageRowsSelected()}
                  onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(value)
                  }
                />
                <span class="text-caption text-ink-gray-7">
                  {selected().length} selected
                </span>
              </div>
            </Show>
            <For each={table.getRowModel().rows}>
              {(row) => {
                // Cards never nest: a group becomes a section header and its
                // records stay flat cards under it.
                if (isGroupRow(row)) {
                  return (
                    <div
                      data-slot="data-table-group-card"
                      class="mt-2 flex items-center justify-between gap-2 rounded-3 bg-surface-gray-1 px-3 py-2 first:mt-0"
                    >
                      <div class="flex min-w-0 items-center gap-2">
                        <Expander row={row} label={String(groupValue(row))} />
                        <span class="truncate text-interface font-medium">
                          {groupColumnLabel(row)}
                        </span>
                        <span class="truncate text-caption text-ink-gray-7">
                          {String(groupValue(row))}
                        </span>
                      </div>
                      <span class="text-caption text-ink-gray-7 tabular-nums">
                        {groupRowCount(row)}
                      </span>
                    </div>
                  )
                }
                const cells = (role: DataTableMobileRole) =>
                  row
                    .getVisibleCells()
                    .filter(
                      (cell) => mobileRole(cell.column.columnDef.meta) === role,
                    )
                return (
                  <div
                    class={card({ padding: 'sm' })}
                    classList={{ 'bg-surface-blue-1': row.getIsSelected() }}
                    data-selected={row.getIsSelected() ? '' : undefined}
                  >
                    <div class="flex items-start gap-2">
                      <Show when={selectable()}>
                        <Checkbox
                          aria-label={`Select ${row.original.id}`}
                          padded
                          class="size-10"
                          checked={row.getIsSelected()}
                          disabled={!row.getCanSelect()}
                          onCheckedChange={(value) => row.toggleSelected(value)}
                        />
                      </Show>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-start justify-between gap-3">
                          <div class="min-w-0">
                            <For each={cells('title')}>
                              {(cell) => (
                                <div class="text-interface font-medium [overflow-wrap:anywhere]">
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </div>
                              )}
                            </For>
                            <For each={cells('subtitle')}>
                              {(cell) => (
                                <div class="text-caption text-ink-gray-7 [overflow-wrap:anywhere]">
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </div>
                              )}
                            </For>
                          </div>
                          <For each={cells('amount')}>
                            {(cell) => (
                              <span class="shrink-0 text-interface font-medium tabular-nums">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </span>
                            )}
                          </For>
                        </div>
                        <div class="mt-1 flex flex-wrap items-center gap-2">
                          <For each={cells('status')}>
                            {(cell) =>
                              flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )
                            }
                          </For>
                          <For each={cells('meta')}>
                            {(cell) => (
                              <span class="text-caption text-ink-gray-7">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </span>
                            )}
                          </For>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }}
            </For>
          </div>
        </Show>
        {/* The table stays mounted when a filter empties it: the header is
            where the filter lives, and unmounting it would close the popover
            the reader is still typing into. The empty state is a row. */}
        <div class={hasMobileCards() ? tableHiddenClass() : ''}>
          {/* Virtual mode gives the body its own viewport: the toolbar stays
              above it and the header stays sticky inside it. */}
          <ScrollTable
            label={`${props.title} table`}
            stickyHeader
            height={virtualOn() ? '24rem' : undefined}
            ref={(el) => setScrollEl(el)}
          >
            <table
              class={cn(
                'w-full min-w-[720px] border-collapse text-start',
                resizable() && 'table-fixed',
              )}
            >
              {/* A sized table lays its columns out from the colgroup: the
                    header is `table-fixed`, so the `<col>` widths are what the
                    browser honours and a resize reaches the whole column. */}
              <Show when={resizable()}>
                <colgroup>
                  <For each={table.getVisibleLeafColumns()}>
                    {(column) => <SizedCol size={column.getSize()} />}
                  </For>
                </colgroup>
              </Show>
              <ScrollTableHead>
                {/* Nested column definitions stack into as many header rows
                      as the tree is deep. A placeholder is the empty cell that
                      keeps the row aligned; a `rowSpan` of 0 means a cell above
                      already covers this one, so it is not rendered at all. */}
                <For each={table.getHeaderGroups()}>
                  {(group) => (
                    <tr>
                      <For each={group.headers}>
                        {(header) => (
                          <Show when={header.rowSpan !== 0}>
                            <th
                              scope="col"
                              colspan={
                                header.colSpan > 1 ? header.colSpan : undefined
                              }
                              rowspan={
                                header.rowSpan > 1 ? header.rowSpan : undefined
                              }
                              class={cn(
                                alignEnd(header.column.columnDef.meta)
                                  ? `${cellPad()} text-end`
                                  : `${cellPad()} text-start`,
                                pinClass(pinOf(header.column.id)),
                                resizable() && 'relative',
                                reorderable() &&
                                  'data-[dragging]:cursor-col-resize data-[dragging]:select-none',
                              )}
                              data-column={header.column.id}
                              data-pin-edge={pinOf(header.column.id)}
                              aria-sort={
                                header.column.getIsSorted() === 'asc'
                                  ? 'ascending'
                                  : header.column.getIsSorted() === 'desc'
                                    ? 'descending'
                                    : undefined
                              }
                              ref={(el) => {
                                if (!el) return
                                if (header.column.columns.length > 0) return
                                drag.register(header.column.id, el)
                                stickyHeaders.set(header.column.id, el)
                                trackCell(header.column.id, el)
                              }}
                              onPointerDown={(event) => {
                                if (header.column.columns.length === 0)
                                  drag.begin(header.column.id, event)
                              }}
                              onPointerMove={(event) => {
                                if (header.column.columns.length === 0)
                                  drag.move(header.column.id, event)
                              }}
                              onPointerUp={(event) => {
                                if (header.column.columns.length === 0)
                                  drag.end(header.column.id, event)
                              }}
                              onPointerCancel={(event) => {
                                if (header.column.columns.length === 0)
                                  drag.end(header.column.id, event)
                              }}
                            >
                              <Show when={!header.isPlaceholder}>
                                <Show
                                  when={
                                    opsActive() || filterableOf(header.column)
                                  }
                                  fallback={headerContent(header)}
                                >
                                  <div class="flex items-center justify-between gap-1">
                                    <div class="min-w-0">
                                      {headerContent(header)}
                                    </div>
                                    <div class="flex shrink-0 items-center gap-0.5">
                                      <Show when={filterableOf(header.column)}>
                                        <ColumnFilter
                                          column={header.column}
                                          label={columnLabel(header.column)}
                                          facets={
                                            props.facets?.[header.column.id]
                                          }
                                        />
                                      </Show>
                                      <Show when={menuEnabled()}>
                                        <ColumnMenu.Root
                                          columnId={header.column.id}
                                          label={columnLabel(header.column)}
                                          pinnedStart={pinned().start ?? []}
                                          pinnedEnd={pinned().end ?? []}
                                          resizable={
                                            resizable() &&
                                            header.column.getCanResize()
                                          }
                                          reorderable={reorderable()}
                                          canSort={header.column.getCanSort()}
                                          canHide={header.column.getCanHide()}
                                          canMoveLeft={
                                            orderedLeafIds(table).indexOf(
                                              header.column.id,
                                            ) > 0
                                          }
                                          canMoveRight={
                                            orderedLeafIds(table).indexOf(
                                              header.column.id,
                                            ) <
                                            orderedLeafIds(table).length - 1
                                          }
                                          onSort={(id, desc) =>
                                            table
                                              .getColumn(id)
                                              ?.toggleSorting(desc)
                                          }
                                          onPin={(id, edge) =>
                                            pinColumn(id, edge ?? 'unpin')
                                          }
                                          onMove={(id, direction) =>
                                            moveColumnBy(table, id, direction)
                                          }
                                          onResetSize={(id) =>
                                            table.setColumnSizing((old) => {
                                              const next = { ...old }
                                              delete next[id]
                                              return next
                                            })
                                          }
                                          onHide={(id) =>
                                            table
                                              .getColumn(id)
                                              ?.toggleVisibility(false)
                                          }
                                        >
                                          <ColumnMenu.Trigger />
                                          <ColumnMenu.Content>
                                            <ColumnMenu.Items />
                                          </ColumnMenu.Content>
                                        </ColumnMenu.Root>
                                      </Show>
                                    </div>
                                  </div>
                                  <Show
                                    when={
                                      resizable() &&
                                      header.column.columns.length === 0 &&
                                      header.column.getCanResize()
                                    }
                                  >
                                    <ColumnResizeHandle
                                      label={columnLabel(header.column)}
                                      size={header.column.getSize()}
                                      min={
                                        header.column.columnDef.minSize ?? 50
                                      }
                                      max={Math.min(
                                        header.column.columnDef.maxSize ??
                                          10000,
                                        10000,
                                      )}
                                      onResize={(size) =>
                                        table.setColumnSizing((old) => ({
                                          ...old,
                                          [header.column.id]: size,
                                        }))
                                      }
                                      onReset={() =>
                                        table.setColumnSizing((old) => {
                                          const next = { ...old }
                                          delete next[header.column.id]
                                          return next
                                        })
                                      }
                                    />
                                  </Show>
                                </Show>
                              </Show>
                            </th>
                          </Show>
                        )}
                      </For>
                    </tr>
                  )}
                </For>
              </ScrollTableHead>
              <tbody>
                <Show
                  when={pageRows().length > 0}
                  fallback={
                    <tr>
                      <td colspan={emptyColSpan()} class="p-card-pad">
                        <DataState
                          status="empty"
                          title={props.emptyTitle ?? 'No matching records'}
                          description={
                            props.emptyHint ??
                            'Try a different search or clear your filters.'
                          }
                          action={emptyAction()}
                        />
                      </td>
                    </tr>
                  }
                >
                  {/* The window: spacer rows stand in for the rows above and
                      below it, so the scrollbar lies about the right amount. */}
                  <Show when={virtualOn() && topSpacer() > 0}>
                    <SpacerRow height={topSpacer()} />
                  </Show>
                  <For each={renderedUnits()}>
                    {(unit) => (
                      <Show
                        when={unit.kind === 'group'}
                        fallback={
                          <Show
                            when={unit.kind === 'record'}
                            fallback={detailRow(unit.row, (el) =>
                              measureRow(unit, el),
                            )}
                          >
                            {recordRow(unit.row, (el) => measureRow(unit, el))}
                          </Show>
                        }
                      >
                        {groupRow(unit.row, (el) => measureRow(unit, el))}
                      </Show>
                    )}
                  </For>
                  <Show when={virtualOn() && bottomSpacer() > 0}>
                    <SpacerRow height={bottomSpacer()} />
                  </Show>
                </Show>
              </tbody>
              <Show when={hasSummary()}>{summaryRow()}</Show>
            </table>
          </ScrollTable>
        </div>
        <Show when={table.getFilteredRowModel().rows.length > 0}>
          <div class="flex flex-wrap items-center justify-between gap-control-gap border-t border-outline-gray-1 px-3 py-1.5">
            <span class="text-caption text-ink-gray-7" role="status">
              <Show when={selectable()}>{selected().length} selected · </Show>
              <Show when={!serverMode() || totalKnown()}>
                {serverMode()
                  ? serverTotal()
                  : table.getFilteredRowModel().rows.length}{' '}
                {props.recordsLabel ?? 'records'}
              </Show>
            </span>
            <div class="flex flex-wrap items-center gap-2">
              <Pagination.Root
                class="max-sm:flex-nowrap"
                page={table.atoms.pagination.get().pageIndex + 1}
                pageSize={table.atoms.pagination.get().pageSize}
                count={pagerCount()}
                onPageChange={(page) => table.setPageIndex(page - 1)}
              >
                <Show when={!serverMode() || totalKnown()}>
                  <span class="contents max-sm:hidden">
                    <Pagination.Range />
                  </span>
                </Show>
                <Show when={pageCount() > 1}>
                  <span class="text-caption text-ink-gray-7 tabular-nums sm:hidden">
                    Page {table.atoms.pagination.get().pageIndex + 1}
                    <Show when={Number.isFinite(pageCount())}>
                      {' of '}
                      {pageCount()}
                    </Show>
                  </span>
                  <Pagination.PrevTrigger />
                  <Show when={!serverMode() || totalKnown()}>
                    <span class="contents max-sm:hidden">
                      <Pagination.Pages />
                    </span>
                  </Show>
                  <Pagination.NextTrigger />
                </Show>
              </Pagination.Root>
            </div>
          </div>
        </Show>
      </Show>
      <Show when={selectable() && selected().length > 0}>
        <div class="h-16 sm:hidden" aria-hidden="true" />
      </Show>
      <div class="sm:hidden">
        <SelectionBar
          count={selected().length}
          placement="sticky"
          summary={
            props.selectionSummary
              ? props.selectionSummary(selected())
              : undefined
          }
          primary={
            props.onRowsAction
              ? {
                  label: props.actionLabel ?? 'Update selected',
                  onClick: runAction,
                }
              : undefined
          }
          onClear={() => table.resetRowSelection()}
        />
      </div>
    </section>
  )
}

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
  type ColumnDef,
  type ColumnFiltersState,
  columnFilteringFeature,
  columnPinningFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  createTable,
  flexRender,
  globalFilteringFeature,
  type PaginationState,
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
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  on,
  Show,
  untrack,
} from 'solid-js'
import { DataState } from '../DataState'
import { SelectionBar } from '../SelectionBar'

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
    columnPinningFeature,
    columnVisibilityFeature,
    globalFilteringFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    filteredRowModel: createFilteredRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortedRowModel: createSortedRowModel(),
    sortFns: {
      alphanumeric: sortFn_alphanumeric,
      datetime: sortFn_datetime,
      text: sortFn_text,
    },
  })
}

type Features = ReturnType<typeof createFeatures>

export type DataTableColumn<T extends object> = ColumnDef<Features, T>

/** Where a column appears in the mobile card, when `meta.mobile` is set. */
export type DataTableMobileRole =
  | 'title'
  | 'subtitle'
  | 'amount'
  | 'status'
  | 'meta'

/** The library reads `meta.align`, `meta.mobile` and `meta.editable`; all optional. */
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

/** Which column is frozen to each edge of the horizontal scroll. */
export interface DataTablePinned {
  start?: string
  end?: string
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
  /** `compact` uses 36px rows instead of 44px. */
  density?: 'comfortable' | 'compact'
  /** Width at which the table becomes cards. Default `sm` (640px). */
  cardBreakpoint?: 'sm' | 'md' | 'lg'
  /** Total or scope shown beside the count in the mobile selection bar. */
  selectionSummary?: (ids: string[]) => JSX.Element
  pageSize?: number
  /** Footer noun: "32 transactions". Defaults to "records". */
  recordsLabel?: string
  emptyTitle?: string
  emptyHint?: string
  /** Empty-state reset for externally filtered pages (beats Clear search). */
  onClearFilters?: () => void
  /**
   * Freeze one column to the start edge of the horizontal scroll — the
   * identifier that must stay visible while the rest move. Controlled:
   * changes go through `onPinnedColumnsChange`.
   */
  pinnedStart?: string
  /** Freeze one column to the end edge — typically the row actions. */
  pinnedEnd?: string
  defaultPinnedStart?: string
  defaultPinnedEnd?: string
  onPinnedColumnsChange?: (pinned: DataTablePinned) => void
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
 * A collection as a table: search, sort, page, hide columns, select rows,
 * pin one column to each scroll edge, edit cells in place.
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
    selectable() ? [selection, ...props.columns] : props.columns,
  )
  const [pinned] = createControllableSignal<DataTablePinned>({
    value: () => ({
      start: props.pinnedStart,
      end: props.pinnedEnd,
    }),
    defaultValue: {
      start: props.defaultPinnedStart,
      end: props.defaultPinnedEnd,
    },
    onChange: (next) => props.onPinnedColumnsChange?.(next),
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
  const [paginationSlice, setPaginationSlice] =
    createControllableSignal<PaginationState>({
      value: () => props.pagination,
      defaultValue: {
        pageIndex: 0,
        pageSize: untrack(() => props.pageSize) ?? 10,
      },
      onChange: (next) => props.onPaginationChange?.(next),
    })
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
    if (pinned().start === columnId) return 'start'
    if (pinned().end === columnId) return 'end'
    return undefined
  }
  /** Sticky cell chrome: opaque card surface over the scrolling columns. */
  const pinClass = (edge: 'start' | 'end' | undefined) =>
    edge === 'start'
      ? 'sticky start-0 z-raised bg-surface-elevation-1 group-hover/row:bg-surface-gray-1 data-[selected]:bg-surface-blue-1 data-[selected]:group-hover/row:bg-surface-blue-2 border-e border-outline-gray-1'
      : edge === 'end'
        ? 'sticky end-0 z-raised bg-surface-elevation-1 group-hover/row:bg-surface-gray-1 data-[selected]:bg-surface-blue-1 data-[selected]:group-hover/row:bg-surface-blue-2 border-s border-outline-gray-1'
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
      const pinnedValue = pinned()
      const columnPinning = {
        start: pinnedValue.start ? [pinnedValue.start] : [],
        end: pinnedValue.end ? [pinnedValue.end] : [],
      }
      if (!serverMode()) return { columnPinning }
      return {
        columnPinning,
        sorting: sortingSlice(),
        columnFilters: columnFiltersSlice(),
        globalFilter: globalFilterSlice(),
        pagination: paginationSlice(),
      }
    },
    getRowId: (row) => props.getRowId?.(row) ?? row.id,
    get enableRowSelection() {
      return (row: { original: T }) =>
        props.rowSelectable?.(row.original) ?? true
    },
    initialState: {
      // Initial only: later pageSize changes do not repaginate the table.
      pagination: {
        pageIndex: 0,
        pageSize: untrack(() => props.pageSize) ?? 10,
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
    get pageCount() {
      if (!serverMode()) return undefined
      if (!totalKnown()) return -1
      return Math.max(1, Math.ceil(serverTotal() / paginationSlice().pageSize))
    },
    ...(serverMode()
      ? {
          onSortingChange: handleSortingChange,
          onColumnFiltersChange: handleColumnFiltersChange,
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
  const alignEnd = (meta: unknown): boolean =>
    (meta as DataTableColumnMeta | undefined)?.align === 'end'
  const mobileRole = (meta: unknown) =>
    (meta as DataTableColumnMeta | undefined)?.mobile
  const hasMobileCards = createMemo(() =>
    props.columns.some((column) => mobileRole(column.meta)),
  )
  const selected = () =>
    table.getFilteredSelectedRowModel().rows.map((row) => row.original.id)
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
    props.density === 'compact'
      ? 'px-table-cell-x py-table-cell-y'
      : 'px-table-cell-x py-3'
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
  return (
    <section
      class={cn(card({ padding: 'none' }), 'block min-w-0')}
      aria-label={props.title}
      data-slot="data-table"
    >
      <div
        data-slot="data-table-toolbar"
        class="flex flex-wrap items-center justify-between gap-control-gap p-card-pad-compact"
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
          <span class="min-w-0 text-interface font-medium text-ink-gray-8">
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
        <Show when={table.getFilteredRowModel().rows.length > 0}>
          <div class={hasMobileCards() ? tableHiddenClass() : ''}>
            <ScrollTable label={`${props.title} table`} stickyHeader>
              <table class="w-full min-w-[720px] border-collapse text-start">
                <ScrollTableHead>
                  <For each={table.getHeaderGroups()}>
                    {(group) => (
                      <tr>
                        <For each={group.headers}>
                          {(header) => (
                            <th
                              scope="col"
                              class={cn(
                                alignEnd(header.column.columnDef.meta)
                                  ? `${cellPad()} text-end`
                                  : `${cellPad()} text-start`,
                                pinClass(pinOf(header.column.id)),
                              )}
                              aria-sort={
                                header.column.getIsSorted() === 'asc'
                                  ? 'ascending'
                                  : header.column.getIsSorted() === 'desc'
                                    ? 'descending'
                                    : undefined
                              }
                            >
                              <Show when={!header.isPlaceholder}>
                                <Show
                                  when={header.column.getCanSort()}
                                  fallback={flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                                >
                                  <button
                                    type="button"
                                    class="inline-flex items-center gap-2 rounded-3 focus-visible:focus-ring"
                                    onClick={header.column.getToggleSortingHandler()}
                                  >
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext(),
                                    )}
                                    <span aria-hidden="true">
                                      <span
                                        aria-hidden="true"
                                        class={cn(
                                          'inline-block size-4 align-middle',
                                          header.column.getIsSorted() === 'asc'
                                            ? 'lucide-arrow-up'
                                            : header.column.getIsSorted() ===
                                                'desc'
                                              ? 'lucide-arrow-down'
                                              : 'lucide-arrow-up-down',
                                        )}
                                      />
                                    </span>
                                  </button>
                                </Show>
                              </Show>
                            </th>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </ScrollTableHead>
                <tbody>
                  <For each={table.getRowModel().rows}>
                    {(row) => (
                      <tr
                        class="group/row border-b border-outline-gray-1 hover:bg-surface-gray-1 data-[selected]:bg-surface-blue-1 data-[selected]:hover:bg-surface-blue-2"
                        data-selected={row.getIsSelected() ? '' : undefined}
                      >
                        <For each={row.getVisibleCells()}>
                          {(cell) => {
                            const edge = pinOf(cell.column.id)
                            const editingMeta = editable()
                              ? editMeta(cell.column.columnDef.meta)
                              : undefined
                            const raw = (
                              row.original as Record<string, unknown>
                            )[cell.column.id]
                            return (
                              <td
                                class={cn(
                                  alignEnd(cell.column.columnDef.meta)
                                    ? `${cellPad()} text-end text-interface`
                                    : `${cellPad()} text-interface`,
                                  pinClass(edge),
                                )}
                                data-selected={
                                  row.getIsSelected() ? '' : undefined
                                }
                              >
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
                                    type={
                                      editingMeta?.input === 'number'
                                        ? 'number'
                                        : 'text'
                                    }
                                    alignEnd={alignEnd(
                                      cell.column.columnDef.meta,
                                    )}
                                    onCommit={props.onCellChange ?? (() => {})}
                                  />
                                </Show>
                              </td>
                            )
                          }}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </ScrollTable>
          </div>
        </Show>
        <Show when={table.getFilteredRowModel().rows.length === 0}>
          <DataState
            status="empty"
            title={props.emptyTitle ?? 'No matching records'}
            description={
              props.emptyHint ?? 'Try a different search or clear your filters.'
            }
            action={emptyAction()}
          />
        </Show>
        <Show when={table.getFilteredRowModel().rows.length > 0}>
          <div class="flex flex-wrap items-center justify-between gap-control-gap border-t border-outline-gray-1 p-card-pad-compact">
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

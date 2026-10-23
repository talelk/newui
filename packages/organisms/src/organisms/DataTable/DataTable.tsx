import { Button, Checkbox, cn, TextInput } from '@talelk/newui-atoms'
import {
  Pagination,
  ScrollTable,
  ScrollTableHead,
} from '@talelk/newui-molecules'
import {
  type ColumnDef,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  createTable,
  flexRender,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from '@tanstack/solid-table'
import {
  createEffect,
  createMemo,
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

/** The library reads `meta.align` and `meta.mobile`; both are optional. */
export interface DataTableColumnMeta {
  align?: 'end'
  mobile?: DataTableMobileRole
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
}

/**
 * A collection as a table: search, sort, page, hide columns, select rows.
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
  const table = createTable<Features, T>({
    features: createFeatures(),
    get data() {
      return props.rows
    },
    get columns() {
      return resolvedColumns()
    },
    getRowId: (row) => row.id,
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
  })
  // Externally filtered pages hand over a new row set per filter change;
  // staying on page 3 of a 6-row result would show an empty page.
  createEffect(
    on(
      () => props.rows,
      () => table.setPageIndex(0),
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
    props.density === 'compact' ? 'px-4 py-2' : 'px-4 py-3'
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
    Math.max(
      1,
      Math.ceil(
        table.getFilteredRowModel().rows.length /
          table.atoms.pagination.get().pageSize,
      ),
    )
  const columnLabel = (column: {
    id: string
    columnDef: { header?: unknown }
  }) =>
    typeof column.columnDef.header === 'string'
      ? column.columnDef.header
      : column.id
  const columnMenu = (placement: 'up' | 'down') => (
    <details
      data-slot="data-table-columns"
      class="relative max-sm:hidden"
      open={false}
    >
      <summary class="list-none cursor-pointer rounded-3 border border-outline-gray-2 px-3 py-1.5 text-interface focus-visible:focus-ring [&::-webkit-details-marker]:hidden">
        Columns
      </summary>
      <div
        class={`absolute end-0 z-floating flex min-w-44 flex-col gap-2 rounded-6 border border-outline-gray-1 bg-surface-elevation-2 p-3 shadow-md ${placement === 'up' ? 'bottom-full mb-2' : 'mt-2'}`}
      >
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
    </details>
  )
  return (
    <section
      class="min-w-0 rounded-card border border-outline-gray-1 bg-surface-elevation-1"
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
          {columnMenu('down')}
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
            <Show when={selectable()}>
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
                    class="rounded-4 border border-outline-gray-1 p-3"
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
                              class={
                                alignEnd(header.column.columnDef.meta)
                                  ? `${cellPad()} text-end`
                                  : `${cellPad()} text-start`
                              }
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
                        class="border-b border-outline-gray-1 hover:bg-surface-gray-1 data-[selected]:bg-surface-blue-1 data-[selected]:hover:bg-surface-blue-2"
                        data-selected={row.getIsSelected() ? '' : undefined}
                      >
                        <For each={row.getVisibleCells()}>
                          {(cell) => (
                            <td
                              class={
                                alignEnd(cell.column.columnDef.meta)
                                  ? `${cellPad()} text-end text-interface`
                                  : `${cellPad()} text-interface`
                              }
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          )}
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
              {table.getFilteredRowModel().rows.length}{' '}
              {props.recordsLabel ?? 'records'}
            </span>
            <div class="flex flex-wrap items-center gap-2">
              <Pagination.Root
                class="max-sm:flex-nowrap"
                page={table.atoms.pagination.get().pageIndex + 1}
                pageSize={table.atoms.pagination.get().pageSize}
                count={table.getFilteredRowModel().rows.length}
                onPageChange={(page) => table.setPageIndex(page - 1)}
              >
                <span class="contents max-sm:hidden">
                  <Pagination.Range />
                </span>
                <Show when={pageCount() > 1}>
                  <span class="text-caption text-ink-gray-7 tabular-nums sm:hidden">
                    Page {table.atoms.pagination.get().pageIndex + 1} of{' '}
                    {pageCount()}
                  </span>
                  <Pagination.PrevTrigger />
                  <span class="contents max-sm:hidden">
                    <Pagination.Pages />
                  </span>
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

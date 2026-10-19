import { Button, Checkbox, Pagination, TextInput } from '@newui/ui'
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
import { ScrollTable, TABLE_HEAD_CLASS } from './ScrollTable'

const features = tableFeatures({
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

export type DataTableColumn<T extends object> = ColumnDef<typeof features, T>

/** The example layer's table composition. No new public component API. */
export function DataTable<T extends { id: string }>(props: {
  title: string
  rows: T[]
  columns: DataTableColumn<T>[]
  actionLabel?: string
  onRowsAction?: (ids: string[]) => void
  /** Pages whose FilterBar owns search (Analytics) hide the table's own. */
  hideSearch?: boolean
  /** Selection checkboxes + bulk action. Default on; off for read tables. */
  selectable?: boolean
  pageSize?: number
  /** Footer noun: "32 transactions". Defaults to "records". */
  recordsLabel?: string
  emptyTitle?: string
  emptyHint?: string
  /** Empty-state reset for externally filtered pages (beats Clear search). */
  onClearFilters?: () => void
}): JSX.Element {
  const selectable = () => props.selectable !== false
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
        onCheckedChange={(value) => context.row.toggleSelected(value)}
      />
    ),
  }
  const resolvedColumns = createMemo(() =>
    selectable() ? [selection, ...props.columns] : props.columns,
  )
  const table = createTable<typeof features, T>({
    features,
    get data() {
      return props.rows
    },
    get columns() {
      return resolvedColumns()
    },
    getRowId: (row) => row.id,
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
    (meta as { align?: string } | undefined)?.align === 'end'
  const selected = () =>
    table.getFilteredSelectedRowModel().rows.map((row) => row.original.id)
  return (
    <section
      class="min-w-0 rounded-5 border border-outline-gray-1 bg-surface-elevation-1"
      aria-label={props.title}
      data-slot="example-data-table"
    >
      <div class="flex flex-wrap items-center justify-between gap-3 p-3">
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
        <div class="ms-auto flex flex-wrap items-center gap-2">
          <Show when={props.onRowsAction && selected().length}>
            <Button
              variant="outline"
              onClick={() => {
                props.onRowsAction?.(selected())
                table.resetRowSelection()
              }}
            >
              {props.actionLabel ?? 'Update selected'} ({selected().length})
            </Button>
          </Show>
          <details class="relative">
            <summary class="cursor-pointer rounded-3 border border-outline-gray-2 px-3 py-1.5 text-interface focus-visible:focus-ring">
              Columns
            </summary>
            <div class="absolute end-0 z-20 mt-2 flex min-w-44 flex-col gap-2 rounded-6 border border-outline-gray-1 bg-surface-elevation-2 p-3 shadow-md">
              <For
                each={table
                  .getAllLeafColumns()
                  .filter((column) => column.getCanHide())}
              >
                {(column) => (
                  <Checkbox
                    label={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(value)}
                  />
                )}
              </For>
            </div>
          </details>
        </div>
      </div>
      <ScrollTable label={`${props.title} table`}>
        <table class="w-full min-w-[720px] border-collapse text-start">
          <thead class={TABLE_HEAD_CLASS}>
            <For each={table.getHeaderGroups()}>
              {(group) => (
                <tr>
                  <For each={group.headers}>
                    {(header) => (
                      <th
                        scope="col"
                        class={
                          alignEnd(header.column.columnDef.meta)
                            ? 'px-4 py-3 text-end'
                            : 'px-4 py-3 text-start'
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
                                  class="lucide-arrow-up-down inline-block size-4 align-middle"
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
          </thead>
          <tbody>
            <For each={table.getRowModel().rows}>
              {(row) => (
                <tr
                  class="border-b border-outline-gray-1 hover:bg-surface-gray-1"
                  data-selected={row.getIsSelected() ? '' : undefined}
                >
                  <For each={row.getVisibleCells()}>
                    {(cell) => (
                      <td
                        class={
                          alignEnd(cell.column.columnDef.meta)
                            ? 'px-4 py-3 text-end text-interface'
                            : 'px-4 py-3 text-interface'
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
      <Show when={table.getFilteredRowModel().rows.length === 0}>
        <div class="p-10 text-center">
          <h3 class="font-semibold">
            {props.emptyTitle ?? 'No matching records'}
          </h3>
          <p class="mt-1 text-ink-gray-7">
            {props.emptyHint ?? 'Try a different search or clear your filters.'}
          </p>
          <Show
            when={props.onClearFilters}
            fallback={
              <Button class="mt-3" onClick={() => table.resetGlobalFilter()}>
                Clear search
              </Button>
            }
          >
            {(clear) => (
              <Button class="mt-3" onClick={() => clear()()}>
                Reset filters
              </Button>
            )}
          </Show>
        </div>
      </Show>
      <div class="flex flex-wrap items-center justify-between gap-3 p-3">
        <span class="text-caption text-ink-gray-7" role="status">
          <Show when={selectable()}>{selected().length} selected · </Show>
          {table.getFilteredRowModel().rows.length}{' '}
          {props.recordsLabel ?? 'records'}
        </span>
        <Pagination.Root
          page={table.atoms.pagination.get().pageIndex + 1}
          pageSize={table.atoms.pagination.get().pageSize}
          count={table.getFilteredRowModel().rows.length}
          onPageChange={(page) => table.setPageIndex(page - 1)}
        >
          <Pagination.Range />
          <Pagination.PrevTrigger />
          <Pagination.Pages />
          <Pagination.NextTrigger />
        </Pagination.Root>
      </div>
    </section>
  )
}

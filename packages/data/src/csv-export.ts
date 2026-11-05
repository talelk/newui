import { csvText } from './download'

/**
 * Table → CSV, exporting what the user sees.
 *
 * `exportCsv` is the headless binding between a table's state and a download:
 * it reads the row models and the column state through a structural interface
 * (the shape TanStack Table already satisfies), renders the cells through the
 * column's own `meta.format` when it has one, and hands back a `Blob` built
 * on `csvText`. A page finishes the job with `downloadBlob`.
 *
 * It returns a promise so a server-side or streaming export can replace the
 * in-browser one without the call site noticing.
 */

/** Which rows to write. */
export type CsvScope =
  /** The current page slice of the filtered, sorted view. */
  | 'page'
  /** Every filtered row in the current sort order, across pages. */
  | 'filtered'
  /** Every row, ignoring filters — the raw data. */
  | 'all'

/** Which columns to write. */
export type CsvColumns =
  /** The columns the user can see. */
  | 'visible'
  /** Every leaf column, hidden ones included. */
  | 'all'

/** Options for {@link exportCsv}. */
export interface CsvExportOptions {
  /** Default `'filtered'` — what a reader of the file would expect. */
  scope?: CsvScope
  /** Default `'visible'`. A column with `meta.exportable: false` never ships. */
  columns?: CsvColumns
}

/**
 * The `columnDef.meta` keys `exportCsv` reads, all optional:
 * `exportName` (the header text), `exportable` (`false` excludes the column)
 * and `format` (the cell formatter the export shares with the rendered cell).
 */
export interface CsvExportTableColumn {
  id: string
  columnDef?: { meta?: Record<string, unknown> }
}

/** A row: one value per column id, like TanStack's `row.getValue`. */
export interface CsvExportTableRow {
  getValue(columnId: string): unknown
}

/** A row model — the `.rows` of TanStack's row models. */
export interface CsvExportRowModel {
  rows: readonly CsvExportTableRow[]
}

/**
 * The slice of a table instance `exportCsv` reads. A TanStack `Table`
 * satisfies it structurally; a test can hand it a literal.
 */
export interface CsvExportTable {
  getAllLeafColumns(): readonly CsvExportTableColumn[]
  getVisibleLeafColumns(): readonly CsvExportTableColumn[]
  getCoreRowModel(): CsvExportRowModel
  getFilteredRowModel(): CsvExportRowModel
  getState(): { pagination: { pageIndex: number; pageSize: number } }
}

function cellText(value: unknown, format?: unknown): string | number {
  if (format !== undefined && typeof format === 'function') {
    return (format as (value: unknown) => string | number)(value)
  }
  if (value === null || value === undefined) return ''
  if (typeof value === 'number' || typeof value === 'string') return value
  return String(value)
}

/**
 * Export a table's state as CSV. The scope chooses the rows — the page, the
 * filtered set, or everything — and the columns default to what is visible.
 * Resolve with the `Blob`, then `downloadBlob(name, blob)` to save it.
 */
export async function exportCsv(
  table: CsvExportTable,
  options: CsvExportOptions = {},
): Promise<Blob> {
  const scope = options.scope ?? 'filtered'
  const columns = options.columns ?? 'visible'

  const leaf =
    columns === 'visible'
      ? table.getVisibleLeafColumns()
      : table.getAllLeafColumns()
  const exported = leaf.filter(
    (column) => column.columnDef?.meta?.['exportable'] !== false,
  )

  let rows: readonly CsvExportTableRow[]
  if (scope === 'all') {
    rows = table.getCoreRowModel().rows
  } else {
    const filtered = table.getFilteredRowModel().rows
    if (scope === 'page') {
      const { pageIndex, pageSize } = table.getState().pagination
      const start = pageIndex * pageSize
      rows = filtered.slice(start, start + pageSize)
    } else {
      rows = filtered
    }
  }

  const header = exported.map((column) =>
    typeof column.columnDef?.meta?.['exportName'] === 'string'
      ? (column.columnDef.meta['exportName'] as string)
      : column.id,
  )
  const body = rows.map((row) =>
    exported.map((column) =>
      cellText(row.getValue(column.id), column.columnDef?.meta?.['format']),
    ),
  )

  return new Blob([csvText([header, ...body])], {
    type: 'text/csv;charset=utf-8',
  })
}

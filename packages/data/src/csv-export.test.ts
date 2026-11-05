import { describe, expect, it } from 'vitest'
import {
  type CsvExportTable,
  type CsvExportTableRow,
  exportCsv,
} from './csv-export'

interface FakeColumn {
  id: string
  visible?: boolean
  meta?: Record<string, unknown>
}

function row(values: Record<string, unknown>): CsvExportTableRow {
  return { getValue: (columnId) => values[columnId] }
}

function fakeTable(options: {
  columns: FakeColumn[]
  /** The raw data — what the core model returns. */
  rows: Record<string, unknown>[]
  /** The filtered, sorted view — what the filtered model returns. */
  filtered?: Record<string, unknown>[]
  pageIndex?: number
  pageSize?: number
}): CsvExportTable {
  const leaf = (visibleOnly: boolean) =>
    options.columns
      .filter((column) => !visibleOnly || column.visible !== false)
      .map((column) => ({
        id: column.id,
        columnDef: column.meta ? { meta: column.meta } : {},
      }))
  return {
    getAllLeafColumns: () => leaf(false),
    getVisibleLeafColumns: () => leaf(true),
    getCoreRowModel: () => ({ rows: options.rows.map(row) }),
    getFilteredRowModel: () => ({
      rows: (options.filtered ?? options.rows).map(row),
    }),
    getState: () => ({
      pagination: {
        pageIndex: options.pageIndex ?? 0,
        pageSize: options.pageSize ?? 10,
      },
    }),
  }
}

async function csv(blob: Blob): Promise<string> {
  return blob.text()
}

const five = [
  { id: 1, name: 'a' },
  { id: 2, name: 'b' },
  { id: 3, name: 'c' },
  { id: 4, name: 'd' },
  { id: 5, name: 'e' },
]

describe('exportCsv', () => {
  it('exports the filtered view with visible columns by default', async () => {
    const table = fakeTable({
      columns: [{ id: 'id' }, { id: 'name' }, { id: 'secret', visible: false }],
      rows: five,
      filtered: five.slice(0, 2),
    })
    const blob = await exportCsv(table)
    expect(blob.type).toBe('text/csv;charset=utf-8')
    expect(await csv(blob)).toBe('"id","name"\r\n"1","a"\r\n"2","b"')
  })

  it('scope page takes the current page slice', async () => {
    const table = fakeTable({
      columns: [{ id: 'id' }, { id: 'name' }],
      rows: five,
      pageIndex: 1,
      pageSize: 2,
    })
    expect(await csv(await exportCsv(table, { scope: 'page' }))).toBe(
      '"id","name"\r\n"3","c"\r\n"4","d"',
    )
  })

  it('scope all ignores the filtered model', async () => {
    const table = fakeTable({
      columns: [{ id: 'id' }],
      rows: five,
      filtered: five.slice(0, 1),
    })
    const text = await csv(await exportCsv(table, { scope: 'all' }))
    expect(text.split('\r\n')).toHaveLength(6)
    expect(text).toContain('"5"')
  })

  it('columns all ships hidden columns too', async () => {
    const table = fakeTable({
      columns: [{ id: 'id' }, { id: 'secret', visible: false }],
      rows: [{ id: 1, secret: 'x' }],
    })
    expect(await csv(await exportCsv(table, { columns: 'all' }))).toBe(
      '"id","secret"\r\n"1","x"',
    )
  })

  it('honours the export meta keys: name, format, exportable', async () => {
    const table = fakeTable({
      columns: [
        { id: 'name', meta: { exportName: 'Full name' } },
        {
          id: 'amount',
          meta: { format: (value: unknown) => `$${Number(value).toFixed(2)}` },
        },
        { id: 'internal', meta: { exportable: false } },
      ],
      rows: [{ name: 'ada', amount: 12.5, internal: 'keep out' }],
    })
    expect(await csv(await exportCsv(table))).toBe(
      '"Full name","amount"\r\n"ada","$12.50"',
    )
  })

  it('renders null and undefined as empty cells', async () => {
    const table = fakeTable({
      columns: [{ id: 'a' }, { id: 'b' }],
      rows: [{ a: null, b: undefined }],
    })
    expect(await csv(await exportCsv(table))).toBe('"a","b"\r\n"",""')
  })

  it('quotes and escapes through csvText, including inner quotes', async () => {
    const table = fakeTable({
      columns: [{ id: 'quote' }],
      rows: [{ quote: 'said "hi", loudly' }],
    })
    expect(await csv(await exportCsv(table))).toBe(
      '"quote"\r\n"said ""hi"", loudly"',
    )
  })

  it('falls back to String for values that are neither text nor numbers', async () => {
    const table = fakeTable({
      columns: [{ id: 'flag' }],
      rows: [{ flag: true }],
    })
    expect(await csv(await exportCsv(table))).toBe('"flag"\r\n"true"')
  })

  it('is a promise — the call site never blocks', async () => {
    const table = fakeTable({ columns: [{ id: 'id' }], rows: five })
    const pending = exportCsv(table)
    expect(pending).toBeInstanceOf(Promise)
    await pending
  })
})

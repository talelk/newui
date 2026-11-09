import { render, screen, waitFor } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DataTable, type DataTableColumn } from './DataTable'

interface Row {
  id: string
  name: string
  department: string
  amount: number
}

interface BigRow {
  id: string
  name: string
  status: string
}

const COLUMNS: DataTableColumn<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'amount', header: 'Amount', meta: { align: 'end' } },
]

const BIG_COLUMNS: DataTableColumn<BigRow>[] = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status' },
]

/**
 * jsdom has no layout: the viewport reports a zero rect unless every box is
 * mocked, and the virtualiser's ResizeObserver must report a measurement. The
 * shim gives every element a 440px box, which is all the windowing math needs.
 */
class MeasuredObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}
  observe(target: Element) {
    const rect = target.getBoundingClientRect()
    this.callback(
      [
        {
          target,
          contentRect: rect,
          borderBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
          contentBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
        } as unknown as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    )
  }
  unobserve() {}
  disconnect() {}
}

function withLayout() {
  const rect = {
    width: 600,
    height: 440,
    top: 0,
    left: 0,
    right: 600,
    bottom: 440,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect)
  vi.stubGlobal('ResizeObserver', MeasuredObserver)
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/** The rendered record rows of the table body — spacers and detail excluded. */
function recordRows(container: HTMLElement): HTMLTableRowElement[] {
  return [
    ...container.querySelectorAll('tbody tr[data-slot="data-table-row"]'),
    ...container.querySelectorAll('tbody tr[data-slot="data-table-group-row"]'),
  ] as HTMLTableRowElement[]
}

/** The spacer rows, with the height each one stands in for. */
function spacerHeights(container: HTMLElement): number[] {
  return [
    ...container.querySelectorAll(
      'tbody tr[data-slot="data-table-spacer"] > td',
    ),
  ].map((td) => parseFloat((td as HTMLElement).style.height) || 0)
}

function bigRows(count: number): BigRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `ROW-${index + 1}`,
    name: `Row ${index + 1}`,
    status: index % 2 === 0 ? 'Active' : 'Paused',
  }))
}

describe('DataTable virtualization', () => {
  // 1000-row renders are this file's heavy cases; the default 5 s budget
  // only holds on an idle machine and flakes under suite-wide load.
  it('windows a large page: a bounded DOM with spacer rows standing in', {
    timeout: 20000,
  }, async () => {
    withLayout()
    const rows = bigRows(1000)
    const { container } = render(() => (
      <DataTable title="Events" rows={rows} columns={BIG_COLUMNS} virtual />
    ))
    const region = container.querySelector(
      'section[data-slot="scroll-table"]',
    ) as HTMLElement
    const mounted = () => recordRows(container)
    expect(mounted().length).toBeGreaterThan(0)
    // A window plus overscan, never the thousand.
    expect(mounted().length).toBeLessThan(40)
    // The first window starts at the first row; the last row is absent until
    // it scrolls into range.
    expect(mounted()[0]?.textContent).toContain('Row 1')
    expect(screen.queryByText('Row 1000')).toBeNull()
    // Below the window nothing is mounted, so a spacer stands in for it.
    const spacers = spacerHeights(container)
    expect(spacers.length).toBeGreaterThan(0)
    expect(spacers.reduce((sum, px) => sum + px, 0)).toBeGreaterThan(0)

    // Scrolling moves the window: the rows above it become a spacer, and the
    // window no longer starts at the first row.
    region.scrollTop = 5000
    region.dispatchEvent(new Event('scroll'))
    await waitFor(() => {
      const firstId = mounted()[0]?.querySelector(
        'td[data-column="id"]',
      )?.textContent
      expect(firstId).not.toBe('ROW-1')
      expect(firstId).toBeTruthy()
      expect(spacerHeights(container)[0]).toBeGreaterThan(0)
    })
  })

  it('renders the whole page when virtual is off (the default)', {
    timeout: 20000,
  }, () => {
    const rows = bigRows(1000)
    const { container } = render(() => (
      <DataTable
        title="Events"
        rows={rows}
        columns={BIG_COLUMNS}
        pageSize={1000}
      />
    ))
    expect(recordRows(container)).toHaveLength(1000)
    expect(spacerHeights(container)).toHaveLength(0)
  })

  it('keeps the header sticky inside a bounded scroll region', () => {
    withLayout()
    const rows = bigRows(100)
    const { container } = render(() => (
      <DataTable title="Events" rows={rows} columns={BIG_COLUMNS} virtual />
    ))
    const region = container.querySelector(
      'section[data-slot="scroll-table"]',
    ) as HTMLElement
    // The header sticks inside the region; the toolbar never enters it.
    expect(region.className).toContain('[&_thead]:sticky')
    expect(region.style.height).toBe('24rem')
    expect(region.querySelector('thead')).toBeTruthy()
    expect(
      container.querySelector('[data-slot="data-table-toolbar"]'),
    ).toBeTruthy()
  })

  it('windows a grouped page and its expanded children', async () => {
    withLayout()
    const rows: Row[] = [
      { id: '1', name: 'Alpha', department: 'Sales', amount: 10 },
      { id: '2', name: 'Beta', department: 'Sales', amount: 20 },
      { id: '3', name: 'Gamma', department: 'Support', amount: 30 },
    ]
    const { container } = render(() => (
      <DataTable
        title="Rows"
        rows={rows}
        columns={COLUMNS}
        grouping={['department']}
        virtual
      />
    ))
    const groupRows = [
      ...container.querySelectorAll(
        'tbody tr[data-slot="data-table-group-row"]',
      ),
    ]
    expect(groupRows.length).toBe(2)
    // Records sit under their group once it is open.
    await userEvent.click(screen.getByRole('button', { name: 'Expand Sales' }))
    await waitFor(() => expect(screen.getByText('Alpha')).toBeTruthy())
    expect(recordRows(container).length).toBeLessThan(40)
  })

  it('windows the current page in server mode', () => {
    withLayout()
    const page = bigRows(50)
    const { container } = render(() => (
      <DataTable
        title="Events"
        rows={page}
        columns={BIG_COLUMNS}
        server={{ total: 20000 }}
        pageSize={50}
        virtual
      />
    ))
    // The page size is still the page size; the virtualiser windows inside it.
    const rows = recordRows(container)
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.length).toBeLessThan(50)
    expect(screen.getByText('20000 records')).toBeTruthy()
  })

  it('leaves the card layout alone below the breakpoint', () => {
    withLayout()
    const cardsColumns: DataTableColumn<BigRow>[] = [
      { accessorKey: 'id', header: 'Id', meta: { mobile: 'subtitle' } },
      { accessorKey: 'name', header: 'Name', meta: { mobile: 'title' } },
    ]
    const rows = bigRows(50)
    const { container } = render(() => (
      <DataTable title="Events" rows={rows} columns={cardsColumns} virtual />
    ))
    const cards = container.querySelectorAll(
      '[data-slot="data-table-cards"] > div > div',
    )
    // Cards are their own layout: the whole page stays mounted for them,
    // while the hidden table behind them is windowed.
    expect(
      container.querySelectorAll('[data-slot="data-table-cards"]'),
    ).toHaveLength(1)
    expect(cards.length).toBeGreaterThan(0)
    expect(recordRows(container).length).toBeLessThan(50)
  })

  it('measures detail rows as part of the window', async () => {
    withLayout()
    const rows = bigRows(10)
    const { container } = render(() => (
      <DataTable
        title="Events"
        rows={rows}
        columns={BIG_COLUMNS}
        virtual
        renderDetail={(row) => <p>Detail for {row.id}</p>}
      />
    ))
    expect(
      container.querySelector('[data-slot="data-table-detail"]'),
    ).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Expand ROW-1' }))
    await waitFor(() =>
      expect(
        container.querySelector('[data-slot="data-table-detail"]'),
      ).toBeTruthy(),
    )
    const detail = container.querySelector(
      'tr[data-slot="data-table-detail"]',
    ) as HTMLTableRowElement
    expect(detail.getAttribute('data-index')).toBe('1')
  })

  it('keeps pinned columns composed with the window', () => {
    withLayout()
    const rows = bigRows(200)
    const { container } = render(() => (
      <DataTable
        title="Events"
        rows={rows}
        columns={BIG_COLUMNS}
        virtual
        pinnedStart="id"
      />
    ))
    const pinned = container.querySelectorAll(
      'tbody td[data-column="id"][data-pin-edge="start"]',
    )
    expect(pinned.length).toBeGreaterThan(0)
    for (const cell of pinned) {
      expect((cell as HTMLElement).className).toContain('sticky')
    }
  })
})

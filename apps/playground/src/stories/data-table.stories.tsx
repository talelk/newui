import { createServerTableState } from '@talelk/newui-data/query'
import { DataTable } from '@talelk/newui-organisms'
import { createMemo, createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { seedTasks } from '../examples/tasks-data'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  const [rows, setRows] = createSignal(seedTasks())
  return (
    <DataTable
      title="Tasks"
      rows={rows()}
      columns={[
        { accessorKey: 'id', header: 'Task', meta: { mobile: 'subtitle' } },
        { accessorKey: 'title', header: 'Title', meta: { mobile: 'title' } },
        { accessorKey: 'status', header: 'Status', meta: { mobile: 'status' } },
        {
          accessorKey: 'priority',
          header: 'Priority',
          meta: { mobile: 'meta' },
        },
      ]}
      actionLabel="Complete selected"
      rowSelectable={(row) => row.status !== 'Done'}
      onRowsAction={(ids) =>
        setRows((previous) =>
          previous.map((row) =>
            ids.includes(row.id) ? { ...row, status: 'Done' } : row,
          ),
        )
      }
    />
  )
}

const meta = {
  title: 'Organisms/DataTable',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

export const Loading: Story = {
  render: () => (
    <DataTable
      title="Tasks"
      rows={[]}
      loading
      columns={[{ accessorKey: 'title', header: 'Title' }]}
    />
  ),
}

export const Empty: Story = {
  render: () => (
    <DataTable
      title="Tasks"
      rows={[]}
      emptyTitle="No tasks match"
      emptyHint="Try clearing the search."
      columns={[{ accessorKey: 'title', header: 'Title' }]}
    />
  ),
}

export const Error: Story = {
  render: () => (
    <DataTable
      title="Tasks"
      rows={[]}
      error="The local request failed."
      onRetry={() => {}}
      columns={[{ accessorKey: 'title', header: 'Title' }]}
    />
  ),
}

/** Pinning and inline editing: the identifier stays put, estimates edit in place. */
export const PinnedEditable: Story = {
  render: () => {
    const [rows, setRows] = createSignal(seedTasks())
    return (
      <DataTable
        title="Tasks"
        rows={rows()}
        columns={[
          { accessorKey: 'id', header: 'Task', meta: { mobile: 'subtitle' } },
          { accessorKey: 'title', header: 'Title', meta: { mobile: 'title' } },
          {
            accessorKey: 'status',
            header: 'Status',
            meta: { mobile: 'status' },
          },
          {
            accessorKey: 'title',
            header: 'Title',
            meta: {
              editable: true,
              mobile: 'title',
            },
          },
        ]}
        pinnedStart="id"
        editable
        onCellChange={(id, columnId, value) =>
          setRows((previous) =>
            previous.map((row) =>
              row.id === id ? { ...row, [columnId]: value } : row,
            ),
          )
        }
      />
    )
  },
}

/**
 * Grouping, aggregation and detail rows: rows group by status, the footer
 * totals the visible page, and every row opens to its own detail.
 */
export const Grouping: Story = {
  render: () => {
    const [rows] = createSignal(seedTasks())
    const [grouping, setGrouping] = createSignal<string[]>(['status'])
    return (
      <DataTable
        title="Tasks"
        rows={rows()}
        columns={[
          { accessorKey: 'id', header: 'Task', meta: { mobile: 'subtitle' } },
          { accessorKey: 'title', header: 'Title', meta: { mobile: 'title' } },
          {
            accessorKey: 'status',
            header: 'Status',
            groupable: true,
            meta: { mobile: 'status' },
          },
          {
            accessorKey: 'priority',
            header: 'Priority',
            aggregate: 'count',
            meta: { mobile: 'meta' },
          },
        ]}
        grouping={grouping()}
        onGroupingChange={setGrouping}
        summary="page"
        renderDetail={(row) => (
          <p class="text-caption text-ink-gray-7">
            {row.id} — {row.title} · {row.status}
          </p>
        )}
      />
    )
  },
}

/**
 * Server mode: `createServerTableState` owns the slices and a local fake
 * stands in for the backend — sort, slice, hand the page over. A real app
 * swaps the fake for `createCollection` keyed by `state.key(...)`.
 */
export const ServerMode: Story = {
  render: () => {
    const all = seedTasks()
    const state = createServerTableState({
      initial: { pagination: { pageSize: 5 } },
    })
    const sorted = createMemo(() => {
      const sort = state.sorting()[0]
      const rows = [...all]
      if (sort) {
        rows.sort((a, b) => {
          const before =
            String(a[sort.id as keyof typeof a]) <
            String(b[sort.id as keyof typeof a])
          return (before ? 1 : -1) * (sort.desc ? -1 : 1)
        })
      }
      return rows
    })
    const page = createMemo(() => {
      const { pageIndex, pageSize } = state.pagination()
      return sorted().slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
    })
    return (
      <DataTable
        title="Tasks"
        rows={page()}
        columns={[
          { accessorKey: 'id', header: 'Task', meta: { mobile: 'subtitle' } },
          { accessorKey: 'title', header: 'Title', meta: { mobile: 'title' } },
          {
            accessorKey: 'status',
            header: 'Status',
            meta: { mobile: 'status' },
          },
        ]}
        server={{ total: all.length }}
        sorting={state.sorting()}
        onSortingChange={state.setSorting}
        pagination={state.pagination()}
        onPaginationChange={state.setPagination}
        globalFilter={state.globalFilter()}
        onGlobalFilterChange={state.setGlobalFilter}
      />
    )
  },
}

import { DataTable } from '@talelk/newui-organisms'
import { createSignal } from 'solid-js'
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

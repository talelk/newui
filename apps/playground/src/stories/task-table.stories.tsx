import { DataTable } from '@newui/data/table'
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
        { accessorKey: 'id', header: 'Task' },
        { accessorKey: 'title', header: 'Title' },
        { accessorKey: 'status', header: 'Status' },
        { accessorKey: 'priority', header: 'Priority' },
      ]}
      actionLabel="Complete selected"
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
  title: 'Compositions/TaskTable',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

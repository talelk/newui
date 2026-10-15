import { createSignal } from 'solid-js'
import { DataTable } from '../examples/DataTable'
import { seedTasks } from '../examples/tasks-data'

export default function TaskTable() {
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

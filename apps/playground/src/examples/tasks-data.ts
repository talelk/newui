import type { Repository } from '@newui/data/query'

export const TASK_STATUSES = [
  'Backlog',
  'Todo',
  'In Progress',
  'Done',
  'Canceled',
] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]
export interface TaskRecord {
  id: string
  title: string
  status: TaskStatus
  priority: string
  label: string
  owner: string
  due: string
  project: string
  comments: string[]
}
const TITLES = [
  'Review the revenue dashboard',
  'Improve keyboard navigation',
  'Connect the billing integration',
  'Document the release checklist',
  'Resolve the export formatting issue',
  'Audit chart contrast',
  'Ship the customer onboarding flow',
  'Update the design tokens',
  'Add account-level permissions',
  'Simplify the reporting filters',
]
export function seedTasks(count = 1000): TaskRecord[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `TASK-${1001 + index}`,
    title: `${TITLES[index % TITLES.length] ?? 'Review project'}${index >= TITLES.length ? ` · ${Math.floor(index / TITLES.length) + 1}` : ''}`,
    status: TASK_STATUSES[index % TASK_STATUSES.length] ?? 'Todo',
    priority: ['High', 'Medium', 'Low'][index % 3] ?? 'Medium',
    label: ['Feature', 'Bug', 'Design', 'Docs'][index % 4] ?? 'Feature',
    owner:
      ['Rhea Kapoor', 'Priya Nair', 'Sam Rivera', 'Ana Costa'][index % 4] ??
      'Rhea Kapoor',
    due: `Sep ${18 + (index % 12)}, 2026`,
    project: ['Website', 'Mobile app', 'Design system'][index % 3] ?? 'Website',
    comments: [],
  }))
}

export interface NewTask {
  title: string
  priority: string
}

/**
 * The local task store, behind the kit's `Repository` contract.
 *
 * `create` fills the defaults a new task gets; `update` is the only write verb,
 * so "complete", "reassign" and "comment" are patches at the call site rather
 * than a method each.
 */
export function createTaskRepository(): Repository<TaskRecord, NewTask> {
  let rows = seedTasks()
  return {
    list: async () => [...rows],
    create: async (input) => {
      const record: TaskRecord = {
        ...input,
        id: `TASK-${1001 + rows.length}`,
        status: 'Todo',
        label: 'Feature',
        owner: 'Rhea Kapoor',
        due: 'Sep 30, 2026',
        project: 'Website',
        comments: [],
      }
      rows = [record, ...rows]
      return record
    },
    update: async (id, patch) => {
      rows = rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
      const updated = rows.find((row) => row.id === id)
      if (!updated) throw new Error(`No task called ${id}`)
      return updated
    },
    remove: async (ids) => {
      const gone = new Set(ids)
      rows = rows.filter((row) => !gone.has(row.id))
    },
  }
}
export type TaskRepository = ReturnType<typeof createTaskRepository>

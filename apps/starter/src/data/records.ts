import type { Repository } from '@talelk/newui-data/query'

/**
 * The starter's data seam.
 *
 * A repository is the one place that knows where records come from. This one
 * holds them in memory, with a small delay so the loading and pending states the
 * screens render are visible rather than theoretical. Swapping it for an HTTP
 * client is a rewrite of these four methods — nothing above this file changes,
 * which is the property the layer exists for.
 */

export type ProjectStatus = 'Active' | 'Paused' | 'Done'

export interface Project {
  id: string
  name: string
  owner: string
  status: ProjectStatus
  /** Whole dollars. */
  budget: number
  /** ISO timestamp. */
  updatedAt: string
}

/** What a caller supplies to create one: the repository owns id and timestamp. */
export type NewProject = Pick<Project, 'name' | 'owner' | 'status' | 'budget'>

export const PROJECT_STATUSES: ProjectStatus[] = ['Active', 'Paused', 'Done']

const OWNERS = [
  'Rhea Kapoor',
  'Daniel Okafor',
  'Mariam Haddad',
  'Jonas Weber',
  'Sofia Rossi',
  'Kenji Watanabe',
]

const NAMES = [
  'Ledger migration',
  'Billing portal',
  'Field service app',
  'Design tokens audit',
  'Support inbox',
  'Partner API',
  'Onboarding flows',
  'Warehouse sync',
  'Payroll exports',
  'Contract templates',
  'Insights dashboard',
  'Access reviews',
  'Mobile approvals',
  'Data retention',
  'Vendor register',
  'Release notes',
  'Status page',
  'Help centre',
  'Expense policy',
  'Renewal tracker',
  'Customer health',
  'Sandbox refresh',
  'Brand refresh',
  'Quarterly planning',
]

/** Deterministic demo records: the same list on every load, in every theme. */
export const SEED: Project[] = NAMES.map((name, index) => ({
  id: `PRJ-${String(index + 1).padStart(3, '0')}`,
  name,
  owner: OWNERS[index % OWNERS.length] ?? 'Unassigned',
  status: PROJECT_STATUSES[index % PROJECT_STATUSES.length] ?? 'Active',
  budget: 4_000 + ((index * 3_750) % 44_000),
  // Spread over the last three weeks, so the relative column has range.
  updatedAt: new Date(Date.UTC(2026, 9, 20 - (index % 21))).toISOString(),
}))

/**
 * The in-memory repository.
 *
 * Abort is honoured because TanStack Query cancels a superseded list request;
 * a repository that ignored the signal would keep a stale answer alive and make
 * the query cache race itself.
 */
export function createProjectRepository(
  options: { seed?: Project[]; latency?: number } = {},
): Repository<Project, NewProject> & { reset: () => void } {
  const seed = () => (options.seed ?? SEED).map((record) => ({ ...record }))
  let rows = seed()
  let next = rows.length + 1
  const latency = options.latency ?? 240

  const wait = (signal?: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, latency)
      signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(timer)
          reject(new DOMException('The request was cancelled.', 'AbortError'))
        },
        { once: true },
      )
    })

  const stamp = () => new Date().toISOString()

  return {
    async list({ signal } = {}) {
      await wait(signal)
      return rows.map((record) => ({ ...record }))
    },

    async create(input, { signal } = {}) {
      await wait(signal)
      const record: Project = {
        ...input,
        id: `PRJ-${String(next++).padStart(3, '0')}`,
        updatedAt: stamp(),
      }
      rows = [record, ...rows]
      return { ...record }
    },

    async update(id, patch, { signal } = {}) {
      await wait(signal)
      const current = rows.find((record) => record.id === id)
      if (!current) throw new Error(`No project with the id ${id}.`)
      const record: Project = { ...current, ...patch, updatedAt: stamp() }
      rows = rows.map((row) => (row.id === id ? record : row))
      return { ...record }
    },

    async remove(ids, { signal } = {}) {
      await wait(signal)
      const gone = new Set(ids)
      rows = rows.filter((row) => !gone.has(row.id))
    },

    /** Demo affordance: restore the seed after a destructive run. */
    reset() {
      rows = seed()
      next = rows.length + 1
    },
  }
}

/** One repository for the app; the collection is what makes it shared. */
export const projectRepository = createProjectRepository()

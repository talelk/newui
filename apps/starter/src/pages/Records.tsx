import { Badge, Button, TextInput } from '@newui/atoms'
import { count, optionsOf, usd } from '@newui/data'
import { createAppForm, Form, fieldError } from '@newui/data/form'
import { createCollection } from '@newui/data/query'
import { Alert, Dialog, Select } from '@newui/molecules'
import {
  DataTable,
  type DataTableColumn,
  FilterBar,
  StatGrid,
} from '@newui/organisms'
import {
  createEffect,
  createMemo,
  createSignal,
  type JSX,
  on,
  Show,
  untrack,
} from 'solid-js'
import {
  type NewProject,
  PROJECT_STATUSES,
  type Project,
  type ProjectStatus,
  projectRepository,
} from '../data/records'
import { emitStarterEvent } from '../devtools/events'
import { Shell } from '../shell/Shell'

const STATUS_THEME: Record<ProjectStatus, 'green' | 'amber' | 'gray'> = {
  Active: 'green',
  Paused: 'amber',
  Done: 'gray',
}

const OWNERS = [
  'Rhea Kapoor',
  'Daniel Okafor',
  'Mariam Haddad',
  'Jonas Weber',
  'Sofia Rossi',
  'Kenji Watanabe',
]

const DAY = 86_400_000

/** A date the reader can use, not a timestamp. */
function ago(iso: string): string {
  const days = Math.round((Date.now() - Date.parse(iso)) / DAY)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

interface Notice {
  text: string
  tone: 'green' | 'red'
}

/**
 * The list screen: a collection, a filter bar, four stats and a typed table.
 *
 * The page never touches a cache. It reads `collection.query.rows()` and calls
 * `collection.create` / `.update` / `.remove`; the mutations land on screen
 * immediately and roll back if the repository fails (spec/data.md).
 */
export function Records(): JSX.Element {
  const [status, setStatus] = createSignal('all')
  const [notice, setNotice] = createSignal<Notice | null>(null)
  const [createOpen, setCreateOpen] = createSignal(false)
  const [editing, setEditing] = createSignal<Project | null>(null)

  const changeStatus = (next: string) => {
    setStatus(next)
    emitStarterEvent('filters:status', { status: next })
  }

  const collection = createCollection<Project, NewProject>(() => ({
    key: ['projects'],
    repository: projectRepository,
    onError: (error) => {
      setNotice({ text: error.message, tone: 'red' })
      emitStarterEvent('query:error', { message: error.message })
    },
  }))

  // The table owns search; the bar owns the filter that outlives a query.
  const rows = createMemo(() =>
    collection.query
      .rows()
      .filter((project) => status() === 'all' || project.status === status()),
  )

  const active = () =>
    collection.query.rows().filter((project) => project.status === 'Active')
  const paused = () =>
    collection.query.rows().filter((project) => project.status === 'Paused')
  const done = () =>
    collection.query.rows().filter((project) => project.status === 'Done')
  const budget = (projects: Project[]) =>
    projects.reduce((sum, project) => sum + project.budget, 0)

  const columns: DataTableColumn<Project>[] = [
    {
      accessorKey: 'name',
      header: 'Project',
      cell: (context) => (
        <button
          type="button"
          class="rounded-3 text-start font-medium text-ink-gray-9 hover:text-ink-blue-7 focus-visible:focus-ring"
          onClick={() => {
            const project = context.row.original
            emitStarterEvent('record:open', {
              id: project.id,
              name: project.name,
              status: project.status,
            })
            setEditing(project)
          }}
        >
          {context.row.original.name}
        </button>
      ),
    },
    { accessorKey: 'owner', header: 'Owner' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (context) => (
        <Badge
          theme={STATUS_THEME[context.row.original.status]}
          label={context.row.original.status}
        />
      ),
    },
    {
      accessorKey: 'budget',
      header: 'Budget',
      meta: { align: 'end' },
      cell: (context) => (
        <span class="tabular-nums">{usd(context.row.original.budget)}</span>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: (context) => (
        <span class="text-ink-gray-7">
          {ago(context.row.original.updatedAt)}
        </span>
      ),
    },
  ]

  const clearFilters = () => changeStatus('all')

  const create = async (input: NewProject) => {
    const created = await collection.create.mutateAsync(input)
    emitStarterEvent('record:create', {
      id: created.id,
      name: created.name,
      owner: created.owner,
      status: created.status,
      budget: created.budget,
    })
    setCreateOpen(false)
    setNotice({ text: `${input.name} was created.`, tone: 'green' })
  }

  const updateProject = async (project: Project, patch: Partial<Project>) => {
    const updated = await collection.update.mutateAsync({
      id: project.id,
      patch,
    })
    emitStarterEvent('record:update', {
      id: updated.id,
      name: updated.name,
      status: updated.status,
    })
    setEditing(null)
    setNotice({ text: `${project.name} was updated.`, tone: 'green' })
  }

  const deleteProject = async (project: Project) => {
    await collection.remove.mutateAsync({ ids: [project.id] })
    emitStarterEvent('record:delete', {
      id: project.id,
      name: project.name,
    })
    setEditing(null)
    setNotice({ text: `${project.name} was deleted.`, tone: 'green' })
  }

  const archive = (ids: string[]) => {
    collection.updateMany.mutate({ ids, patch: { status: 'Done' } })
    emitStarterEvent('record:archive', { ids })
    setNotice({
      text: `${count(ids.length)} project${ids.length === 1 ? '' : 's'} marked done.`,
      tone: 'green',
    })
  }

  return (
    <Shell
      title="Projects, at a glance"
      description="One collection, filtered and sorted in the browser. Edits are optimistic and roll back on failure."
      sections={[{ label: 'Workspace', href: '/' }, { label: 'Projects' }]}
      actions={
        <Button
          variant="solid"
          theme="blue"
          iconLeft="lucide-plus"
          onClick={() => setCreateOpen(true)}
        >
          New project
        </Button>
      }
    >
      <div class="flex flex-col gap-4">
        <Show when={notice()}>
          {(message) => (
            <Alert
              theme={message().tone}
              title={message().text}
              dismissible
              onDismiss={() => setNotice(null)}
            />
          )}
        </Show>

        <Show when={collection.query.isError()}>
          <Alert
            theme="red"
            title="The projects could not be loaded."
            description={collection.query.error()?.message}
            primaryAction={{
              label: 'Try again',
              onClick: () => void collection.query.refetch(),
            }}
          />
        </Show>

        <div class="hidden sm:block">
          <StatGrid
            stats={[
              {
                label: 'Active budget',
                value: usd(budget(active())),
                hint: `${active().length} projects in flight`,
                icon: 'lucide-wallet',
              },
              {
                label: 'Active',
                value: count(active().length),
                hint: 'Being worked on now',
                icon: 'lucide-activity',
              },
              {
                label: 'Paused',
                value: count(paused().length),
                hint: 'Waiting on a decision',
                icon: 'lucide-pause',
              },
              {
                label: 'Done',
                value: count(done().length),
                hint: `${usd(budget(done()))} delivered`,
                icon: 'lucide-circle-check',
              },
            ]}
          />
        </div>

        <FilterBar
          selects={[
            {
              label: 'Status',
              options: [
                { label: 'All statuses', value: 'all' },
                ...optionsOf(PROJECT_STATUSES),
              ],
              value: status(),
              onValueChange: changeStatus,
            },
          ]}
          chips={[
            ...(status() === 'all'
              ? []
              : [
                  {
                    label: `Status: ${status()}`,
                    onRemove: () => changeStatus('all'),
                  },
                ]),
          ]}
          resultCount={rows().length}
          onClearAll={status() === 'all' ? undefined : clearFilters}
        />

        <DataTable
          title="Projects"
          rows={rows()}
          columns={columns}
          pageSize={8}
          actionLabel="Mark selected done"
          onRowsAction={archive}
          recordsLabel="projects"
          emptyTitle={collection.query.isPending() ? 'Loading…' : 'No projects'}
          emptyHint={
            collection.query.isPending()
              ? 'Fetching the collection.'
              : 'Change the filters, or create the first one.'
          }
          onClearFilters={status() === 'all' ? undefined : clearFilters}
        />
      </div>

      <CreateProjectDialog
        open={createOpen()}
        onOpenChange={setCreateOpen}
        onCreate={create}
      />

      <ProjectDialog
        project={editing()}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
        onSave={updateProject}
        onDelete={deleteProject}
      />
    </Shell>
  )
}

/**
 * Create: TanStack Form's validators, the kit's `Form` element, and the
 * submit lifecycle the button reads. Nothing here knows where records live —
 * `onCreate` is the seam.
 */
function CreateProjectDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (input: NewProject) => Promise<void>
}): JSX.Element {
  const onCreate = untrack(() => props.onCreate)
  const { form, submitting } = createAppForm({
    defaultValues: {
      name: '',
      owner: OWNERS[0] ?? '',
      status: 'Active' as ProjectStatus,
      budget: '',
    },
    onSubmit: async (value) => {
      await onCreate({
        name: value.name.trim(),
        owner: value.owner,
        status: value.status,
        budget: Number(value.budget),
      })
    },
  })

  // A dialog that reopens with the last attempt in it invites a duplicate.
  createEffect(
    on(
      () => props.open,
      (open) => {
        if (open) form.reset()
      },
    ),
  )

  const nameError = ({ value }: { value: string }) =>
    value.trim().length < 2 ? 'Give the project a name.' : undefined
  const budgetError = ({ value }: { value: string }) =>
    value !== '' && Number(value) >= 0
      ? undefined
      : 'Enter a budget of zero or more.'

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>New project</Dialog.Title>
          <Dialog.Description>
            The repository assigns the id and the timestamp.
          </Dialog.Description>
        </Dialog.Header>
        <Form form={form} class="mt-5 flex flex-col gap-4">
          <form.Field
            name="name"
            validators={{ onChange: nameError, onSubmit: nameError }}
          >
            {(field) => (
              <TextInput
                label="Name"
                required
                value={field().state.value}
                error={fieldError(field())}
                onInput={(event) =>
                  field().handleChange(event.currentTarget.value)
                }
              />
            )}
          </form.Field>

          <form.Field name="owner">
            {(field) => (
              <Select
                label="Owner"
                options={optionsOf(OWNERS)}
                value={field().state.value}
                onValueChange={(value) =>
                  field().handleChange(value ?? OWNERS[0] ?? '')
                }
              />
            )}
          </form.Field>

          <form.Field name="status">
            {(field) => (
              <Select
                label="Status"
                options={optionsOf(PROJECT_STATUSES)}
                value={field().state.value}
                onValueChange={(value) =>
                  field().handleChange((value ?? 'Active') as ProjectStatus)
                }
              />
            )}
          </form.Field>

          <form.Field name="budget" validators={{ onSubmit: budgetError }}>
            {(field) => (
              <TextInput
                label="Budget"
                type="number"
                required
                value={field().state.value}
                error={fieldError(field())}
                onInput={(event) =>
                  field().handleChange(event.currentTarget.value)
                }
              />
            )}
          </form.Field>

          <Dialog.Footer>
            <Button onClick={() => props.onOpenChange(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="solid"
              theme="blue"
              loading={submitting()}
            >
              Create project
            </Button>
          </Dialog.Footer>
        </Form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

/**
 * Detail: one record, an optimistic status change, and a delete that asks once.
 */
function ProjectDialog(props: {
  project: Project | null
  onOpenChange: (open: boolean) => void
  onSave: (project: Project, patch: Partial<Project>) => Promise<void>
  onDelete: (project: Project) => Promise<void>
}): JSX.Element {
  const [status, setStatus] = createSignal<ProjectStatus>('Active')
  const [confirming, setConfirming] = createSignal(false)
  const [saving, setSaving] = createSignal(false)

  createEffect(
    on(
      () => props.project,
      (project) => {
        if (project) {
          setStatus(project.status)
          setConfirming(false)
        }
      },
    ),
  )

  const save = async (project: Project) => {
    setSaving(true)
    try {
      await props.onSave(project, { status: status() })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root
      open={props.project !== null}
      onOpenChange={props.onOpenChange}
    >
      <Dialog.Content>
        <Show when={props.project}>
          {(project) => (
            <>
              <Dialog.Header>
                <Dialog.Title>{project().name}</Dialog.Title>
                <Dialog.Description>
                  {project().id} · owned by {project().owner} · updated{' '}
                  {ago(project().updatedAt)}
                </Dialog.Description>
              </Dialog.Header>

              <div class="mt-5 flex flex-col gap-4">
                <div class="flex flex-wrap items-center gap-2 text-sm text-ink-gray-7">
                  <Badge
                    theme={STATUS_THEME[project().status]}
                    label={project().status}
                  />
                  <span>Budget {usd(project().budget)}</span>
                </div>

                <Select
                  label="Status"
                  options={optionsOf(PROJECT_STATUSES)}
                  value={status()}
                  onValueChange={(value) =>
                    setStatus((value ?? 'Active') as ProjectStatus)
                  }
                />

                <Show
                  when={confirming()}
                  fallback={
                    <button
                      type="button"
                      class="self-start rounded-3 text-sm text-ink-red-6 focus-visible:focus-ring"
                      onClick={() => setConfirming(true)}
                    >
                      Delete this project
                    </button>
                  }
                >
                  <div class="flex flex-wrap items-center gap-2 rounded-3 border border-outline-red-3 bg-surface-red-1 p-3">
                    <p class="flex-1 text-sm text-ink-red-7">
                      This removes the record. It cannot be undone.
                    </p>
                    <Button
                      size="sm"
                      variant="solid"
                      theme="red"
                      onClick={() => void props.onDelete(project())}
                    >
                      Delete forever
                    </Button>
                    <Button size="sm" onClick={() => setConfirming(false)}>
                      Keep
                    </Button>
                  </div>
                </Show>
              </div>

              <Dialog.Footer>
                <Button onClick={() => props.onOpenChange(false)}>Close</Button>
                <Button
                  variant="solid"
                  theme="blue"
                  loading={saving()}
                  disabled={status() === project().status}
                  onClick={() => void save(project())}
                >
                  Save status
                </Button>
              </Dialog.Footer>
            </>
          )}
        </Show>
      </Dialog.Content>
    </Dialog.Root>
  )
}

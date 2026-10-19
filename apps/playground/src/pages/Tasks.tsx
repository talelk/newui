import { FilterBar, StatGrid } from '@newui/blocks'
import {
  Badge,
  BottomSheet,
  Button,
  Dialog,
  EmptyState,
  MobileNav,
  MobileNavItem,
  Pagination,
  Select,
  Textarea,
  TextInput,
} from '@newui/ui'
import { createForm } from '@tanstack/solid-form'
import {
  createMutation,
  createQuery,
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/solid-query'
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  onCleanup,
  Show,
} from 'solid-js'
import { ActivityList } from '../examples/ActivityList'
import { DataTable, type DataTableColumn } from '../examples/DataTable'
import { Notice } from '../examples/Notice'
import { optionsOf } from '../examples/select'
import {
  createTaskRepository,
  TASK_STATUSES,
  type TaskRecord,
  type TaskRepository,
} from '../examples/tasks-data'
import { WorkspaceNav } from '../examples/WorkspaceNav'
import { WorkspacePage } from '../examples/WorkspacePage'

const taskColumns = (
  onOpen: (id: string) => void,
): DataTableColumn<TaskRecord>[] => [
  {
    accessorKey: 'id',
    header: 'Task',
    cell: (context) => (
      <span class="whitespace-nowrap text-caption text-ink-gray-7">
        {context.getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: (context) => (
      <div class="flex min-w-72 items-center gap-2">
        <Badge variant="outline" size="sm">
          {context.row.original.label}
        </Badge>
        <button
          type="button"
          class="rounded-3 text-start font-medium text-ink-blue-link focus-visible:focus-ring"
          onClick={() => onOpen(context.row.original.id)}
        >
          {context.getValue<string>()}
        </button>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (context) => (
      <Badge
        theme={
          context.getValue<string>() === 'Done'
            ? 'green'
            : context.getValue<string>() === 'In Progress'
              ? 'blue'
              : 'gray'
        }
      >
        {context.getValue<string>()}
      </Badge>
    ),
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: (context) => (
      <span
        classList={{
          'text-ink-red-7': context.getValue<string>() === 'High',
          'text-ink-gray-7': context.getValue<string>() !== 'High',
        }}
      >
        {context.getValue<string>()}
      </span>
    ),
  },
  { accessorKey: 'owner', header: 'Assignee' },
  { accessorKey: 'due', header: 'Due date' },
]

function NewTask(props: {
  onSave: (value: { title: string; priority: string }) => Promise<void>
}): JSX.Element {
  const validate = (value: string) =>
    value.trim().length >= 3
      ? undefined
      : 'Enter a title with at least 3 characters.'
  const form = createForm(() => ({
    defaultValues: { title: '', priority: 'Medium' },
    onSubmit: async ({ value }) =>
      props.onSave({ ...value, title: value.title.trim() }),
  }))
  const submitting = form.useSelector((state) => state.isSubmitting)
  return (
    <form
      noValidate
      class="mt-4 flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="title"
        validators={{
          onChange: ({ value }) => validate(value),
          onSubmit: ({ value }) => validate(value),
        }}
      >
        {(field) => (
          <TextInput
            label="Task title"
            required
            placeholder="What needs to be done?"
            value={field().state.value}
            error={
              field().state.meta.errors.length
                ? field().state.meta.errors.join(' ')
                : undefined
            }
            onInput={(event) => field().handleChange(event.currentTarget.value)}
          />
        )}
      </form.Field>
      <form.Field name="priority">
        {(field) => (
          <Select
            label="Priority"
            value={[field().state.value]}
            options={['High', 'Medium', 'Low'].map((value) => ({
              value,
              label: value,
            }))}
            onValueChange={(value) =>
              field().handleChange(value[0] ?? 'Medium')
            }
          />
        )}
      </form.Field>
      <div class="flex justify-end">
        <Button
          type="submit"
          variant="solid"
          theme="blue"
          loading={submitting()}
        >
          Create task
        </Button>
      </div>
    </form>
  )
}

function TasksWorkspace(props: { repository: TaskRepository }): JSX.Element {
  const queryClient = useQueryClient()
  const [failure, setFailure] = createSignal(false)
  const [status, setStatus] = createSignal('all')
  const [priority, setPriority] = createSignal('all')
  const [view, setView] = createSignal('table')
  const [open, setOpen] = createSignal(false)
  const [notice, setNotice] = createSignal('')
  const [projectsOpen, setProjectsOpen] = createSignal(false)
  const [scope, setScope] = createSignal('all')
  const [owner, setOwner] = createSignal('all')
  const [search, setSearch] = createSignal('')
  const [mobilePage, setMobilePage] = createSignal(1)
  const [taskSort, setTaskSort] = createSignal('Default order')
  const [grouped, setGrouped] = createSignal(false)
  const [selected, setSelected] = createSignal<string>()
  const [comment, setComment] = createSignal('')
  const [detailError, setDetailError] = createSignal('')
  const columns = taskColumns(setSelected)
  const query = createQuery(() => ({
    queryKey: ['example-tasks'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 120))
      if (failure())
        throw new Error('The local task service is temporarily unavailable.')
      return props.repository.read()
    },
    staleTime: Infinity,
    retry: false,
    throwOnError: false,
  }))
  const mutation = createMutation(() => ({
    mutationFn: async (operation: {
      create?: { title: string; priority: string }
      complete?: string[]
    }) =>
      operation.create
        ? props.repository.create(operation.create)
        : props.repository.complete(operation.complete ?? []),
    onSuccess: (rows) => queryClient.setQueryData(['example-tasks'], rows),
  }))
  const all = () => (query.isPending ? [] : (query.data ?? []))
  const filtered = createMemo(() => {
    const order = taskSort()
    return all()
      .filter(
        (row) =>
          (status() === 'all' || row.status === status()) &&
          (priority() === 'all' || row.priority === priority()) &&
          (scope() === 'all' ||
            (scope() === 'mine'
              ? row.owner === 'Rhea Kapoor'
              : row.project === scope())) &&
          (owner() === 'all' || row.owner === owner()) &&
          `${row.id} ${row.title}`
            .toLowerCase()
            .includes(search().toLowerCase()),
      )
      .sort((a, b) =>
        order === 'Title'
          ? a.title.localeCompare(b.title)
          : order === 'Priority'
            ? ['High', 'Medium', 'Low'].indexOf(a.priority) -
              ['High', 'Medium', 'Low'].indexOf(b.priority)
            : order === 'Due date'
              ? Date.parse(a.due) - Date.parse(b.due)
              : 0,
      )
  })
  createEffect(() => {
    status()
    priority()
    scope()
    owner()
    search()
    taskSort()
    setMobilePage(1)
  })
  const mobileRows = createMemo(() =>
    filtered().slice((mobilePage() - 1) * 30, mobilePage() * 30),
  )

  const current = createMemo(() => all().find((row) => row.id === selected()))
  function update(changes: Parameters<TaskRepository['update']>[1]) {
    const id = selected()
    if (id)
      queryClient.setQueryData(
        ['example-tasks'],
        props.repository.update(id, changes),
      )
  }
  const done = () => all().filter((row) => row.status === 'Done').length
  const saveTask = (value: { title: string; priority: string }) =>
    mutation.mutateAsync({ create: value }).then(() => {
      setOpen(false)
      setNotice(`Created ${value.title}.`)
    })
  return (
    <WorkspacePage
      section="Tasks"
      title={
        scope() === 'all'
          ? 'All tasks'
          : scope() === 'mine'
            ? 'My tasks'
            : scope()
      }
      description="Plan the next release, keep work moving, and give every detail a home."
      sidebar={
        <WorkspaceNav
          label="Task scopes"
          heading="Tasks"
          value={
            scope() === 'all'
              ? 'All tasks'
              : scope() === 'mine'
                ? 'My tasks'
                : scope()
          }
          onChange={(label) =>
            setScope(
              label === 'All tasks'
                ? 'all'
                : label === 'My tasks'
                  ? 'mine'
                  : label,
            )
          }
          items={[
            {
              label: 'All tasks',
              icon: 'lucide-list-checks',
              count: all().length,
            },
            {
              label: 'My tasks',
              icon: 'lucide-user',
              count: all().filter((row) => row.owner === 'Rhea Kapoor').length,
            },
            ...['Website', 'Mobile app', 'Design system'].map((project) => ({
              label: project,
              icon: 'lucide-folder',
              count: all().filter((row) => row.project === project).length,
            })),
          ]}
        />
      }
      actions={
        <>
          <Button
            variant="outline"
            iconLeft="lucide-refresh-cw"
            loading={query.isFetching}
            onClick={() => {
              setFailure(false)
              void query.refetch()
            }}
          >
            Refresh
          </Button>
          <Button
            variant="solid"
            theme="blue"
            iconLeft="lucide-plus"
            onClick={() => setOpen(true)}
          >
            New task
          </Button>
        </>
      }
    >
      <FilterBar
        query={{
          placeholder: 'Find tasks',
          value: search(),
          onInput: setSearch,
        }}
        selects={[
          {
            label: 'Assignment',
            value: owner() === 'all' ? '' : owner(),
            onValueChange: (value) => setOwner(value || 'all'),
            options: optionsOf([
              'Rhea Kapoor',
              'Priya Nair',
              'Sam Rivera',
              'Ana Costa',
            ]),
          },
          {
            label: 'Status',
            value: status() === 'all' ? '' : status(),
            onValueChange: (value) => setStatus(value || 'all'),
            options: optionsOf(TASK_STATUSES),
          },
          {
            label: 'Priority',
            value: priority() === 'all' ? '' : priority(),
            onValueChange: (value) => setPriority(value || 'all'),
            options: optionsOf(['High', 'Medium', 'Low']),
          },
        ]}
        tabs={{
          value: view(),
          onValueChange: setView,
          options: [
            { label: 'Table', value: 'table' },
            { label: 'Activity', value: 'activity' },
          ],
        }}
        chips={[
          ...(status() !== 'all'
            ? [
                {
                  label: `Status: ${status()}`,
                  onRemove: () => setStatus('all'),
                },
              ]
            : []),
          ...(priority() !== 'all'
            ? [
                {
                  label: `Priority: ${priority()}`,
                  onRemove: () => setPriority('all'),
                },
              ]
            : []),
          ...(owner() !== 'all'
            ? [
                {
                  label: `Assignee: ${owner()}`,
                  onRemove: () => setOwner('all'),
                },
              ]
            : []),
          ...(scope() !== 'all'
            ? [
                {
                  label: `Scope: ${scope() === 'mine' ? 'My tasks' : scope()}`,
                  onRemove: () => setScope('all'),
                },
              ]
            : []),
          ...(search()
            ? [{ label: `Search: ${search()}`, onRemove: () => setSearch('') }]
            : []),
        ]}
        resultCount={filtered().length}
        onClearAll={() => {
          setStatus('all')
          setPriority('all')
          setOwner('all')
          setScope('all')
          setSearch('')
        }}
      >
        <Button aria-pressed={grouped()} onClick={() => setGrouped(!grouped())}>
          Group by status
        </Button>
        <div class="sm:hidden">
          <Select
            label="Sort task list"
            value={[taskSort()]}
            options={optionsOf([
              'Default order',
              'Title',
              'Priority',
              'Due date',
            ])}
            onValueChange={(value) => setTaskSort(value[0] ?? 'Default order')}
          />
        </div>
      </FilterBar>
      <div class="hidden sm:block">
        <StatGrid
          stats={[
            {
              label: 'Total tasks',
              value: all().length.toLocaleString('en-US'),
              hint: 'Across the workspace',
              icon: 'lucide-list-checks',
            },
            {
              label: 'In progress',
              value: all().filter((row) => row.status === 'In Progress').length,
              hint: 'Work moving forward',
              icon: 'lucide-clock',
            },
            {
              label: 'Completed',
              value: done(),
              hint: `${all().length ? Math.round((done() / all().length) * 100) : 0}% of all tasks`,
              icon: 'lucide-circle-check',
            },
            {
              label: 'High priority',
              value: all().filter(
                (row) => row.priority === 'High' && row.status !== 'Done',
              ).length,
              hint: 'Open and needs your attention',
              icon: 'lucide-flag',
            },
          ]}
        />
      </div>
      <Notice text={notice()} tone="green" onDismiss={() => setNotice('')} />
      <Show
        when={!query.isPending}
        fallback={
          <div role="status">
            <EmptyState
              bordered
              icon="lucide-list-checks"
              title="Loading tasks…"
              description="Fetching the workspace task list."
            />
          </div>
        }
      >
        <Show
          when={!query.isError}
          fallback={
            <div role="alert">
              <EmptyState
                bordered
                icon="lucide-circle-alert"
                title="Could not load tasks"
                description={query.error?.message}
                action={
                  <Button
                    onClick={() => {
                      setFailure(false)
                      void query.refetch()
                    }}
                  >
                    Try again
                  </Button>
                }
              />
            </div>
          }
        >
          <Show
            when={view() === 'table'}
            fallback={<ActivityList rows={filtered()} />}
          >
            <div class={grouped() ? 'hidden' : 'hidden sm:block'}>
              <DataTable
                title="Tasks"
                hideSearch
                rows={filtered()}
                columns={columns}
                actionLabel="Complete selected"
                onRowsAction={(ids) => {
                  mutation.mutate({ complete: ids })
                  setNotice(
                    `${ids.length} ${ids.length === 1 ? 'task' : 'tasks'} marked complete.`,
                  )
                }}
              />
            </div>
            <div
              data-slot="mobile-task-list"
              classList={{ 'sm:hidden': !grouped() }}
            >
              <For each={grouped() ? [...TASK_STATUSES] : ['Tasks']}>
                {(group) => (
                  <details
                    open
                    class="mb-3 rounded-5 border border-outline-gray-1 bg-surface-elevation-1"
                  >
                    <summary class="cursor-pointer rounded-3 p-3 font-medium focus-visible:focus-ring">
                      {group} ·{' '}
                      {
                        filtered().filter(
                          (row) => group === 'Tasks' || row.status === group,
                        ).length
                      }
                    </summary>
                    <ul class="divide-y divide-outline-gray-1">
                      <For
                        each={mobileRows().filter(
                          (row) => group === 'Tasks' || row.status === group,
                        )}
                      >
                        {(row) => (
                          <li>
                            <button
                              type="button"
                              class="flex w-full flex-col gap-2 p-3 text-start focus-visible:focus-ring"
                              onClick={() => setSelected(row.id)}
                            >
                              <span class="text-caption text-ink-gray-7">
                                {row.id} · {row.project}
                              </span>
                              <span class="font-medium">{row.title}</span>
                              <span class="text-caption">
                                {row.status} · {row.priority} · {row.owner}
                              </span>
                            </button>
                          </li>
                        )}
                      </For>
                    </ul>
                  </details>
                )}
              </For>
              <div class="flex flex-wrap items-center justify-center gap-2 p-3">
                <Pagination.Root
                  page={mobilePage()}
                  pageSize={30}
                  count={filtered().length}
                  onPageChange={setMobilePage}
                >
                  <Pagination.Range />
                  <Pagination.PrevTrigger />
                  <Pagination.Pages />
                  <Pagination.NextTrigger />
                </Pagination.Root>
              </div>
            </div>
          </Show>
        </Show>
      </Show>
      <details class="text-caption text-ink-gray-7">
        <summary class="w-fit cursor-pointer rounded-3 focus-visible:focus-ring">
          Explore loading and error states
        </summary>
        <div class="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setFailure(true)
              void query.refetch()
            }}
          >
            Simulate service error
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFailure(false)
              void query.refetch()
            }}
          >
            Reload tasks
          </Button>
        </div>
      </details>
      <div class="fixed inset-x-0 bottom-0 z-30 sm:hidden">
        <MobileNav aria-label="Tasks navigation">
          <MobileNavItem
            label="Inbox"
            icon="lucide-inbox"
            active={scope() === 'mine' && status() === 'Todo'}
            onClick={() => {
              setScope('mine')
              setStatus('Todo')
            }}
          />
          <MobileNavItem
            label="Tasks"
            icon="lucide-list-checks"
            active={scope() === 'all'}
            onClick={() => {
              setScope('all')
              setStatus('all')
            }}
          />
          <MobileNavItem
            label="Projects"
            icon="lucide-folder"
            active={['Website', 'Mobile app', 'Design system'].includes(
              scope(),
            )}
            onClick={() => setProjectsOpen(true)}
          />
          <MobileNavItem
            label="You"
            icon="lucide-user"
            active={scope() === 'mine' && status() === 'all'}
            onClick={() => {
              setScope('mine')
              setStatus('all')
              setNotice('Your tasks · Rhea Kapoor')
            }}
          />
        </MobileNav>
      </div>
      <BottomSheet
        open={projectsOpen()}
        onOpenChange={setProjectsOpen}
        title="Projects"
      >
        <div class="flex flex-col gap-2">
          <For each={['Website', 'Mobile app', 'Design system']}>
            {(project) => (
              <Button
                variant="ghost"
                onClick={() => {
                  setScope(project)
                  setProjectsOpen(false)
                }}
              >
                {project}
              </Button>
            )}
          </For>
        </div>
      </BottomSheet>
      <Dialog.Root
        open={!!current()}
        onOpenChange={(value) => {
          if (!value) {
            setSelected(undefined)
            setComment('')
            setDetailError('')
          }
        }}
      >
        <Dialog.Content class="max-sm:fixed max-sm:inset-0 max-sm:max-h-none max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none">
          <Dialog.Close>Back to tasks</Dialog.Close>
          <Show when={current()}>
            {(row) => (
              <>
                <Dialog.Header>
                  <Dialog.Title>{row().id}</Dialog.Title>
                  <Dialog.Description>
                    Edit task details and discuss the next step.
                  </Dialog.Description>
                </Dialog.Header>
                <form
                  class="mt-4 flex flex-col gap-3"
                  onSubmit={(event) => {
                    event.preventDefault()
                    const data = new FormData(event.currentTarget)
                    const title = String(data.get('title') ?? '').trim()
                    if (title.length < 3) {
                      setDetailError('Enter at least 3 characters.')
                      return
                    }
                    update({ title, due: String(data.get('due') ?? '') })
                    setDetailError('')
                    setNotice(`Saved ${row().id}.`)
                  }}
                >
                  <TextInput
                    name="title"
                    label="Task title"
                    value={row().title}
                    error={detailError()}
                    required
                  />
                  <TextInput name="due" label="Due date" value={row().due} />
                  <Select
                    label="Task status"
                    value={[row().status]}
                    options={TASK_STATUSES.map((value) => ({
                      value,
                      label: value,
                    }))}
                    onValueChange={(value) =>
                      update({ status: value[0] as TaskRecord['status'] })
                    }
                  />
                  <Select
                    label="Task priority"
                    value={[row().priority]}
                    options={['High', 'Medium', 'Low'].map((value) => ({
                      value,
                      label: value,
                    }))}
                    onValueChange={(value) =>
                      update({ priority: value[0] ?? 'Medium' })
                    }
                  />
                  <Select
                    label="Task assignee"
                    value={[row().owner]}
                    options={[
                      'Rhea Kapoor',
                      'Priya Nair',
                      'Sam Rivera',
                      'Ana Costa',
                    ].map((value) => ({ value, label: value }))}
                    onValueChange={(value) =>
                      update({ owner: value[0] ?? 'Rhea Kapoor' })
                    }
                  />
                  <Select
                    label="Task project"
                    value={[row().project]}
                    options={['Website', 'Mobile app', 'Design system'].map(
                      (value) => ({ value, label: value }),
                    )}
                    onValueChange={(value) =>
                      update({ project: value[0] ?? 'Website' })
                    }
                  />
                  <Button type="submit" variant="solid" theme="blue">
                    Save task details
                  </Button>
                </form>
                <section
                  aria-label="Task comments"
                  class="mt-4 flex flex-col gap-3"
                >
                  <h2 class="text-section">Comments</h2>
                  <For each={row().comments}>
                    {(text) => (
                      <p class="rounded-3 bg-surface-gray-1 p-3">
                        Rhea Kapoor: {text}
                      </p>
                    )}
                  </For>
                  <Textarea
                    label="Add comment"
                    value={comment()}
                    onInput={(event) => setComment(event.currentTarget.value)}
                  />
                  <Button
                    disabled={!comment().trim()}
                    onClick={() => {
                      queryClient.setQueryData(
                        ['example-tasks'],
                        props.repository.comment(row().id, comment()),
                      )
                      setComment('')
                    }}
                  >
                    Post comment
                  </Button>
                </section>
              </>
            )}
          </Show>
        </Dialog.Content>
      </Dialog.Root>
      <Dialog.Root open={open()} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Create a task</Dialog.Title>
            <Dialog.Description>
              Give your team a clear next step.
            </Dialog.Description>
          </Dialog.Header>
          <NewTask onSave={saveTask} />
        </Dialog.Content>
      </Dialog.Root>
    </WorkspacePage>
  )
}

export function Tasks(): JSX.Element {
  const client = new QueryClient()
  const repository = createTaskRepository()
  onCleanup(() => client.clear())
  return (
    <QueryClientProvider client={client}>
      <TasksWorkspace repository={repository} />
    </QueryClientProvider>
  )
}

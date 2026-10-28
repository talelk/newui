import { Badge, Button, Textarea, TextInput } from '@talelk/newui-atoms'
import { optionsOf } from '@talelk/newui-data'
import { createAppForm, Form, fieldError } from '@talelk/newui-data/form'
import { createCollection, DataProvider } from '@talelk/newui-data/query'
import {
  BottomSheet,
  DatePicker,
  Dialog,
  Select,
} from '@talelk/newui-molecules'
import {
  DataTable,
  type DataTableColumn,
  FilterBar,
  MobileNav,
  MobileNavItem,
  Section,
  StatGrid,
} from '@talelk/newui-organisms'
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  on,
  Show,
  untrack,
} from 'solid-js'
import { ActivityList } from '../examples/ActivityList'
import { AppNavigation } from '../examples/AppNavigation'
import { AppPage } from '../examples/AppPage'
import { Notice } from '../examples/Notice'
import {
  createTaskRepository,
  dueToISO,
  isoToTaskDue,
  TASK_STATUSES,
  type TaskRecord,
  type TaskRepository,
  type TaskStatus,
} from '../examples/tasks-data'

const taskColumns = (
  onOpen: (id: string) => void,
): DataTableColumn<TaskRecord>[] => [
  {
    accessorKey: 'id',
    header: 'Task',
    meta: { mobile: 'subtitle' },
    cell: (context) => (
      <span class="whitespace-nowrap text-caption text-ink-gray-7">
        {context.getValue<string>()}
        <span class="md:hidden"> · {context.row.original.project}</span>
      </span>
    ),
  },
  {
    accessorKey: 'title',
    header: 'Title',
    meta: { mobile: 'title' },
    cell: (context) => (
      <div class="flex min-w-0 items-center gap-2 sm:min-w-72">
        <Badge variant="outline" size="sm" class="hidden md:inline-flex">
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
    meta: { mobile: 'status' },
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
    meta: { mobile: 'meta' },
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
  { accessorKey: 'owner', header: 'Assignee', meta: { mobile: 'meta' } },
  { accessorKey: 'due', header: 'Due date', meta: { mobile: 'meta' } },
]

function NewTask(props: {
  onSave: (value: { title: string; priority: string }) => Promise<void>
  onCancel: () => void
}): JSX.Element {
  const validate = (value: string) =>
    value.trim().length >= 3
      ? undefined
      : 'Enter a title with at least 3 characters.'
  const { form, submitting } = createAppForm({
    defaultValues: { title: '', priority: 'Medium' },
    onSubmit: async (value) =>
      props.onSave({ ...value, title: value.title.trim() }),
  })
  return (
    <Form form={form} class="mt-4 flex flex-col gap-4">
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
            error={fieldError(field())}
            onInput={(event) => field().handleChange(event.currentTarget.value)}
          />
        )}
      </form.Field>
      <form.Field name="priority">
        {(field) => (
          <Select
            label="Priority"
            value={field().state.value}
            options={['High', 'Medium', 'Low'].map((value) => ({
              value,
              label: value,
            }))}
            onValueChange={(value) => field().handleChange(value ?? 'Medium')}
          />
        )}
      </form.Field>
      <div class="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={props.onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="solid"
          theme="blue"
          loading={submitting()}
        >
          Create task
        </Button>
      </div>
    </Form>
  )
}

function TasksWorkspace(props: { repository: TaskRepository }): JSX.Element {
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
  const [taskSort, setTaskSort] = createSignal('Default order')
  const [selected, setSelected] = createSignal<string>()
  const [comment, setComment] = createSignal('')
  const [detailTitle, setDetailTitle] = createSignal('')
  const [detailDue, setDetailDue] = createSignal<string | null>(null)
  const [detailStatus, setDetailStatus] = createSignal<TaskStatus>('Todo')
  const [detailPriority, setDetailPriority] = createSignal('Medium')
  const [detailOwner, setDetailOwner] = createSignal('Rhea Kapoor')
  const [detailProject, setDetailProject] = createSignal('Website')
  const [detailTitleError, setDetailTitleError] = createSignal('')
  const [detailDueError, setDetailDueError] = createSignal('')
  const columns = taskColumns(setSelected)
  // The failure switch is the page's: it wraps the repository's `list` so the
  // "Try again" path exercises the kit's error state, not a special case.
  // The page owns the repository for its lifetime; reading the prop once says
  // so, and keeps the query's `list` from re-subscribing on every render.
  const source = untrack(() => props.repository)
  const repository = {
    ...source,
    list: async () => {
      await new Promise((resolve) => setTimeout(resolve, 120))
      if (failure())
        throw new Error('The local task service is temporarily unavailable.')
      return source.list()
    },
  }
  const tasks = createCollection(() => ({
    key: ['example-tasks'],
    repository,
    staleTime: Infinity,
    retry: false,
  }))
  const query = tasks.query
  const all = () => query.rows()
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
  const taskCount = (count: number) =>
    `${count.toLocaleString('en-US')} ${count === 1 ? 'task' : 'tasks'}`
  function clearFilters() {
    setStatus('all')
    setPriority('all')
    setOwner('all')
    setScope('all')
    setSearch('')
  }
  function retry() {
    setFailure(false)
    void query.refetch()
  }
  const activityDescription = () =>
    query.isPending() || query.isError() || filtered().length === 0
      ? undefined
      : `${taskCount(filtered().length)} · Scroll to explore the complete feed.`

  const current = createMemo(() => all().find((row) => row.id === selected()))
  function update(changes: Parameters<TaskRepository['update']>[1]) {
    const id = selected()
    if (id) tasks.update.mutate({ id, patch: changes })
  }
  function closeDetail() {
    setSelected(undefined)
    setComment('')
    setDetailTitleError('')
    setDetailDueError('')
  }
  createEffect(
    on(selected, (id) => {
      if (!id) return
      const row = all().find((task) => task.id === id)
      if (!row) return
      setDetailTitle(row.title)
      setDetailDue(dueToISO(row.due))
      setDetailStatus(row.status)
      setDetailPriority(row.priority)
      setDetailOwner(row.owner)
      setDetailProject(row.project)
      setDetailTitleError('')
      setDetailDueError('')
      setComment('')
    }),
  )
  function saveDetails(event: SubmitEvent) {
    event.preventDefault()
    const title = detailTitle().trim()
    const due = detailDue()
    let valid = true
    if (title.length < 3) {
      setDetailTitleError('Enter a title with at least 3 characters.')
      valid = false
    } else {
      setDetailTitleError('')
    }
    if (!due) {
      setDetailDueError('Choose a due date.')
      valid = false
    } else {
      setDetailDueError('')
    }
    if (!valid || !due) return
    update({
      title,
      due: isoToTaskDue(due),
      status: detailStatus(),
      priority: detailPriority(),
      owner: detailOwner(),
      project: detailProject(),
    })
    setNotice(`Saved ${selected() ?? 'task'}.`)
    closeDetail()
  }
  const done = () => all().filter((row) => row.status === 'Done').length
  const saveTask = (value: { title: string; priority: string }) =>
    tasks.create.mutateAsync(value).then(() => {
      setOpen(false)
      setNotice(`Task created: ${value.title}.`)
    })
  return (
    <AppPage
      section="Tasks"
      title={
        scope() === 'all'
          ? 'All tasks'
          : scope() === 'mine'
            ? 'My tasks'
            : scope()
      }
      description="Plan the next release, keep work moving, and give every detail a home."
      navigation={() => (
        <AppNavigation
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
      )}
      actions={
        <>
          <Button
            variant="outline"
            iconLeft="lucide-refresh-cw"
            loading={query.isFetching()}
            onClick={retry}
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
          label: 'Task view',
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
        resultCount={
          query.isPending() || query.isError() ? undefined : filtered().length
        }
        onClearAll={clearFilters}
      >
        <div class="md:hidden">
          <Select
            aria-label="Sort task list"
            value={taskSort()}
            options={optionsOf([
              'Default order',
              'Title',
              'Priority',
              'Due date',
            ])}
            onValueChange={(value) => setTaskSort(value ?? 'Default order')}
          />
        </div>
      </FilterBar>
      <StatGrid
        compact
        loading={query.isPending()}
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
      <Notice text={notice()} tone="green" onDismiss={() => setNotice('')} />
      <Show
        when={view() === 'table'}
        fallback={
          <Section title="Activity" description={activityDescription()}>
            <ActivityList
              rows={filtered()}
              loading={query.isPending()}
              error={
                query.isError()
                  ? (query.error()?.message ?? 'Could not load tasks.')
                  : undefined
              }
              onRetry={retry}
              emptyTitle="No tasks match"
              emptyDescription="Try a different search or clear the filters."
              emptyAction={
                <Button onClick={clearFilters}>Reset filters</Button>
              }
            />
          </Section>
        }
      >
        {/* Lift the shared mobile selection bar above the page's fixed nav. */}
        <Section
          label="Task list"
          class="[&_[data-slot=selection-bar]]:max-sm:bottom-20"
        >
          <DataTable
            title="Tasks"
            hideSearch
            cardBreakpoint="lg"
            pageSize={10}
            recordsLabel="tasks"
            rows={filtered()}
            columns={columns}
            actionLabel="Complete selected"
            loading={query.isPending()}
            error={
              query.isError()
                ? (query.error()?.message ?? 'Could not load tasks.')
                : undefined
            }
            onRetry={retry}
            onClearFilters={clearFilters}
            emptyTitle="No tasks match"
            emptyHint="Try a different search or clear the filters."
            selectionSummary={() => `${taskCount(filtered().length)} in view`}
            rowSelectable={(row) =>
              row.status !== 'Done' && row.status !== 'Canceled'
            }
            onRowsAction={(ids) => {
              tasks.updateMany.mutate({ ids, patch: { status: 'Done' } })
              setNotice(
                `${ids.length} ${ids.length === 1 ? 'task' : 'tasks'} marked complete.`,
              )
            }}
          />
        </Section>
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
      {/* Keep the fixed mobile navigation from covering the last content row. */}
      <div class="h-20 sm:hidden" aria-hidden="true" />
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
          if (!value) closeDetail()
        }}
      >
        <Dialog.Content class="flex max-h-[calc(100dvh-2rem)] flex-col p-0 max-sm:fixed max-sm:inset-0 max-sm:max-h-none max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none">
          <Show when={current()}>
            {(row) => (
              <>
                <div class="flex shrink-0 items-center justify-between gap-2 border-b border-outline-gray-1 p-card-pad-compact">
                  <Dialog.Close class="inline-flex min-h-10 items-center rounded-3 px-2 text-interface font-medium text-ink-gray-7 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring">
                    Back to tasks
                  </Dialog.Close>
                  <span class="text-caption tabular-nums text-ink-gray-7">
                    {row().id}
                  </span>
                </div>
                <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-card-pad">
                  <Dialog.Header>
                    <Dialog.Title>{row().title}</Dialog.Title>
                    <Dialog.Description>
                      {row().id} · {row().project}
                    </Dialog.Description>
                  </Dialog.Header>
                  <form
                    id="task-detail-form"
                    class="mt-4 flex flex-col gap-3"
                    noValidate
                    onSubmit={saveDetails}
                  >
                    <TextInput
                      label="Task title"
                      value={detailTitle()}
                      error={detailTitleError()}
                      required
                      onInput={(event) => {
                        setDetailTitle(event.currentTarget.value)
                        if (detailTitleError()) setDetailTitleError('')
                      }}
                    />
                    <DatePicker
                      label="Due date"
                      value={detailDue()}
                      required
                      clearable
                      error={detailDueError()}
                      onValueChange={(value) => {
                        setDetailDue(value)
                        if (detailDueError()) setDetailDueError('')
                      }}
                    />
                    <Select
                      label="Task status"
                      value={detailStatus()}
                      options={TASK_STATUSES.map((value) => ({
                        value,
                        label: value,
                      }))}
                      onValueChange={(value) =>
                        setDetailStatus((value ?? 'Todo') as TaskStatus)
                      }
                    />
                    <Select
                      label="Task priority"
                      value={detailPriority()}
                      options={['High', 'Medium', 'Low'].map((value) => ({
                        value,
                        label: value,
                      }))}
                      onValueChange={(value) =>
                        setDetailPriority(value ?? 'Medium')
                      }
                    />
                    <Select
                      label="Task assignee"
                      value={detailOwner()}
                      options={[
                        'Rhea Kapoor',
                        'Priya Nair',
                        'Sam Rivera',
                        'Ana Costa',
                      ].map((value) => ({ value, label: value }))}
                      onValueChange={(value) =>
                        setDetailOwner(value ?? 'Rhea Kapoor')
                      }
                    />
                    <Select
                      label="Task project"
                      value={detailProject()}
                      options={['Website', 'Mobile app', 'Design system'].map(
                        (value) => ({ value, label: value }),
                      )}
                      onValueChange={(value) =>
                        setDetailProject(value ?? 'Website')
                      }
                    />
                  </form>
                  <section
                    aria-label="Task comments"
                    class="mt-4 flex flex-col gap-3"
                  >
                    <h3 class="text-base-medium">Comments</h3>
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
                        tasks.update.mutate({
                          id: row().id,
                          patch: {
                            comments: [...row().comments, comment().trim()],
                          },
                        })
                        setComment('')
                      }}
                    >
                      Post comment
                    </Button>
                  </section>
                </div>
                <footer class="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-outline-gray-1 p-card-pad">
                  <Button variant="outline" onClick={closeDetail}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    form="task-detail-form"
                    variant="solid"
                    theme="blue"
                  >
                    Save task details
                  </Button>
                </footer>
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
          <NewTask onSave={saveTask} onCancel={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Root>
    </AppPage>
  )
}

export function Tasks(): JSX.Element {
  const repository = createTaskRepository()
  return (
    <DataProvider>
      <TasksWorkspace repository={repository} />
    </DataProvider>
  )
}

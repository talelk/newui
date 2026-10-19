import { FilterBar, StatGrid } from '@newui/blocks'
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  EmptyState,
  Select,
  Textarea,
  TextInput,
} from '@newui/ui'
import { createMemo, createSignal, For, type JSX, Show } from 'solid-js'
import { CreateDialog } from '../examples/CreateDialog'
import { DataTable, type DataTableColumn } from '../examples/DataTable'
import { ExampleFrame } from '../examples/ExampleFrame'
import { Notice } from '../examples/Notice'
import { optionsOf } from '../examples/select'
import {
  AGENTS,
  INITIAL,
  PRIORITIES,
  STATUSES,
  type Status,
  type Ticket,
} from '../examples/tickets-data'
import { WorkspaceNav } from '../examples/WorkspaceNav'

export function Tickets(): JSX.Element {
  /**
   * The reference's sidebar: the support workspace's screens, then its saved
   * views. Selecting one moves the highlight — one screen is implemented.
   */
  const [screen, setScreen] = createSignal('Tickets')
  const [tickets, setTickets] = createSignal(INITIAL)
  const [view, setView] = createSignal('open')
  const [priority, setPriority] = createSignal('All priorities')
  const [agent, setAgent] = createSignal('All agents')
  const [mobileSelection, setMobileSelection] = createSignal<string[]>([])
  const [query, setQuery] = createSignal('')
  const [queue, setQueue] = createSignal('All queues')
  const [active, setActive] = createSignal<string>()
  const [reply, setReply] = createSignal('')
  const [open, setOpen] = createSignal(false)
  const [subject, setSubject] = createSignal('')
  const [customer, setCustomer] = createSignal('')
  const [description, setDescription] = createSignal('')
  const [notice, setNotice] = createSignal('')
  let nextId = 1025
  const current = createMemo(() =>
    tickets().find((ticket) => ticket.id === active()),
  )
  const rows = createMemo(() =>
    tickets().filter(
      (ticket) =>
        (view() === 'all' ||
          (view() === 'closed'
            ? ticket.status === 'Resolved'
            : ticket.status !== 'Resolved')) &&
        (priority() === 'All priorities' || ticket.priority === priority()) &&
        (agent() === 'All agents' || ticket.agent === agent()) &&
        (queue() === 'All queues' ||
          (queue() === 'Unassigned'
            ? ticket.agent === 'Unassigned'
            : queue() === 'Assigned to me'
              ? ticket.agent === 'Rhea Kapoor'
              : ticket.response.startsWith('Breached'))) &&
        `${ticket.id} ${ticket.subject} ${ticket.customer}`
          .toLowerCase()
          .includes(query().toLowerCase()),
    ),
  )
  const update = (id: string, patch: Partial<Ticket>) =>
    setTickets((previous) =>
      previous.map((ticket) =>
        ticket.id === id ? { ...ticket, ...patch } : ticket,
      ),
    )
  const columns: DataTableColumn<Ticket>[] = [
    { accessorKey: 'id', header: 'Ticket' },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: (context) => (
        <button
          type="button"
          class="max-w-72 rounded-3 text-start text-ink-blue-link focus-visible:focus-ring"
          onClick={() => {
            setActive(context.row.original.id)
            setReply('')
          }}
        >
          {context.row.original.subject}
          <span class="mt-1 block text-caption text-ink-gray-7">
            {context.row.original.customer}
          </span>
        </button>
      ),
    },
    {
      accessorKey: 'response',
      header: 'Response / resolution',
      cell: (context) => (
        <div class="whitespace-nowrap text-caption">
          <p
            classList={{
              'text-ink-red-6':
                context.row.original.response.startsWith('Breached'),
            }}
          >
            {context.row.original.response}
          </p>
          <p class="mt-1 text-ink-gray-7">{context.row.original.resolution}</p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (context) => (
        <Badge
          theme={
            context.row.original.status === 'Resolved'
              ? 'green'
              : context.row.original.status === 'Open'
                ? 'red'
                : 'blue'
          }
        >
          {context.row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      sortFn: (a, b) =>
        PRIORITIES.indexOf(a.original.priority) -
        PRIORITIES.indexOf(b.original.priority),
    },
    { accessorKey: 'agent', header: 'Assigned to' },
  ]
  return (
    <ExampleFrame
      sidebar={
        <div class="flex flex-col gap-4">
          <WorkspaceNav
            label="Tickets navigation"
            value={screen()}
            onChange={setScreen}
            items={[
              {
                label: 'Tickets',
                icon: 'lucide-ticket',
                count: tickets().length,
              },
              { label: 'Customers', icon: 'lucide-building-2' },
              { label: 'Contacts', icon: 'lucide-contact' },
              { label: 'Agents', icon: 'lucide-headset' },
              { label: 'Knowledge base', icon: 'lucide-book-open' },
              { label: 'Canned responses', icon: 'lucide-message-square-text' },
            ]}
            group={{
              label: 'Saved views',
              items: [
                { label: 'My open tickets', icon: 'lucide-inbox' },
                { label: 'Urgent', icon: 'lucide-triangle-alert' },
                { label: 'Unassigned', icon: 'lucide-user-round-x' },
                { label: 'Solved this week', icon: 'lucide-circle-check' },
              ],
            }}
          />
        </div>
      }
      title="Support that feels human"
      section="Tickets"
      description="Keep every customer conversation moving, with clear ownership and service targets."
      actions={
        <Button
          variant="solid"
          theme="blue"
          iconLeft="lucide-plus"
          onClick={() => setOpen(true)}
        >
          New ticket
        </Button>
      }
    >
      <div class="hidden sm:block">
        <StatGrid
          stats={[
            {
              label: 'Open tickets',
              value: String(
                tickets().filter((ticket) => ticket.status === 'Open').length,
              ),
              hint: 'Waiting on a first response',
              icon: 'lucide-ticket',
            },
            {
              label: 'Awaiting reply',
              value: String(
                tickets().filter((ticket) => ticket.status === 'Replied')
                  .length,
              ),
              hint: 'The ball is with the customer',
              icon: 'lucide-message-square-text',
            },
            {
              label: 'Unassigned',
              value: String(
                tickets().filter(
                  (ticket) =>
                    ticket.agent === 'Unassigned' &&
                    ticket.status !== 'Resolved',
                ).length,
              ),
              hint: 'Open and without an owner',
              icon: 'lucide-user-round-x',
            },
            {
              label: 'Resolved',
              value: String(
                tickets().filter((ticket) => ticket.status === 'Resolved')
                  .length,
              ),
              hint: `Of ${tickets().length} tickets in total`,
              icon: 'lucide-circle-check',
            },
          ]}
        />
      </div>
      <Notice text={notice()} onDismiss={() => setNotice('')} />
      <FilterBar
        query={{
          placeholder: 'Find tickets…',
          value: query(),
          onInput: setQuery,
        }}
        selects={[
          {
            label: 'Priority',
            value: priority() === 'All priorities' ? '' : priority(),
            onValueChange: (value) => setPriority(value || 'All priorities'),
            options: optionsOf(PRIORITIES),
          },
          {
            label: 'Agent',
            value: agent() === 'All agents' ? '' : agent(),
            onValueChange: (value) => setAgent(value || 'All agents'),
            options: optionsOf(AGENTS),
          },
          {
            label: 'Queue',
            value: queue() === 'All queues' ? '' : queue(),
            onValueChange: (value) => setQueue(value || 'All queues'),
            options: optionsOf([
              'Unassigned',
              'Assigned to me',
              'SLA breached',
            ]),
          },
        ]}
        tabs={{
          value: view(),
          onValueChange: setView,
          options: [
            { label: 'Open tickets', value: 'open' },
            { label: 'All tickets', value: 'all' },
            { label: 'Closed tickets', value: 'closed' },
          ],
        }}
        chips={[
          ...(priority() !== 'All priorities'
            ? [
                {
                  label: `Priority: ${priority()}`,
                  onRemove: () => setPriority('All priorities'),
                },
              ]
            : []),
          ...(agent() !== 'All agents'
            ? [
                {
                  label: `Agent: ${agent()}`,
                  onRemove: () => setAgent('All agents'),
                },
              ]
            : []),
          ...(queue() !== 'All queues'
            ? [
                {
                  label: `Queue: ${queue()}`,
                  onRemove: () => setQueue('All queues'),
                },
              ]
            : []),
          ...(query()
            ? [{ label: `Search: ${query()}`, onRemove: () => setQuery('') }]
            : []),
        ]}
        resultCount={rows().length}
        onClearAll={() => {
          setPriority('All priorities')
          setAgent('All agents')
          setQueue('All queues')
          setQuery('')
        }}
      />
      <section class="flex flex-col gap-3 sm:hidden" aria-label="Ticket cards">
        <Show when={mobileSelection().length}>
          <Button
            onClick={() => {
              const ids = mobileSelection()
              setTickets((previous) =>
                previous.map((ticket) =>
                  ids.includes(ticket.id)
                    ? {
                        ...ticket,
                        status: 'Resolved',
                        resolution: 'Met · just now',
                      }
                    : ticket,
                ),
              )
              setMobileSelection([])
              setNotice(`${ids.length} tickets resolved.`)
            }}
          >
            Resolve selected tickets ({mobileSelection().length})
          </Button>
        </Show>
        <For each={rows()}>
          {(ticket) => (
            <article class="rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3">
              <div class="flex items-start gap-3">
                <Checkbox
                  aria-label={`Select mobile ${ticket.id}`}
                  checked={mobileSelection().includes(ticket.id)}
                  onCheckedChange={(checked) =>
                    setMobileSelection((previous) =>
                      checked
                        ? [...previous, ticket.id]
                        : previous.filter((id) => id !== ticket.id),
                    )
                  }
                />
                <button
                  type="button"
                  class="min-w-0 rounded-3 text-start font-medium text-ink-blue-link focus-visible:focus-ring"
                  onClick={() => {
                    setActive(ticket.id)
                    setReply('')
                  }}
                >
                  {ticket.subject}
                </button>
              </div>
              <p class="mt-3 text-caption">
                {ticket.id} · {ticket.customer}
              </p>
              <p class="mt-2 text-caption text-ink-gray-7">
                {ticket.priority} · {ticket.agent} · {ticket.status}
              </p>
              <p class="mt-2 text-caption">First response: {ticket.response}</p>
            </article>
          )}
        </For>
        <Show when={!rows().length}>
          <EmptyState
            bordered
            icon="lucide-ticket"
            title="No tickets match this queue"
            description="Clear a filter or two and the matching tickets come back."
            action={
              <Button
                onClick={() => {
                  setPriority('All priorities')
                  setAgent('All agents')
                  setQueue('All queues')
                  setQuery('')
                }}
              >
                Clear filters
              </Button>
            }
          />
        </Show>
      </section>
      <div class="hidden sm:block">
        <DataTable
          title="Tickets"
          hideSearch
          rows={rows()}
          columns={columns}
          actionLabel="Resolve tickets"
          onRowsAction={(ids) => {
            setTickets((previous) =>
              previous.map((ticket) =>
                ids.includes(ticket.id)
                  ? {
                      ...ticket,
                      status: 'Resolved',
                      resolution: 'Met · just now',
                    }
                  : ticket,
              ),
            )
            setNotice(`${ids.length} tickets resolved.`)
          }}
        />
      </div>
      <Dialog.Root
        open={!!active()}
        onOpenChange={(value) => {
          if (!value) setActive(undefined)
        }}
      >
        <Dialog.Content>
          <Show when={current()}>
            {(ticket) => (
              <>
                <Dialog.Header>
                  <Dialog.Title>{ticket().subject}</Dialog.Title>
                  <Dialog.Description>
                    {ticket().id} · {ticket().customer}
                  </Dialog.Description>
                </Dialog.Header>
                <div class="my-5 grid gap-3 sm:grid-cols-2">
                  <Select
                    label="Ticket status"
                    value={[ticket().status]}
                    options={STATUSES.map((value) => ({ label: value, value }))}
                    onValueChange={(value) =>
                      update(ticket().id, {
                        status: (value[0] ?? 'Open') as Status,
                      })
                    }
                  />
                  <Select
                    label="Assigned agent"
                    value={[ticket().agent]}
                    options={AGENTS.map((value) => ({ label: value, value }))}
                    onValueChange={(value) =>
                      update(ticket().id, { agent: value[0] ?? 'Unassigned' })
                    }
                  />
                  <Select
                    label="Ticket priority"
                    value={[ticket().priority]}
                    options={PRIORITIES.map((value) => ({
                      label: value,
                      value,
                    }))}
                    onValueChange={(value) =>
                      update(ticket().id, { priority: value[0] ?? 'Medium' })
                    }
                  />
                </div>
                <section
                  aria-label="Ticket conversation"
                  class="max-h-64 space-y-3 overflow-y-auto rounded-3 border border-outline-gray-1 bg-surface-gray-1 p-3"
                  tabindex="0"
                >
                  <For each={ticket().messages}>
                    {(message) => (
                      <p class="whitespace-pre-wrap rounded-3 bg-surface-elevation-1 p-3 text-interface">
                        {message}
                      </p>
                    )}
                  </For>
                </section>
                <form
                  class="mt-4 flex flex-col gap-3"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!reply().trim()) return
                    update(ticket().id, {
                      messages: [
                        ...ticket().messages,
                        `Rhea Kapoor: ${reply().trim()}`,
                      ],
                      status: 'Replied',
                      response: 'Met · just now',
                    })
                    setReply('')
                    setNotice('Reply added to the local ticket.')
                  }}
                >
                  <Textarea
                    label="Ticket reply"
                    rows={3}
                    value={reply()}
                    onInput={(event) => setReply(event.currentTarget.value)}
                    required
                  />
                  <Dialog.Footer>
                    <Button
                      variant="outline"
                      onClick={() => {
                        update(ticket().id, {
                          status: 'Resolved',
                          resolution: 'Met · just now',
                        })
                        setNotice(`${ticket().id} resolved.`)
                        setActive(undefined)
                      }}
                    >
                      Resolve ticket
                    </Button>
                    <Button
                      type="submit"
                      variant="solid"
                      theme="blue"
                      disabled={!reply().trim()}
                    >
                      Send ticket reply
                    </Button>
                  </Dialog.Footer>
                </form>
              </>
            )}
          </Show>
        </Dialog.Content>
      </Dialog.Root>
      <CreateDialog
        open={open()}
        onOpenChange={setOpen}
        title="Create a support ticket"
        description="Describe the issue and add it to the local helpdesk."
        submitLabel="Create ticket"
        onSubmit={() => {
          if (
            subject().trim().length < 3 ||
            !customer().trim() ||
            description().trim().length < 10
          )
            return
          setTickets((previous) => [
            {
              id: `TKT-${nextId++}`,
              subject: subject().trim(),
              customer: customer().trim(),
              status: 'Open',
              priority: 'Medium',
              agent: 'Unassigned',
              response: 'Due in 15m',
              resolution: 'Due in 4h',
              messages: [description().trim()],
            },
            ...previous,
          ])
          setOpen(false)
          setNotice('Ticket created and waiting for an agent.')
          setSubject('')
          setDescription('')
          setCustomer('')
        }}
        fields={(attempted) => (
          <>
            <TextInput
              label="Ticket subject"
              value={subject()}
              onInput={(event) => setSubject(event.currentTarget.value)}
              required
              error={
                attempted() && subject().trim().length < 3
                  ? 'Use at least 3 characters.'
                  : undefined
              }
            />
            <TextInput
              label="Customer"
              value={customer()}
              onInput={(event) => setCustomer(event.currentTarget.value)}
              required
              error={
                attempted() && !customer().trim()
                  ? 'Enter the customer name.'
                  : undefined
              }
            />
            <Textarea
              label="Issue description"
              value={description()}
              onInput={(event) => setDescription(event.currentTarget.value)}
              rows={4}
              required
              error={
                attempted() && description().trim().length < 10
                  ? 'Describe the issue in at least 10 characters.'
                  : undefined
              }
            />
          </>
        )}
      />
    </ExampleFrame>
  )
}

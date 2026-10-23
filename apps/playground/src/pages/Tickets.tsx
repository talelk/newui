import { Badge, Button, Textarea, TextInput } from '@talelk/newui-atoms'
import { optionsOf } from '@talelk/newui-data'
import { Dialog, Select } from '@talelk/newui-molecules'
import {
  DataTable,
  type DataTableColumn,
  FilterBar,
  StatGrid,
} from '@talelk/newui-organisms'
import { createMemo, createSignal, For, type JSX, Show } from 'solid-js'
import { AppNavigation } from '../examples/AppNavigation'
import { AppPage } from '../examples/AppPage'
import { CreateDialog } from '../examples/CreateDialog'
import { Notice } from '../examples/Notice'
import {
  AGENTS,
  INITIAL,
  PRIORITIES,
  STATUSES,
  type Status,
  type Ticket,
} from '../examples/tickets-data'

/** Unassigned is a queue state, not an agent: keep it out of this filter. */
const ASSIGNABLE_AGENTS = AGENTS.filter((agent) => agent !== 'Unassigned')

const STATUS_THEME: Record<Status, 'amber' | 'blue' | 'gray' | 'green'> = {
  Open: 'amber',
  Replied: 'blue',
  Paused: 'gray',
  Resolved: 'green',
}

/** Amber marks attention; red is reserved for an SLA breach. */
const priorityTone = (priority: string) =>
  priority === 'Urgent'
    ? 'font-medium text-ink-amber-8'
    : priority === 'High'
      ? 'text-ink-gray-9'
      : 'text-ink-gray-7'

const agentLabel = (agent: string) => (agent === 'Rhea Kapoor' ? 'You' : agent)

const agentTone = (agent: string) =>
  agent === 'Unassigned'
    ? 'font-medium text-ink-amber-8'
    : agent === 'Rhea Kapoor'
      ? 'font-medium text-ink-gray-9'
      : 'text-ink-gray-8'

const ticketNoun = (count: number) =>
  `${count} ${count === 1 ? 'ticket' : 'tickets'}`

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
  const resetFilters = () => {
    setPriority('All priorities')
    setAgent('All agents')
    setQueue('All queues')
    setQuery('')
  }
  // The empty table's action must always lead somewhere: reset the view too,
  // not only the filters the FilterBar restates as chips.
  const resetAll = () => {
    resetFilters()
    setView('all')
  }
  const resolveTickets = (ids: string[]) => {
    if (!ids.length) return
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
    setNotice(`${ticketNoun(ids.length)} resolved.`)
  }
  const columns: DataTableColumn<Ticket>[] = [
    {
      accessorKey: 'id',
      header: 'Ticket',
      meta: { mobile: 'subtitle' },
      cell: (context) => (
        <span class="whitespace-nowrap text-caption tabular-nums text-ink-gray-7">
          {context.row.original.id}
        </span>
      ),
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      meta: { mobile: 'title' },
      cell: (context) => (
        <button
          type="button"
          class="max-w-72 rounded-3 text-start font-medium text-ink-blue-link focus-visible:focus-ring"
          onClick={() => {
            setActive(context.row.original.id)
            setReply('')
          }}
        >
          {context.row.original.subject}
          <span class="mt-1 block text-caption font-normal text-ink-gray-7">
            {context.row.original.customer}
          </span>
        </button>
      ),
    },
    {
      accessorKey: 'response',
      header: 'First reply / resolution',
      meta: { mobile: 'meta' },
      cell: (context) => {
        const breached = context.row.original.response.startsWith('Breached')
        return (
          <div class="whitespace-nowrap text-caption">
            <p
              classList={{
                'font-medium text-ink-red-7': breached,
                'text-ink-gray-8': !breached,
              }}
            >
              {context.row.original.response}
            </p>
            <p class="mt-1 text-ink-gray-7">
              {context.row.original.resolution}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { mobile: 'status' },
      cell: (context) => (
        <Badge theme={STATUS_THEME[context.row.original.status]}>
          {context.row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      meta: { mobile: 'meta' },
      sortFn: (a, b) =>
        PRIORITIES.indexOf(a.original.priority) -
        PRIORITIES.indexOf(b.original.priority),
      cell: (context) => (
        <span class={priorityTone(context.row.original.priority)}>
          {context.row.original.priority}
        </span>
      ),
    },
    {
      accessorKey: 'agent',
      header: 'Assigned to',
      meta: { mobile: 'meta' },
      cell: (context) => (
        <span class={agentTone(context.row.original.agent)}>
          {agentLabel(context.row.original.agent)}
        </span>
      ),
    },
  ]
  const queueStats = createMemo(() => [
    {
      label: 'Open tickets',
      value: String(
        tickets().filter((ticket) => ticket.status === 'Open').length,
      ),
      hint: 'Waiting on a first response',
    },
    {
      label: 'Awaiting reply',
      value: String(
        tickets().filter((ticket) => ticket.status === 'Replied').length,
      ),
      hint: 'The ball is with the customer',
    },
    {
      label: 'Unassigned',
      value: String(
        tickets().filter(
          (ticket) =>
            ticket.agent === 'Unassigned' && ticket.status !== 'Resolved',
        ).length,
      ),
      hint: 'Open and without an owner',
    },
    {
      label: 'Resolved',
      value: String(
        tickets().filter((ticket) => ticket.status === 'Resolved').length,
      ),
      hint: `Of ${tickets().length} tickets in total`,
    },
  ])
  return (
    <AppPage
      navigation={() => (
        <div class="flex flex-col gap-4">
          <AppNavigation
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
      )}
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
      <section
        class="grid grid-cols-2 gap-3 rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-3 min-[360px]:grid-cols-4 md:hidden"
        aria-label="Queue summary"
      >
        <For each={queueStats()}>
          {(stat) => (
            <div class="flex min-w-0 flex-col">
              <p class="text-caption leading-tight text-ink-gray-7">
                {stat.label}
              </p>
              <p class="mt-auto pt-1 text-metric tabular-nums text-ink-gray-9">
                {stat.value}
              </p>
            </div>
          )}
        </For>
      </section>
      <div class="hidden md:block">
        <StatGrid compact columns={4} stats={queueStats()} />
      </div>
      <Notice tone="green" text={notice()} onDismiss={() => setNotice('')} />
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
            options: optionsOf(ASSIGNABLE_AGENTS),
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
          label: 'Ticket view',
          value: view(),
          onValueChange: setView,
          options: [
            { label: 'Active tickets', value: 'open' },
            { label: 'All tickets', value: 'all' },
            { label: 'Resolved tickets', value: 'closed' },
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
        onClearAll={resetFilters}
      />
      <DataTable
        title="Tickets"
        hideSearch
        rows={rows()}
        columns={columns}
        cardBreakpoint="lg"
        selectable={view() !== 'closed'}
        actionLabel="Resolve tickets"
        recordsLabel="tickets"
        selectionSummary={() => `${rows().length} in this view`}
        emptyTitle="No tickets match this view"
        emptyHint="Clear the search and filters, or switch to All tickets."
        onClearFilters={resetAll}
        rowSelectable={(ticket) => ticket.status !== 'Resolved'}
        onRowsAction={resolveTickets}
      />
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
                    value={ticket().status}
                    options={STATUSES.map((value) => ({ label: value, value }))}
                    onValueChange={(value) =>
                      update(ticket().id, {
                        status: (value ?? 'Open') as Status,
                      })
                    }
                  />
                  <Select
                    label="Assigned agent"
                    value={ticket().agent}
                    options={AGENTS.map((value) => ({ label: value, value }))}
                    onValueChange={(value) =>
                      update(ticket().id, { agent: value ?? 'Unassigned' })
                    }
                  />
                  <Select
                    label="Ticket priority"
                    value={ticket().priority}
                    options={PRIORITIES.map((value) => ({
                      label: value,
                      value,
                    }))}
                    onValueChange={(value) =>
                      update(ticket().id, { priority: value ?? 'Medium' })
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
                    setNotice('Reply sent.')
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
        description="Describe the issue and add it to the support queue."
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
    </AppPage>
  )
}

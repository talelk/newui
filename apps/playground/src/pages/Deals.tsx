import { Avatar, Badge, Button, TextInput } from '@talelk/newui-atoms'
import { createUndo, usd as money, optionsOf } from '@talelk/newui-data'
import { DatePicker, Select } from '@talelk/newui-molecules'
import {
  DataState,
  DataTable,
  type DataTableColumn,
  FilterBar,
  KanbanBoard,
  type KanbanColumn,
  type KanbanMove,
  type KanbanTone,
  StatGrid,
} from '@talelk/newui-organisms'
import { createMemo, createSignal, type JSX, Show } from 'solid-js'
import { AppNavigation } from '../examples/AppNavigation'
import { AppPage } from '../examples/AppPage'
import { CreateDialog } from '../examples/CreateDialog'
import {
  type Deal,
  defaultCloseDate,
  initialDeals,
  isoDay,
  OWNERS,
  placeDeal,
  STAGES,
  type Stage,
} from '../examples/deals-data'
import { Notice } from '../examples/Notice'

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}
const dateFormat = new Intl.DateTimeFormat('en-US', DATE_FORMAT)
const shortDateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})
const todayIso = isoDay(0)

function formatDate(value: string, compact = false): string {
  if (!value) return ''
  const format = compact ? shortDateFormat : dateFormat
  return format.format(new Date(`${value}T12:00:00`))
}

/** The date a deal shows: the close date once won, the expected date before. */
function dealDate(deal: Deal): string {
  return deal.stage === 'Won' ? (deal.closed ?? deal.due) : deal.due
}

function isOverdue(deal: Deal): boolean {
  return deal.stage !== 'Won' && deal.due < todayIso
}

/**
 * The one date treatment for the board, the list and the dialog.
 *
 * The label carries the state so colour is never the only signal; the `time`
 * keeps the machine-readable date even when the visible one is friendly.
 */
function DealDate(props: { deal: Deal; compact?: boolean }): JSX.Element {
  return (
    <span class="inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
      <Show when={isOverdue(props.deal)}>
        <span class="text-ink-red-7">Overdue</span>
      </Show>
      <Show when={props.deal.stage === 'Won'}>
        <span class="text-ink-green-8">Closed</span>
      </Show>
      <time
        dateTime={dealDate(props.deal)}
        title={formatDate(dealDate(props.deal))}
        class="tabular-nums"
      >
        {formatDate(dealDate(props.deal), props.compact)}
      </time>
    </span>
  )
}

export function Deals(): JSX.Element {
  const [deals, setDeals] = createSignal(initialDeals)
  const [view, setView] = createSignal('board')
  /**
   * The reference's sidebar, in its order: the workspace's other screens, then
   * the pinned views. Selecting one moves the highlight, exactly as the reference
   * does — it is a one-screen demo, so the board below does not change.
   */
  const [nav, setNav] = createSignal('Deals')
  const [query, setQuery] = createSignal('')
  const [owner, setOwner] = createSignal('All owners')
  const [sort, setSort] = createSignal('Board order')
  const [open, setOpen] = createSignal(false)
  const [organization, setOrganization] = createSignal('')
  const [amount, setAmount] = createSignal('')
  const [newOwner, setNewOwner] = createSignal(OWNERS[0] ?? '')
  const [stage, setStage] = createSignal<Stage>('Qualification')
  const [due, setDue] = createSignal(defaultCloseDate())
  const [notice, setNotice] = createSignal('')
  const [noticeUndoable, setNoticeUndoable] = createSignal(false)
  const dealUndo = createUndo<Deal[]>()
  let nextId = initialDeals.length + 1

  const filtered = createMemo(() => {
    const term = query().trim().toLowerCase()
    return deals().filter(
      (deal) =>
        (owner() === 'All owners' || deal.owner === owner()) &&
        `${deal.organization} ${deal.source} ${deal.owner}`
          .toLowerCase()
          .includes(term),
    )
  })

  /**
   * The board's own order. The list deliberately does not use it: once the
   * FilterBar control is gone, TanStack's column headers are the only sort
   * model in that view, so a hidden prior choice cannot contradict them.
   */
  const boardRows = createMemo(() => {
    const order = sort()
    if (order === 'Board order') return filtered()
    const rows = [...filtered()]
    return rows.sort((a, b) =>
      order === 'Highest value'
        ? b.amount - a.amount
        : dealDate(a).localeCompare(dealDate(b)),
    )
  })

  const metrics = createMemo(() => {
    const rows = filtered()
    const openRows = rows.filter((deal) => deal.stage !== 'Won')
    const readyRows = rows.filter((deal) => deal.stage === 'Ready to close')
    return {
      pipeline: openRows.reduce((sum, deal) => sum + deal.amount, 0),
      open: openRows.length,
      readyValue: readyRows.reduce((sum, deal) => sum + deal.amount, 0),
      readyCount: readyRows.length,
      won: rows
        .filter((deal) => deal.stage === 'Won')
        .reduce((sum, deal) => sum + deal.amount, 0),
    }
  })

  const hasActiveFilters = () =>
    owner() !== 'All owners' || query().trim().length > 0
  const clearFilters = () => {
    setOwner('All owners')
    setQuery('')
  }
  const announceMove = (text: string) => {
    setNotice(text)
    setNoticeUndoable(true)
  }
  const move = (id: string, target: Stage, before?: string) => {
    const deal = deals().find((item) => item.id === id)
    if (!deal) return
    const placed = placeDeal(deals(), id, target, before)
    if (placed === deals()) return
    const next = placed.map((item) =>
      item.id === id
        ? {
            ...item,
            stage: target,
            closed: target === 'Won' ? (item.closed ?? isoDay(0)) : undefined,
          }
        : item,
    )
    dealUndo.capture(deals())
    setDeals(next)
    setSort('Board order')
    announceMove(`${deal.organization} moved to ${target}.`)
  }

  /** One tone per stage, so a column's dot says the same thing on every screen. */
  const STAGE_TONES: Record<Stage, KanbanTone> = {
    Qualification: 'gray',
    Negotiation: 'amber',
    'Ready to close': 'blue',
    Won: 'green',
  }

  const boardColumns = createMemo<KanbanColumn<Deal>[]>(() =>
    STAGES.map((stage) => {
      const items = boardRows().filter((deal) => deal.stage === stage)
      return {
        id: stage,
        name: stage,
        theme: STAGE_TONES[stage],
        items,
        summary: money(items.reduce((sum, deal) => sum + deal.amount, 0)),
        action: {
          label: `Add a deal to ${stage}`,
          onClick: () => {
            setStage(stage)
            setOpen(true)
          },
        },
      }
    }),
  )

  /**
   * The board reports one accepted move and hands back the columns it built.
   * Flattening those is the whole adapter: the page still owns the data, the
   * undo snapshot is still the previous array, and the list reads the same
   * records — its order belongs to the column headers.
   */
  const applyMove = (change: KanbanMove<Deal>) => {
    dealUndo.capture(deals())
    // The columns give the new *order*; the stage is the record's own field, so
    // it is set here rather than inferred. A deal that kept `stage:
    // 'Qualification'` would be filtered straight back into the column it left.
    setDeals(
      change.columns.flatMap((column) =>
        column.items.map((deal) =>
          deal.id === change.itemId
            ? {
                ...deal,
                stage: column.id as Stage,
                closed:
                  column.id === 'Won' ? (deal.closed ?? isoDay(0)) : undefined,
              }
            : deal,
        ),
      ),
    )
    setSort('Board order')
    announceMove(`${change.item.organization} moved to ${change.to.column}.`)
  }

  const columns: DataTableColumn<Deal>[] = [
    {
      accessorKey: 'organization',
      header: 'Organization',
      meta: { mobile: 'title' },
    },
    {
      accessorKey: 'amount',
      header: 'Value',
      meta: { align: 'end', mobile: 'amount' },
      cell: (context) => money(context.row.original.amount),
    },
    {
      accessorKey: 'owner',
      header: 'Owner',
      meta: { mobile: 'meta' },
    },
    {
      accessorKey: 'stage',
      header: 'Stage',
      meta: { mobile: 'status' },
      cell: (context) => (
        <Select
          aria-label={`Stage for ${context.row.original.organization}`}
          value={context.row.original.stage}
          options={optionsOf(STAGES)}
          onValueChange={(value) =>
            move(context.row.original.id, (value ?? 'Qualification') as Stage)
          }
        />
      ),
    },
    {
      accessorKey: 'due',
      header: 'Close date',
      meta: { align: 'end', mobile: 'meta' },
      cell: (context) => <DealDate deal={context.row.original} />,
    },
  ]

  const stats = () => [
    {
      label: 'Pipeline value',
      value: money(metrics().pipeline),
      hint: 'Excluding won deals',
      icon: 'lucide-handshake',
    },
    {
      label: 'Open opportunities',
      value: String(metrics().open),
      hint: 'Still in play across the board',
      icon: 'lucide-list-todo',
    },
    {
      label: 'Ready to close',
      value: money(metrics().readyValue),
      hint: `${metrics().readyCount} deals at the final stage`,
      icon: 'lucide-flag',
    },
    {
      label: 'Closed won',
      value: money(metrics().won),
      hint: 'Won and booked',
      icon: 'lucide-circle-check',
    },
  ]

  return (
    <AppPage
      title="Build a healthier pipeline"
      section="Deals"
      description="Every opportunity, a clear next step. Move from first conversation to a confident close."
      actions={
        <Button
          variant="solid"
          theme="blue"
          iconLeft="lucide-plus"
          onClick={() => setOpen(true)}
        >
          New deal
        </Button>
      }
      navigation={() => (
        <AppNavigation
          label="Deals navigation"
          value={nav()}
          onChange={setNav}
          items={[
            { label: 'Notifications', icon: 'lucide-inbox', count: 4 },
            { label: 'Leads', icon: 'lucide-users' },
            { label: 'Deals', icon: 'lucide-handshake' },
            { label: 'Contacts', icon: 'lucide-contact' },
            { label: 'Organizations', icon: 'lucide-building-2' },
            { label: 'Notes', icon: 'lucide-notebook-pen' },
            { label: 'Tasks', icon: 'lucide-list-todo' },
          ]}
          group={{
            label: 'Pinned views',
            items: [
              { label: 'My open deals', icon: 'lucide-star' },
              { label: 'Closing this month', icon: 'lucide-star' },
            ],
          }}
        />
      )}
    >
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-card border border-outline-gray-1 bg-surface-elevation-1 px-card-pad-compact py-2 lg:hidden">
        <span class="text-caption text-ink-gray-7">Pipeline</span>
        <span class="text-base-medium tabular-nums text-ink-gray-9">
          {money(metrics().pipeline)}
        </span>
        <span class="text-caption text-ink-gray-7">{metrics().open} open</span>
        <span class="ms-auto text-caption text-ink-gray-7">
          Ready {money(metrics().readyValue)}
        </span>
      </div>
      <div class="hidden lg:block">
        <StatGrid compact stats={stats()} />
      </div>
      <FilterBar
        query={{
          placeholder: 'Search deals',
          value: query(),
          onInput: setQuery,
        }}
        selects={[
          {
            label: 'Owner',
            value: owner() === 'All owners' ? '' : owner(),
            onValueChange: (value) => setOwner(value || 'All owners'),
            options: [{ label: 'All owners', value: '' }, ...optionsOf(OWNERS)],
          },
        ]}
        tabs={{
          label: 'Deal view',
          value: view(),
          onValueChange: setView,
          options: [
            { label: 'Board', value: 'board' },
            { label: 'List', value: 'list' },
          ],
        }}
        chips={[
          ...(owner() !== 'All owners'
            ? [
                {
                  label: `Owner: ${owner()}`,
                  onRemove: () => setOwner('All owners'),
                },
              ]
            : []),
          ...(query()
            ? [{ label: `Search: ${query()}`, onRemove: () => setQuery('') }]
            : []),
        ]}
        resultCount={filtered().length}
        onClearAll={clearFilters}
      >
        <Show when={view() === 'board'}>
          <span class="hidden text-caption text-ink-gray-7 md:inline">
            Drag a card, or use its menu.
          </span>
          <Select
            aria-label="Sort deals"
            variant="subtle"
            class="w-40 max-w-full"
            value={sort()}
            options={optionsOf(['Board order', 'Due date', 'Highest value'])}
            onValueChange={(value) => setSort(value ?? 'Due date')}
          />
        </Show>
      </FilterBar>
      <Notice
        text={notice()}
        onUndo={
          noticeUndoable() && dealUndo.snapshot()
            ? () => {
                dealUndo.undo(setDeals)
                setNotice('Deal move undone.')
                setNoticeUndoable(false)
              }
            : undefined
        }
        undoLabel="Undo deal move"
      />
      <Show
        when={view() === 'board'}
        fallback={
          <DataTable
            title="Deals"
            hideSearch
            rows={filtered()}
            columns={columns}
            cardBreakpoint="lg"
            selectable={false}
            onClearFilters={clearFilters}
            recordsLabel="deals"
            emptyTitle="No deals match these filters"
            emptyHint="Try another owner or search term."
          />
        }
      >
        <Show
          when={filtered().length > 0}
          fallback={
            <div class="rounded-card border border-outline-gray-1 bg-surface-elevation-1">
              <DataState
                status="empty"
                title={
                  hasActiveFilters()
                    ? 'No deals match these filters'
                    : 'No deals in this pipeline'
                }
                description={
                  hasActiveFilters()
                    ? 'Try a different owner or search term.'
                    : 'Create an opportunity to start the pipeline.'
                }
                action={
                  hasActiveFilters() ? (
                    <Button onClick={clearFilters}>Clear filters</Button>
                  ) : (
                    <Button
                      variant="solid"
                      theme="blue"
                      iconLeft="lucide-plus"
                      onClick={() => setOpen(true)}
                    >
                      New deal
                    </Button>
                  )
                }
              />
            </div>
          }
        >
          <div class="flex min-h-0 flex-col md:h-[max(26rem,calc(100dvh-28rem))] lg:h-[max(26rem,calc(100dvh-30rem))] xl:h-[max(26rem,calc(100dvh-23rem))]">
            <KanbanBoard
              columns={boardColumns()}
              label="Deal pipeline board"
              itemLabel={(deal) => deal.organization}
              onMove={applyMove}
              emptyColumn={() => <span>No opportunities in this stage.</span>}
              class="h-full min-h-0 rounded-card border border-outline-gray-1 bg-surface-elevation-1"
            >
              {(deal) => (
                <>
                  <div class="flex items-center gap-2">
                    <Avatar
                      label={deal.organization}
                      shape="square"
                      size="sm"
                    />
                    <span class="min-w-0 flex-1 truncate text-base-medium text-ink-gray-9">
                      {deal.organization}
                    </span>
                  </div>
                  <div class="mt-2 flex items-center justify-between gap-2">
                    <span class="text-base-semibold tabular-nums text-ink-gray-8">
                      {money(deal.amount)}
                    </span>
                    <Badge variant="outline">{deal.source}</Badge>
                  </div>
                  <div class="mt-3 flex items-center justify-between gap-2 text-sm text-ink-gray-7">
                    <span class="min-w-0 flex-1 truncate">{deal.owner}</span>
                    <DealDate deal={deal} compact />
                  </div>
                </>
              )}
            </KanbanBoard>
          </div>
        </Show>
      </Show>
      <CreateDialog
        open={open()}
        onOpenChange={setOpen}
        title="New opportunity"
        description="Add a deal to your local pipeline."
        submitLabel="Create deal"
        onSubmit={() => {
          if (
            organization().trim().length < 2 ||
            !Number.isFinite(Number(amount())) ||
            Number(amount()) <= 0 ||
            !due() ||
            due() < todayIso
          )
            return
          dealUndo.clear()
          setNoticeUndoable(false)
          setDeals((previous) => [
            ...previous,
            {
              id: `DEAL-${nextId++}`,
              organization: organization().trim(),
              amount: Number(amount()),
              owner: newOwner(),
              stage: stage(),
              source: 'Inbound',
              due: due(),
              ...(stage() === 'Won' ? { closed: isoDay(0) } : {}),
            },
          ])
          setOpen(false)
          setNotice(`${organization()} added to the pipeline.`)
          setOrganization('')
          setAmount('')
          setDue(defaultCloseDate())
        }}
        fields={(attempted) => (
          <>
            <TextInput
              label="Organization"
              value={organization()}
              onInput={(event) => setOrganization(event.currentTarget.value)}
              required
              error={
                attempted() && organization().trim().length < 2
                  ? 'Enter an organization name.'
                  : undefined
              }
            />
            <TextInput
              label="Deal value"
              type="number"
              value={amount()}
              onInput={(event) => setAmount(event.currentTarget.value)}
              required
              error={
                attempted() &&
                (!Number.isFinite(Number(amount())) || Number(amount()) <= 0)
                  ? 'Enter a value greater than zero.'
                  : undefined
              }
            />
            <Select
              label="Opportunity owner"
              value={newOwner()}
              options={optionsOf(OWNERS)}
              onValueChange={(value) => setNewOwner(value ?? OWNERS[0] ?? '')}
            />
            <Select
              label="Initial stage"
              value={stage()}
              options={optionsOf(STAGES)}
              onValueChange={(value) =>
                setStage((value ?? 'Qualification') as Stage)
              }
            />
            <DatePicker
              label="Expected close date"
              value={due()}
              onValueChange={setDue}
              locale="en-US"
              format={DATE_FORMAT}
              min={todayIso}
              required
              error={
                attempted() && (!due() || due() < todayIso)
                  ? 'Choose today or a future date.'
                  : undefined
              }
            />
          </>
        )}
      />
    </AppPage>
  )
}

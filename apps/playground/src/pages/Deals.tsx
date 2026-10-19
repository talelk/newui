import {
  FilterBar,
  KanbanBoard,
  type KanbanColumn,
  type KanbanMove,
  type KanbanTone,
  StatGrid,
} from '@newui/blocks'
import { createUndo, first, usd as money, optionsOf } from '@newui/data'
import { Avatar, Badge, Button, DatePicker, Select, TextInput } from '@newui/ui'
import { createMemo, createSignal, type JSX, Show } from 'solid-js'
import { CreateDialog } from '../examples/CreateDialog'
import { DataTable, type DataTableColumn } from '../examples/DataTable'
import {
  type Deal,
  initialDeals,
  OWNERS,
  placeDeal,
  STAGES,
  type Stage,
} from '../examples/deals-data'
import { Notice } from '../examples/Notice'
import { WorkspaceNav } from '../examples/WorkspaceNav'
import { WorkspacePage } from '../examples/WorkspacePage'

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
  const [due, setDue] = createSignal('2026-10-15')
  const [notice, setNotice] = createSignal('')
  const dealUndo = createUndo<Deal[]>()
  let nextId = initialDeals.length + 1
  const rows = createMemo(() => {
    const order = sort()
    return deals()
      .filter(
        (deal) =>
          (owner() === 'All owners' || deal.owner === owner()) &&
          `${deal.organization} ${deal.source} ${deal.owner}`
            .toLowerCase()
            .includes(query().toLowerCase()),
      )
      .sort((a, b) =>
        order === 'Board order'
          ? 0
          : order === 'Highest value'
            ? b.amount - a.amount
            : a.due.localeCompare(b.due),
      )
  })
  const move = (id: string, target: Stage, before?: string) => {
    const deal = deals().find((item) => item.id === id)
    if (!deal) return
    const next = placeDeal(deals(), id, target, before)
    if (next === deals()) return
    dealUndo.capture(deals())
    setDeals(next)
    setSort('Board order')
    setNotice(`${deal.organization} moved to ${target.toLowerCase()}.`)
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
      const items = rows().filter((deal) => deal.stage === stage)
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
   * undo snapshot is still the previous array, and the list view reads the same
   * records in the same order.
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
            ? { ...deal, stage: column.id as Stage }
            : deal,
        ),
      ),
    )
    setSort('Board order')
    setNotice(
      `${change.item.organization} moved to ${change.to.column.toLowerCase()}.`,
    )
  }

  const columns: DataTableColumn<Deal>[] = [
    { accessorKey: 'organization', header: 'Organization' },
    {
      accessorKey: 'amount',
      header: 'Value',
      cell: (context) => money(context.row.original.amount),
    },
    { accessorKey: 'owner', header: 'Owner' },
    {
      accessorKey: 'stage',
      header: 'Stage',
      cell: (context) => (
        <Select
          aria-label={`Stage for ${context.row.original.organization}`}
          value={[context.row.original.stage]}
          options={optionsOf(STAGES)}
          onValueChange={(value) =>
            move(
              context.row.original.id,
              first(value, 'Qualification') as Stage,
            )
          }
        />
      ),
    },
    { accessorKey: 'due', header: 'Close date' },
  ]
  return (
    <WorkspacePage
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
      sidebar={
        <WorkspaceNav
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
      }
    >
      <div class="hidden sm:block">
        <StatGrid
          stats={[
            {
              label: 'Pipeline value',
              value: money(
                rows()
                  .filter((deal) => deal.stage !== 'Won')
                  .reduce((sum, deal) => sum + deal.amount, 0),
              ),
              hint: 'Excluding won deals',
              icon: 'lucide-handshake',
            },
            {
              label: 'Open opportunities',
              value: String(
                rows().filter((deal) => deal.stage !== 'Won').length,
              ),
              hint: 'Still in play across the board',
              icon: 'lucide-list-todo',
            },
            {
              label: 'Ready to close',
              value: money(
                rows()
                  .filter((deal) => deal.stage === 'Ready to close')
                  .reduce((sum, deal) => sum + deal.amount, 0),
              ),
              hint: `${rows().filter((deal) => deal.stage === 'Ready to close').length} deals at the final stage`,
              icon: 'lucide-flag',
            },
            {
              label: 'Closed won',
              value: money(
                rows()
                  .filter((deal) => deal.stage === 'Won')
                  .reduce((sum, deal) => sum + deal.amount, 0),
              ),
              hint: 'Booked and off the board',
              icon: 'lucide-circle-check',
            },
          ]}
        />
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
            options: optionsOf(OWNERS),
          },
        ]}
        tabs={{
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
        resultCount={rows().length}
        onClearAll={() => {
          setOwner('All owners')
          setQuery('')
        }}
      >
        <Select
          aria-label="Sort deals"
          variant="subtle"
          class="w-40 max-w-full"
          value={[sort()]}
          options={optionsOf(['Board order', 'Due date', 'Highest value'])}
          onValueChange={(value) => setSort(first(value, 'Due date'))}
        />
      </FilterBar>
      <Notice
        text={notice()}
        onUndo={
          dealUndo.snapshot()
            ? () => {
                dealUndo.undo(setDeals)
                setNotice('Deal move undone.')
              }
            : undefined
        }
        undoLabel="Undo deal move"
      />
      <Show
        when={view() === 'board'}
        fallback={
          <DataTable title="Deals" hideSearch rows={rows()} columns={columns} />
        }
      >
        <KanbanBoard
          columns={boardColumns()}
          label="Deal pipeline board"
          itemLabel={(deal) => deal.organization}
          onMove={applyMove}
          emptyColumn={() => <span>No opportunities in this stage.</span>}
          class="rounded-5 border border-outline-gray-1 bg-surface-elevation-1"
        >
          {(deal) => (
            <>
              <div class="flex items-center gap-2">
                <Avatar label={deal.organization} shape="square" size="sm" />
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
                <span class="truncate">{deal.owner}</span>
                <time dateTime={deal.due} class="shrink-0 tabular-nums">
                  {deal.due.slice(5)}
                </time>
              </div>
            </>
          )}
        </KanbanBoard>
        <p class="text-caption text-ink-gray-7">
          Drag a card between columns, or use its menu — every card moves
          without a mouse, and changes stay in this page.
        </p>
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
            !due()
          )
            return
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
            },
          ])
          setOpen(false)
          setNotice(`${organization()} added to the pipeline.`)
          setOrganization('')
          setAmount('')
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
              value={[newOwner()]}
              options={optionsOf(OWNERS)}
              onValueChange={(value) =>
                setNewOwner(first(value, OWNERS[0] ?? ''))
              }
            />
            <Select
              label="Initial stage"
              value={[stage()]}
              options={optionsOf(STAGES)}
              onValueChange={(value) =>
                setStage(first(value, 'Qualification') as Stage)
              }
            />
            <DatePicker
              label="Expected close date"
              value={due()}
              onValueChange={setDue}
              required
              error={attempted() && !due() ? 'Choose a close date.' : undefined}
            />
          </>
        )}
      />
    </WorkspacePage>
  )
}

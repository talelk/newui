import { StatGrid } from '@newui/blocks'
import {
  Avatar,
  Badge,
  Button,
  DatePicker,
  Dialog,
  Select,
  TabButtons,
  TextInput,
} from '@newui/ui'
import {
  createMemo,
  createSignal,
  For,
  type JSX,
  onCleanup,
  Show,
} from 'solid-js'
import { DataTable, type DataTableColumn } from '../examples/DataTable'
import {
  type Deal,
  initialDeals,
  money,
  OWNERS,
  placeDeal,
  STAGES,
  type Stage,
} from '../examples/deals-data'
import { ExampleFrame } from '../examples/ExampleFrame'

export function Deals(): JSX.Element {
  const [deals, setDeals] = createSignal(initialDeals)
  const [view, setView] = createSignal('board')
  const [query, setQuery] = createSignal('')
  const [owner, setOwner] = createSignal('All owners')
  const [sort, setSort] = createSignal('Board order')
  const [open, setOpen] = createSignal(false)
  const [organization, setOrganization] = createSignal('')
  const [amount, setAmount] = createSignal('')
  const [newOwner, setNewOwner] = createSignal(OWNERS[0] ?? '')
  const [stage, setStage] = createSignal<Stage>('Qualification')
  const [due, setDue] = createSignal('2026-10-15')
  const [attempted, setAttempted] = createSignal(false)
  const [notice, setNotice] = createSignal('')
  const [snapshot, setSnapshot] = createSignal<Deal[]>()
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
    setSnapshot(deals())
    setDeals(next)
    setSort('Board order')
    setNotice(`${deal.organization} moved to ${target.toLowerCase()}.`)
  }
  let board: HTMLElement | undefined
  let gesture:
    | {
        id: string
        pointer: number
        x: number
        y: number
        moved: boolean
        stage?: Stage
        before?: string
      }
    | undefined
  let edgeFrame = 0
  const [dragging, setDragging] = createSignal<string>()
  function cancelDrag() {
    gesture = undefined
    setDragging(undefined)
    cancelAnimationFrame(edgeFrame)
  }
  function autoScroll() {
    if (!gesture || !board) return
    const bounds = board.getBoundingClientRect()
    const step =
      gesture.x < bounds.left + 48
        ? -16
        : gesture.x > bounds.right - 48
          ? 16
          : 0
    if (step) board.scrollBy({ left: step, behavior: 'instant' })
    edgeFrame = requestAnimationFrame(autoScroll)
  }
  function drag(event: PointerEvent) {
    if (!gesture || gesture.pointer !== event.pointerId) return
    gesture.moved ||=
      Math.hypot(gesture.x - event.clientX, gesture.y - event.clientY) > 6
    gesture.x = event.clientX
    gesture.y = event.clientY
    if (!gesture.moved) return
    setDragging(gesture.id)
    const target = document.elementFromPoint(event.clientX, event.clientY)
    const stage = target?.closest<HTMLElement>('[data-stage]')?.dataset[
      'stage'
    ] as Stage | undefined
    const card = target?.closest<HTMLElement>('[data-deal]')
    gesture.stage = stage
    gesture.before = card?.dataset['deal']
    if (
      card &&
      event.clientY > card.getBoundingClientRect().top + card.clientHeight / 2
    )
      gesture.before = (card.nextElementSibling as HTMLElement | null)?.dataset[
        'deal'
      ]
  }
  onCleanup(cancelDrag)
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
          options={STAGES.map((value) => ({ label: value, value }))}
          onValueChange={(value) =>
            move(
              context.row.original.id,
              (value[0] ?? 'Qualification') as Stage,
            )
          }
        />
      ),
    },
    { accessorKey: 'due', header: 'Close date' },
  ]
  return (
    <ExampleFrame
      title="Build a healthier pipeline"
      section="Deals"
      description="Every opportunity, a clear next step. Move from first conversation to a confident close."
      actions={
        <Button
          variant="solid"
          theme="blue"
          iconLeft="lucide-plus"
          onClick={() => {
            setAttempted(false)
            setOpen(true)
          }}
        >
          New deal
        </Button>
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
            },
            {
              label: 'Open opportunities',
              value: String(
                rows().filter((deal) => deal.stage !== 'Won').length,
              ),
            },
            {
              label: 'Ready to close',
              value: money(
                rows()
                  .filter((deal) => deal.stage === 'Ready to close')
                  .reduce((sum, deal) => sum + deal.amount, 0),
              ),
            },
            {
              label: 'Closed won',
              value: money(
                rows()
                  .filter((deal) => deal.stage === 'Won')
                  .reduce((sum, deal) => sum + deal.amount, 0),
              ),
            },
          ]}
        />
      </div>
      <div class="flex flex-wrap items-end justify-between gap-3 rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3">
        <div class="flex flex-wrap items-end gap-3">
          <TextInput
            label="Search deals"
            placeholder="Organization or source…"
            value={query()}
            onInput={(event) => setQuery(event.currentTarget.value)}
          />
          <Select
            label="Deal owner"
            value={[owner()]}
            options={['All owners', ...OWNERS].map((value) => ({
              label: value,
              value,
            }))}
            onValueChange={(value) => setOwner(value[0] ?? 'All owners')}
          />
          <Select
            label="Sort deals"
            value={[sort()]}
            options={['Board order', 'Due date', 'Highest value'].map(
              (value) => ({
                label: value,
                value,
              }),
            )}
            onValueChange={(value) => setSort(value[0] ?? 'Due date')}
          />
        </div>
        <TabButtons
          value={view()}
          onValueChange={setView}
          options={[
            { label: 'Board', value: 'board' },
            { label: 'List', value: 'list' },
          ]}
        />
      </div>
      <Show when={notice()}>
        <div
          role="status"
          class="flex flex-wrap items-center justify-between gap-3 rounded-3 border border-outline-blue-1 bg-surface-blue-1 p-3 text-ink-blue-8"
        >
          <span>{notice()}</span>
          <Show when={snapshot()}>
            <Button
              size="sm"
              onClick={() => {
                const previous = snapshot()
                if (previous) setDeals(previous)
                setSnapshot(undefined)
                setNotice('Deal move undone.')
              }}
            >
              Undo deal move
            </Button>
          </Show>
        </div>
      </Show>
      <Show
        when={view() === 'board'}
        fallback={<DataTable title="Deals" rows={rows()} columns={columns} />}
      >
        <section
          ref={board}
          aria-label="Deal pipeline board"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              cancelDrag()
              event.preventDefault()
            }
          }}
          tabindex="0"
          class="min-w-0 overflow-x-auto snap-x snap-mandatory rounded-3 focus-visible:focus-ring"
        >
          <div class="grid min-w-[1120px] grid-cols-4 gap-4 pb-4">
            <For each={STAGES}>
              {(column) => (
                <section
                  aria-label={`${column} deals`}
                  data-stage={column}
                  class="min-w-0 snap-start rounded-5 border border-outline-gray-1 bg-surface-gray-2 p-3"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    move(
                      event.dataTransfer?.getData('text/plain') ?? '',
                      column,
                    )
                  }}
                >
                  <div class="mb-3 flex items-center justify-between">
                    <h2 class="font-medium">{column}</h2>
                    <Badge>
                      {rows().filter((deal) => deal.stage === column).length}
                    </Badge>
                  </div>
                  <p class="mb-4 text-caption tabular-nums text-ink-gray-6">
                    {money(
                      rows()
                        .filter((deal) => deal.stage === column)
                        .reduce((sum, deal) => sum + deal.amount, 0),
                    )}
                  </p>
                  <ul class="flex flex-col gap-3">
                    <For
                      each={rows().filter((deal) => deal.stage === column)}
                      fallback={
                        <li class="rounded-3 border border-dashed border-outline-gray-3 p-6 text-center text-caption text-ink-gray-6">
                          No opportunities in this stage.
                        </li>
                      }
                    >
                      {(deal) => (
                        <li
                          draggable
                          onDragStart={(event) =>
                            event.dataTransfer?.setData('text/plain', deal.id)
                          }
                          class="rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3"
                          data-deal={deal.id}
                          data-dragging={
                            dragging() === deal.id ? '' : undefined
                          }
                        >
                          <button
                            type="button"
                            aria-label={`Drag ${deal.organization}`}
                            class="mb-2 touch-none rounded-3 px-2 py-1 text-caption text-ink-gray-6 focus-visible:focus-ring"
                            onPointerDown={(event) => {
                              if (event.button !== 0) return
                              event.preventDefault()
                              gesture = {
                                id: deal.id,
                                pointer: event.pointerId,
                                x: event.clientX,
                                y: event.clientY,
                                moved: false,
                              }
                              event.currentTarget.setPointerCapture(
                                event.pointerId,
                              )
                              event.currentTarget.focus()
                              autoScroll()
                            }}
                            onPointerMove={drag}
                            onPointerUp={(event) => {
                              if (
                                !gesture ||
                                gesture.pointer !== event.pointerId
                              )
                                return
                              if (gesture.moved && gesture.stage)
                                move(gesture.id, gesture.stage, gesture.before)
                              cancelDrag()
                            }}
                            onPointerCancel={cancelDrag}
                            onLostPointerCapture={cancelDrag}
                          >
                            ⠿ Drag
                          </button>
                          <div class="flex items-center gap-2">
                            <Avatar label={deal.organization} shape="square" />
                            <h3 class="min-w-0 truncate font-medium">
                              {deal.organization}
                            </h3>
                          </div>
                          <div class="my-4 flex items-center justify-between gap-2">
                            <p class="text-section tabular-nums">
                              {money(deal.amount)}
                            </p>
                            <Badge variant="outline">{deal.source}</Badge>
                          </div>
                          <div class="mb-4 flex items-center justify-between gap-2 text-caption text-ink-gray-6">
                            <span>{deal.owner}</span>
                            <time dateTime={deal.due}>{deal.due.slice(5)}</time>
                          </div>
                          <Select
                            aria-label={`Stage for ${deal.organization}`}
                            value={[deal.stage]}
                            options={STAGES.map((value) => ({
                              label: value,
                              value,
                            }))}
                            onValueChange={(value) =>
                              move(
                                deal.id,
                                (value[0] ?? 'Qualification') as Stage,
                              )
                            }
                          />
                        </li>
                      )}
                    </For>
                  </ul>
                </section>
              )}
            </For>
          </div>
        </section>
        <p class="text-caption text-ink-gray-6">
          Drag a card between columns, or use its stage control with the
          keyboard. Changes stay in this page.
        </p>
      </Show>
      <Dialog.Root open={open()} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>New opportunity</Dialog.Title>
            <Dialog.Description>
              Add a deal to your local pipeline.
            </Dialog.Description>
          </Dialog.Header>
          <form
            noValidate
            class="mt-5 flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              setAttempted(true)
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
          >
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
              options={OWNERS.map((value) => ({ label: value, value }))}
              onValueChange={(value) =>
                setNewOwner(value[0] ?? OWNERS[0] ?? '')
              }
            />
            <Select
              label="Initial stage"
              value={[stage()]}
              options={STAGES.map((value) => ({ label: value, value }))}
              onValueChange={(value) =>
                setStage((value[0] ?? 'Qualification') as Stage)
              }
            />
            <DatePicker
              label="Expected close date"
              value={due()}
              onValueChange={setDue}
              required
              error={attempted() && !due() ? 'Choose a close date.' : undefined}
            />
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="solid" theme="blue">
                Create deal
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </ExampleFrame>
  )
}

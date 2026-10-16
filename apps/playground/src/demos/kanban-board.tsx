import { KanbanBoard, type KanbanColumn } from '@newui/blocks'
import { Avatar, Badge } from '@newui/ui'
import { createSignal, type JSX } from 'solid-js'

interface Deal {
  id: string
  organization: string
  amount: number
  owner: string
  tag: string
}

const money = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const DEALS: Deal[] = [
  {
    id: 'D-1',
    organization: 'Globex',
    amount: 45000,
    owner: 'Priya Nair',
    tag: 'Inbound',
  },
  {
    id: 'D-2',
    organization: 'Stark Industries',
    amount: 110000,
    owner: 'Ana Costa',
    tag: 'Referral',
  },
  {
    id: 'D-3',
    organization: 'Wayne Corp',
    amount: 32000,
    owner: 'Sam Rivera',
    tag: 'Outbound',
  },
  {
    id: 'D-4',
    organization: 'Acme Corp',
    amount: 120000,
    owner: 'Priya Nair',
    tag: 'Inbound',
  },
  {
    id: 'D-5',
    organization: 'Umbrella Labs',
    amount: 88000,
    owner: 'Rhea Kapoor',
    tag: 'Partner',
  },
  {
    id: 'D-6',
    organization: 'Hooli',
    amount: 205000,
    owner: 'Ana Costa',
    tag: 'Referral',
  },
]

const columns: KanbanColumn<Deal>[] = [
  {
    id: 'qualification',
    name: 'Qualification',
    theme: 'gray',
    items: DEALS.slice(0, 3),
    summary: money(
      DEALS.slice(0, 3).reduce((sum, deal) => sum + deal.amount, 0),
    ),
    action: { label: 'Add deal' },
  },
  {
    id: 'negotiation',
    name: 'Negotiation',
    theme: 'amber',
    items: DEALS.slice(3),
    summary: money(DEALS.slice(3).reduce((sum, deal) => sum + deal.amount, 0)),
    action: { label: 'Add deal' },
  },
  {
    id: 'closing',
    name: 'Ready to close',
    theme: 'blue',
    items: [],
    action: { label: 'Add deal' },
  },
  {
    id: 'won',
    name: 'Won',
    theme: 'green',
    items: [],
    action: { label: 'Add deal' },
  },
]

/** Registered in `demos.tsx`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  const [notice, setNotice] = createSignal('')
  return (
    <div class="flex flex-col gap-2">
      <div class="h-[26rem] overflow-hidden rounded-6 border border-outline-gray-1">
        <KanbanBoard
          defaultColumns={columns}
          label="Deals pipeline"
          itemLabel={(deal) => deal.organization}
          emptyColumn={() => <span>No deals in this stage.</span>}
          onMove={(move) =>
            setNotice(
              `${move.item.organization} → ${move.columns.find((column) => column.id === move.to.column)?.name}`,
            )
          }
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
                <span class="text-base-semibold text-ink-gray-9 tabular-nums">
                  {money(deal.amount)}
                </span>
                <Badge variant="outline">{deal.tag}</Badge>
              </div>
              <div class="mt-3 flex items-center justify-between gap-2 text-sm text-ink-gray-6">
                <span class="truncate">{deal.owner}</span>
                <span class="shrink-0">Due Aug 2</span>
              </div>
            </>
          )}
        </KanbanBoard>
      </div>
      <p class="text-sm text-ink-gray-6" aria-live="polite">
        {notice() ||
          'Drag a card, or use its menu — every card is movable without a mouse.'}
      </p>
    </div>
  )
}

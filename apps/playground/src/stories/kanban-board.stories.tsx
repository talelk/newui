import { KanbanBoard, type KanbanColumn } from '@newui/blocks'
import { usd as money } from '@newui/data'
import { Avatar, Badge } from '@newui/ui'
import { createSignal, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DemoFrame } from './demo-frame'

interface Deal {
  id: string
  organization: string
  amount: number
  owner: string
  tag: string
}

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

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  const [notice, setNotice] = createSignal('')
  return (
    <div class="flex flex-col gap-2">
      <DemoFrame tall>
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
              <div class="mt-3 flex items-center justify-between gap-2 text-sm text-ink-gray-7">
                <span class="truncate">{deal.owner}</span>
                <span class="shrink-0">Due Aug 2</span>
              </div>
            </>
          )}
        </KanbanBoard>
      </DemoFrame>
      <p class="text-sm text-ink-gray-7" aria-live="polite">
        {notice() ||
          'Drag a card, or use its menu — every card is movable without a mouse.'}
      </p>
    </div>
  )
}

const meta = {
  title: 'Blocks/KanbanBoard',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

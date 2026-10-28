import { Avatar, Badge, Button, Switch } from '@talelk/newui-atoms'
import { createSignal, For, type JSX, onCleanup } from 'solid-js'

const ACTIVITY = [
  { customer: 'Northstar Labs', status: 'Paid', amount: '$12,400' },
  { customer: 'Acme Industries', status: 'Pending', amount: '$8,240' },
  { customer: 'Studio North', status: 'Paid', amount: '$6,850' },
]

export default function HomePreviews(): JSX.Element {
  const [loading, setLoading] = createSignal(false)
  const [notify, setNotify] = createSignal(true)
  let saveTimer: number | undefined

  const save = () => {
    setLoading(true)
    window.clearTimeout(saveTimer)
    saveTimer = window.setTimeout(() => setLoading(false), 1200)
  }
  onCleanup(() => window.clearTimeout(saveTimer))

  return (
    <div class="overflow-hidden rounded-card border border-outline-gray-1 bg-surface-gray-1">
      <div class="flex min-h-12 flex-wrap items-center justify-between gap-3 border-b border-outline-gray-1 bg-surface-elevation-1 px-4 py-2">
        <div class="flex items-center gap-2">
          <span class="grid size-7 place-items-center rounded-control bg-surface-gray-10 text-ink-base">
            <span
              aria-hidden="true"
              class="lucide-chart-no-axes-combined size-4"
            />
          </span>
          <div>
            <p class="text-interface font-medium text-ink-gray-9">
              Revenue workspace
            </p>
            <p class="text-caption text-ink-gray-7">
              A small composition, fully interactive
            </p>
          </div>
        </div>
        <div class="flex -space-x-2">
          <Avatar size="sm" label="Rhea Kapoor" />
          <Avatar size="sm" label="Tomas Lind" />
          <Avatar size="sm" label="Amara Chen" />
        </div>
      </div>

      <div class="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)]">
        <div class="flex flex-col gap-4">
          <section
            class="rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad"
            aria-label="Revenue summary"
          >
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 class="text-interface font-medium text-ink-gray-7">
                  Monthly recurring revenue
                </h3>
                <p class="mt-1 text-metric tabular-nums text-ink-gray-9">
                  $48,290
                </p>
              </div>
              <Badge theme="green">↑ 12.4%</Badge>
            </div>
            <svg
              viewBox="0 0 480 88"
              class="mt-3 h-20 w-full"
              role="img"
              aria-label="Revenue trending upward over twelve weeks"
            >
              <path
                d="M0 72 L44 62 L88 66 L132 48 L176 54 L220 36 L264 44 L308 25 L352 34 L396 20 L440 26 L480 10 L480 88 L0 88 Z"
                fill="var(--surface-blue-2)"
              />
              <path
                d="M0 72 L44 62 L88 66 L132 48 L176 54 L220 36 L264 44 L308 25 L352 34 L396 20 L440 26 L480 10"
                fill="none"
                stroke="var(--ink-blue-7)"
                stroke-width="2"
                vector-effect="non-scaling-stroke"
              />
            </svg>
          </section>

          <section
            class="overflow-hidden rounded-card border border-outline-gray-1 bg-surface-elevation-1"
            aria-label="Recent payments"
          >
            <div class="border-b border-outline-gray-1 px-3 py-2 text-caption font-medium text-ink-gray-7">
              Recent payments
            </div>
            <ul class="divide-y divide-outline-gray-1">
              <For each={ACTIVITY}>
                {(row) => (
                  <li class="flex items-center gap-3 px-3 py-2.5">
                    <span class="min-w-0 flex-1 truncate text-interface text-ink-gray-8">
                      {row.customer}
                    </span>
                    <Badge
                      size="sm"
                      theme={row.status === 'Paid' ? 'green' : 'amber'}
                    >
                      {row.status}
                    </Badge>
                    <span class="w-16 text-end text-interface font-medium tabular-nums text-ink-gray-9">
                      {row.amount}
                    </span>
                  </li>
                )}
              </For>
            </ul>
          </section>
        </div>

        <section
          class="flex flex-col rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad"
          aria-label="Workspace preferences"
        >
          <div>
            <h3 class="text-base-medium text-ink-gray-9">
              Workspace preferences
            </h3>
            <p class="mt-1 text-caption text-ink-gray-7">
              Try the switch, then save your changes.
            </p>
          </div>
          <div class="my-5 border-t border-outline-gray-1" />
          <Switch
            label="Email notifications"
            checked={notify()}
            onCheckedChange={setNotify}
          />
          <p class="mt-3 text-caption text-ink-gray-7" role="status">
            {notify()
              ? 'A weekly revenue summary is on.'
              : 'A weekly revenue summary is off.'}
          </p>
          <div class="mt-auto pt-6">
            <Button
              variant="solid"
              theme="blue"
              loading={loading()}
              onClick={save}
            >
              {loading() ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

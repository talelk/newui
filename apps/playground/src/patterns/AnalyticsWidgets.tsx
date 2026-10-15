import { Badge, Button, Progress } from '@newui/ui'
import { createSignal, For, Show } from 'solid-js'

const CHANNELS = [
  { name: 'Direct', value: 8420 },
  { name: 'Organic search', value: 6840 },
  { name: 'Referrals', value: 4320 },
  { name: 'Social', value: 2150 },
]
export default function AnalyticsWidgets() {
  const [direction, setDirection] = createSignal(false)
  const [selected, setSelected] = createSignal('')
  const [callout, setCallout] = createSignal(true)
  return (
    <div class="flex flex-col gap-8">
      <section>
        <h2 class="mb-4 text-section">Change, with context</h2>
        <div class="flex flex-wrap items-center gap-3">
          <Badge theme="green" prefix={<span aria-hidden="true">↗</span>}>
            18.6% revenue growth
          </Badge>
          <Badge theme="red" prefix={<span aria-hidden="true">↘</span>}>
            3.2% fewer sessions
          </Badge>
          <Badge>0.0% unchanged</Badge>
        </div>
        <div class="mt-5 max-w-sm">
          <Progress
            label="Revenue toward monthly target"
            value={76}
            size="lg"
            hint
          />
        </div>
        <div class="mt-5 max-w-sm rounded-5 border border-outline-gray-1 p-4">
          <p class="text-caption text-ink-gray-6">
            Net change from previous month
          </p>
          <p
            class="mt-2 text-section"
            classList={{
              'text-ink-red-6': direction(),
              'text-ink-green-7': !direction(),
            }}
          >
            {direction() ? '−12.4%' : '+18.6%'}
          </p>
          <div
            class="my-3 flex h-3 overflow-hidden rounded-full bg-surface-gray-2"
            aria-hidden="true"
          >
            <div
              class="w-1/2 border-e border-outline-gray-3"
              classList={{ 'bg-surface-red-2': direction() }}
            />
            <div
              class="w-1/2"
              classList={{ 'bg-surface-green-2': !direction() }}
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDirection((value) => !value)}
          >
            Switch change direction
          </Button>
        </div>
      </section>
      <section>
        <h2 class="mb-4 text-section">Traffic by channel</h2>
        <ul class="flex max-w-xl flex-col gap-2">
          <For each={CHANNELS}>
            {(channel) => (
              <li>
                <button
                  type="button"
                  class="relative flex min-h-10 w-full items-center justify-between gap-3 overflow-hidden rounded-3 px-3 py-2 text-start focus-visible:focus-ring"
                  onClick={() => setSelected(channel.name)}
                >
                  <span
                    aria-hidden="true"
                    class="absolute inset-y-0 start-0 rounded-3 bg-surface-blue-1"
                    style={{ width: `${(channel.value / 8420) * 100}%` }}
                  />
                  <span class="relative font-medium">{channel.name}</span>
                  <span class="relative tabular-nums text-ink-gray-6">
                    {channel.value.toLocaleString('en-US')}
                  </span>
                </button>
              </li>
            )}
          </For>
        </ul>
        <Show when={selected()}>
          <p role="status" class="mt-3 text-caption text-ink-gray-6">
            Showing details for {selected()}.
          </p>
        </Show>
      </section>
      <Show when={callout()}>
        <aside
          class="rounded-5 border border-outline-blue-1 bg-surface-blue-1 p-4"
          aria-label="Report insight"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h2 class="font-medium text-ink-blue-8">
                A strong month for organic growth
              </h2>
              <p class="mt-2 text-interface text-ink-gray-7">
                Search and referrals account for more than half of new sessions.
                Keep investing in content that helps your customers.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon="lucide-x"
              aria-label="Dismiss report insight"
              onClick={() => setCallout(false)}
            />
          </div>
        </aside>
      </Show>
    </div>
  )
}

import { NumberCard } from '@newui/charts'
import { count, usd } from '@newui/data'
import { Alert, Button } from '@newui/ui'
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
        <div class="grid max-w-3xl gap-4 sm:grid-cols-3">
          <NumberCard
            title="Revenue"
            value={direction() ? 35662 : 48290}
            format={usd}
            delta={direction() ? -12.4 : 18.6}
            deltaSuffix="%"
            deltaCaption="from $40,710 previous month"
          />
          <NumberCard
            title="Sessions"
            value={21430}
            format={count}
            delta={-3.2}
            deltaSuffix="%"
            deltaCaption="from 22,138 previous month"
          />
          <NumberCard
            title="Revenue toward monthly target"
            value={48290}
            target={63500}
            format={usd}
          />
        </div>
        <div class="mt-4">
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
                  <span class="relative tabular-nums text-ink-gray-7">
                    {channel.value.toLocaleString('en-US')}
                  </span>
                </button>
              </li>
            )}
          </For>
        </ul>
        <Show when={selected()}>
          <p role="status" class="mt-3 text-caption text-ink-gray-7">
            Showing details for {selected()}.
          </p>
        </Show>
      </section>
      <Show when={callout()}>
        <Alert
          theme="blue"
          title="A strong month for organic growth"
          description="Search and referrals account for more than half of new sessions. Keep investing in content that helps your customers."
          dismissible
          onDismiss={() => setCallout(false)}
        />
      </Show>
    </div>
  )
}

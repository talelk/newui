import { AppSidebar } from '@newui/blocks'
import { Button } from '@newui/ui'
import { createSignal, Show } from 'solid-js'

const ITEMS = [
  { label: 'Home', icon: 'lucide-house' },
  { label: 'Inbox', icon: 'lucide-mail' },
  { label: 'Calendar', icon: 'lucide-calendar' },
  { label: 'Search', icon: 'lucide-search' },
  { label: 'Settings', icon: 'lucide-settings' },
]

/** Application sidebar composition on the AppSidebar block. */
export default function DemoSidebar() {
  const [open, setOpen] = createSignal(true)
  const [destination, setDestination] = createSignal('Home')
  return (
    <div class="flex min-h-screen bg-surface-base">
      <Show when={open()}>
        <AppSidebar
          title="Application"
          showLogo={false}
          width="11rem"
          groups={[
            {
              items: ITEMS.map((item) => ({
                ...item,
                active: destination() === item.label,
                onClick: () => setDestination(item.label),
              })),
            },
          ]}
        />
      </Show>
      <main class="min-w-0 flex-1 p-4">
        <Button
          aria-label="Toggle sidebar"
          aria-expanded={open()}
          onClick={() => setOpen(!open())}
          icon="lucide-panel-left"
        />
        <h1 class="mt-6 text-heading">{destination()}</h1>
        <p class="mt-3 text-ink-gray-7">
          This composition changes sections without leaving the preview.
        </p>
      </main>
    </div>
  )
}

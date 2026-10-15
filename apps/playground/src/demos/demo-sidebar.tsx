import { Button, Icon } from '@newui/ui'
import { createSignal, For, Show } from 'solid-js'

/** Copyable site composition; this is not an @newui/blocks export. */
export default function DemoSidebar() {
  const [open, setOpen] = createSignal(true)
  const [destination, setDestination] = createSignal('Home')
  return (
    <div class="flex min-h-screen bg-surface-base">
      <Show when={open()}>
        <nav
          aria-label="Application"
          class="w-44 shrink-0 border-e border-outline-gray-1 p-3"
        >
          <h2 class="mb-3 text-caption text-ink-gray-6">Application</h2>
          <For each={['Home', 'Inbox', 'Calendar', 'Search', 'Settings']}>
            {(item) => (
              <button
                type="button"
                aria-current={destination() === item ? 'page' : undefined}
                class="flex w-full items-center gap-2 rounded-3 px-3 py-2 text-start aria-[current=page]:bg-surface-blue-2 focus-visible:focus-ring"
                onClick={() => setDestination(item)}
              >
                <Icon
                  icon={
                    item === 'Inbox'
                      ? 'lucide-mail'
                      : item === 'Calendar'
                        ? 'lucide-calendar'
                        : item === 'Settings'
                          ? 'lucide-settings'
                          : item === 'Search'
                            ? 'lucide-search'
                            : 'lucide-house'
                  }
                />
                {item}
              </button>
            )}
          </For>
        </nav>
      </Show>
      <main class="min-w-0 flex-1 p-4">
        <Button
          aria-label="Toggle sidebar"
          aria-expanded={open()}
          onClick={() => setOpen(!open())}
          icon="lucide-panel-left"
        />
        <h1 class="mt-6 text-heading">{destination()}</h1>
        <p class="mt-3 text-ink-gray-6">
          This local composition changes sections without leaving the preview.
        </p>
      </main>
    </div>
  )
}

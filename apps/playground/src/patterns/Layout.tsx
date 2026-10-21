import { Button } from '@newui/atoms'
import { createSignal, For } from 'solid-js'

export default function Layout() {
  const [split, setSplit] = createSignal('50')
  const [direction, setDirection] = createSignal(false)
  return (
    <div class="flex flex-col gap-8">
      <section>
        <h2 class="text-section">Adjustable panels</h2>
        <p class="mt-2 text-ink-gray-7">
          Resize with the labelled range control. Its native keyboard support
          works with arrows, Home and End.
        </p>
        <label
          for="panel-width"
          class="mt-4 block text-caption font-medium text-ink-gray-7"
        >
          Left panel width · {split()}%
        </label>
        <input
          id="panel-width"
          type="range"
          min="25"
          max="75"
          value={split()}
          onInput={(event) => setSplit(event.currentTarget.value)}
          class="my-3 h-8 w-full accent-ink-blue-link focus-visible:focus-ring"
        />
        <div class="flex min-h-56 min-w-0 overflow-hidden rounded-5 border border-outline-gray-1">
          <div
            class="flex min-w-0 flex-col justify-center bg-surface-blue-1 p-4 text-ink-blue-8"
            style={{ width: `${split()}%` }}
          >
            <h3 class="font-medium">Workspace</h3>
            <p class="mt-2 break-words text-caption">
              Flexible panels keep the context close.
            </p>
          </div>
          <div aria-hidden="true" class="w-px shrink-0 bg-outline-gray-2" />
          <div class="flex min-w-0 flex-1 flex-col justify-center bg-surface-gray-1 p-4">
            <h3 class="font-medium">Details</h3>
            <p class="mt-2 break-words text-caption text-ink-gray-7">
              Native flex layout, no panel engine.
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 class="mb-4 text-section">A stable aspect ratio</h2>
        <div class="grid aspect-video place-content-center rounded-5 border border-outline-blue-1 bg-surface-blue-1 p-4 text-center">
          <p class="text-section text-ink-blue-8">16 : 9</p>
          <p class="mt-2 text-caption text-ink-gray-7">
            Room for a report, a preview or a presentation.
          </p>
        </div>
      </section>
      <section>
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-section">Flex and grid</h2>
          <Button
            variant="outline"
            onClick={() => setDirection((previous) => !previous)}
          >
            Toggle layout
          </Button>
        </div>
        <div
          class="gap-3"
          classList={{
            'grid sm:grid-cols-3': !direction(),
            'flex flex-col': direction(),
          }}
        >
          <For each={['Discover', 'Build', 'Measure']}>
            {(label, index) => (
              <div class="rounded-5 border border-outline-gray-1 bg-surface-gray-1 p-4">
                <p class="text-caption text-ink-gray-7">0{index() + 1}</p>
                <h3 class="mt-3 font-medium">{label}</h3>
              </div>
            )}
          </For>
        </div>
      </section>
    </div>
  )
}

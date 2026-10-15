import { Button, Select, TextInput } from '@newui/ui'
import { createMemo, createSignal, For, Show } from 'solid-js'

const sections = [
  { title: 'Getting Started', pages: ['Installation', 'Project Structure'] },
  {
    title: 'Building Your Application',
    pages: [
      'Routing',
      'Data Fetching',
      'Rendering',
      'Caching',
      'Styling',
      'Optimizing',
    ],
  },
  {
    title: 'API Reference',
    pages: ['Components', 'File Conventions', 'Functions', 'Configuration'],
  },
]

/** Grouped documentation sidebar, adapted from solid-ui sidebar-01. */
export default function Sidebar01() {
  const [open, setOpen] = createSignal(true)
  const [version, setVersion] = createSignal('1.0.1')
  const [query, setQuery] = createSignal('')
  const [current, setCurrent] = createSignal('Data Fetching')
  const group = createMemo(
    () => sections.find((section) => section.pages.includes(current()))?.title,
  )
  return (
    <div class="flex min-h-screen bg-surface-base">
      <Show when={open()}>
        <aside class="w-52 shrink-0 border-e border-outline-gray-1 p-3">
          <Select
            label="Documentation version"
            value={[version()]}
            options={['1.0.1', '1.1.0-alpha.0', '2.0.0-beta.1'].map(
              (value) => ({ value, label: value }),
            )}
            onValueChange={(value) => setVersion(value[0] ?? '1.0.1')}
          />
          <div class="my-4">
            <TextInput
              type="search"
              label="Search documentation"
              value={query()}
              onInput={(event) => setQuery(event.currentTarget.value)}
            />
          </div>
          <nav aria-label="Documentation sections">
            <For each={sections}>
              {(section) => (
                <details open class="mb-3">
                  <summary class="cursor-pointer rounded-3 py-2 text-caption text-ink-gray-6 focus-visible:focus-ring">
                    {section.title}
                  </summary>
                  <For
                    each={section.pages.filter((title) =>
                      title.toLowerCase().includes(query().toLowerCase()),
                    )}
                  >
                    {(title) => (
                      <button
                        type="button"
                        class="block w-full rounded-3 px-3 py-2 text-start aria-[current=page]:bg-surface-blue-2 focus-visible:focus-ring"
                        aria-current={current() === title ? 'page' : undefined}
                        onClick={() => setCurrent(title)}
                      >
                        {title}
                      </button>
                    )}
                  </For>
                </details>
              )}
            </For>
          </nav>
        </aside>
      </Show>
      <main class="min-w-0 flex-1">
        <header class="flex flex-wrap items-center gap-3 border-b border-outline-gray-1 p-4">
          <Button
            icon="lucide-panel-left"
            aria-label="Toggle sidebar"
            aria-expanded={open()}
            onClick={() => setOpen(!open())}
          />
          <nav aria-label="Breadcrumb" class="text-caption">
            {group()} / {current()}
          </nav>
        </header>
        <section class="p-4">
          <p class="text-caption text-ink-gray-6">Version {version()}</p>
          <h1 class="mt-3 text-heading">{current()}</h1>
          <p class="mt-3">
            The selected documentation section and version are local to this
            preview.
          </p>
        </section>
      </main>
    </div>
  )
}

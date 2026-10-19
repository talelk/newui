import { AppSidebar } from '@newui/blocks'
import { Breadcrumbs, Button, Select, TextInput } from '@newui/ui'
import { createMemo, createSignal, Show } from 'solid-js'

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

/** Grouped documentation sidebar on AppSidebar, adapted from solid-ui sidebar-01. */
export default function Sidebar01() {
  const [open, setOpen] = createSignal(true)
  const [version, setVersion] = createSignal('1.0.1')
  const [query, setQuery] = createSignal('')
  const [current, setCurrent] = createSignal('Data Fetching')
  const group = createMemo(
    () => sections.find((section) => section.pages.includes(current()))?.title,
  )
  const groups = createMemo(() =>
    sections
      .map((section) => ({
        label: section.title,
        items: section.pages
          .filter((title) =>
            title.toLowerCase().includes(query().toLowerCase()),
          )
          .map((title) => ({
            label: title,
            active: current() === title,
            onClick: () => setCurrent(title),
          })),
      }))
      .filter((section) => section.items.length > 0),
  )
  return (
    <div class="flex min-h-screen bg-surface-base">
      {/* The rail is desktop furniture: below `lg` it would out-width the
          viewport and force the page sideways, so it folds away (the header
          button still toggles it). */}
      <Show when={open()}>
        <div class="flex w-60 shrink-0 flex-col border-e border-outline-gray-1 max-lg:hidden">
          <div class="flex flex-col gap-3 border-b border-outline-gray-1 p-3">
            <Select
              label="Documentation version"
              value={[version()]}
              options={['1.0.1', '1.1.0-alpha.0', '2.0.0-beta.1'].map(
                (value) => ({ value, label: value }),
              )}
              onValueChange={(value) => setVersion(value[0] ?? '1.0.1')}
            />
            <TextInput
              type="search"
              label="Search documentation"
              value={query()}
              onInput={(event) => setQuery(event.currentTarget.value)}
            />
          </div>
          <AppSidebar
            title="Documentation"
            showLogo={false}
            width="100%"
            class="min-h-0 flex-1 border-e-0"
            groups={groups()}
          />
        </div>
      </Show>
      <main class="min-w-0 flex-1">
        <header class="flex flex-wrap items-center gap-3 border-b border-outline-gray-1 p-4">
          <Button
            icon="lucide-panel-left"
            aria-label="Toggle sidebar"
            aria-expanded={open()}
            onClick={() => setOpen(!open())}
          />
          <Breadcrumbs
            items={[
              { label: group() ?? 'Documentation' },
              { label: current() },
            ]}
          />
        </header>
        <section class="p-4">
          <p class="text-caption text-ink-gray-7">Version {version()}</p>
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

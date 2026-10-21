import { Button, TextInput } from '@talelk/newui-atoms'
import { Select } from '@talelk/newui-molecules'
import { SidebarItem } from '@talelk/newui-organisms'
import { AppShell } from '@talelk/newui-templates'
import { createMemo, createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

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

/** Grouped documentation navigation inside the unified AppShell. */
export function Demo() {
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
    <AppShell
      title={current()}
      description="Grouped documentation navigation in one responsive application shell."
      breadcrumbs={[
        { label: group() ?? 'Documentation' },
        { label: current() },
      ]}
      brand={
        <span class="flex min-h-10 items-center gap-2 px-2 font-semibold">
          <span
            aria-hidden="true"
            class="lucide-book-open size-5 text-ink-blue-6"
          />
          Documentation
        </span>
      }
      brandCollapsed={
        <span class="grid size-10 place-items-center">
          <span class="sr-only">Documentation</span>
          <span
            aria-hidden="true"
            class="lucide-book-open size-5 text-ink-blue-6"
          />
        </span>
      }
      tenant={
        <Select
          aria-label="Documentation version"
          value={version()}
          options={['1.0.1', '1.1.0-alpha.0', '2.0.0-beta.1'].map((value) => ({
            value,
            label: value,
          }))}
          onValueChange={(value) => setVersion(value ?? '1.0.1')}
        />
      }
      tenantCollapsed={
        <Button
          variant="ghost"
          icon="lucide-git-branch"
          aria-label={`Documentation version ${version()}`}
        />
      }
      sidebarSearch={
        <TextInput
          type="search"
          label="Search documentation"
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
        />
      }
      navigation={groups()}
      settings={
        <SidebarItem label="Settings" icon="lucide-settings">
          Settings
        </SidebarItem>
      }
      account={
        <SidebarItem label="Documentation profile" icon="lucide-user-round">
          Documentation profile
        </SidebarItem>
      }
      actions={
        <Button variant="outline" iconLeft="lucide-panel-left">
          Collapse is built into the sidebar
        </Button>
      }
    >
      <section class="rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-4">
        <p class="text-caption text-ink-gray-7">Version {version()}</p>
        <h2 class="mt-2 text-section">{current()}</h2>
        <p class="mt-3 text-ink-gray-7">
          Select a section from the grouped menu. It remains one navigation
          surface when the desktop sidebar collapses or opens on mobile.
        </p>
      </section>
    </AppShell>
  )
}

const meta = {
  title: 'Organisms/Grouped documentation sidebar',
  component: Demo,
  excludeStories: ['Demo'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

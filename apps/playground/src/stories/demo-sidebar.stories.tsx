import { Button } from '@talelk/newui-atoms'
import { Dropdown } from '@talelk/newui-molecules'
import { AppSidebar } from '@talelk/newui-organisms'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

const ITEMS = [
  { label: 'Home', icon: 'lucide-house' },
  { label: 'Inbox', icon: 'lucide-mail' },
  { label: 'Calendar', icon: 'lucide-calendar' },
  { label: 'Search', icon: 'lucide-search' },
  { label: 'Settings', icon: 'lucide-settings' },
]

/** One application sidebar with its tenant, sections and pinned utilities. */

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  const [open, setOpen] = createSignal(true)
  const [destination, setDestination] = createSignal('Home')
  return (
    <div class="flex min-h-screen bg-surface-base">
      <AppSidebar
        brand={
          <span class="flex min-h-10 items-center gap-2 px-2 font-semibold">
            Acme
          </span>
        }
        brandCollapsed={
          <span class="grid size-10 place-items-center font-bold">
            <span class="sr-only">Acme</span>A
          </span>
        }
        tenant={
          <Dropdown
            options={[
              { label: 'Acme · Production', value: 'prod' },
              { label: 'Acme · Staging', value: 'staging' },
            ]}
          >
            <span>Acme · Production</span>
          </Dropdown>
        }
        tenantCollapsed={
          <Dropdown
            options={[
              { label: 'Acme · Production', value: 'prod' },
              { label: 'Acme · Staging', value: 'staging' },
            ]}
          >
            <span>
              <span class="sr-only">Choose tenant</span>A
            </span>
          </Dropdown>
        }
        width="11rem"
        collapsed={!open()}
        onCollapsedChange={(value) => setOpen(!value)}
        groups={[
          {
            label: 'Workspace',
            items: ITEMS.map((item) => ({
              ...item,
              active: destination() === item.label,
              onClick: () => setDestination(item.label),
            })),
          },
        ]}
        settings={<span class="px-2 py-2 text-sm">Workspace settings</span>}
        account={<span class="px-2 py-2 text-sm">Rhea Kapoor</span>}
        accountCollapsed={
          <span class="grid size-8 place-items-center rounded-full bg-surface-blue-2">
            <span class="sr-only">Rhea Kapoor</span>R
          </span>
        }
      />
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

const meta = {
  title: 'Organisms/Compositions/DemoSidebar',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

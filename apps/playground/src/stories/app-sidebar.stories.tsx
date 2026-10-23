import { Dropdown } from '@talelk/newui-molecules'
import { AppSidebar, SidebarItem } from '@talelk/newui-organisms'
import { createSignal, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/** The demo body; the optional props let the Collapsed story start folded. */
function Example(props: {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}): JSX.Element {
  return (
    <div class="h-[32rem] overflow-auto rounded-6 border border-outline-gray-2">
      <AppSidebar
        brand={
          <span class="flex min-h-10 items-center gap-2 px-2 font-semibold">
            Acme support
          </span>
        }
        brandCollapsed={
          <span class="grid size-10 place-items-center font-bold">
            <span class="sr-only">Acme support</span>A
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
          <button
            type="button"
            aria-label="Switch tenant"
            title="Switch tenant"
            class="grid size-8 place-items-center rounded-control text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring"
          >
            <span aria-hidden="true" class="text-xs font-semibold">
              A
            </span>
          </button>
        }
        collapsed={props.collapsed}
        onCollapsedChange={props.onCollapsedChange}
        groups={[
          {
            items: [
              {
                label: 'Tickets',
                icon: 'lucide-ticket',
                count: 24,
                active: true,
              },
              { label: 'Customers', icon: 'lucide-building-2' },
            ],
          },
          {
            label: 'Knowledge',
            items: [
              { label: 'Articles', icon: 'lucide-book-open' },
              { label: 'Agents', icon: 'lucide-headset' },
            ],
          },
        ]}
        settings={
          <SidebarItem label="Settings" icon="lucide-settings">
            Settings
          </SidebarItem>
        }
        utilities={
          <SidebarItem label="Appearance" icon="lucide-sun">
            Appearance
          </SidebarItem>
        }
        utilitiesCollapsed={
          <SidebarItem label="Appearance" icon="lucide-sun">
            Appearance
          </SidebarItem>
        }
        account={
          <SidebarItem label="Rhea Kapoor" icon="lucide-user-round">
            Rhea Kapoor
          </SidebarItem>
        }
        accountCollapsed={
          <SidebarItem label="Rhea Kapoor" icon="lucide-user-round">
            Rhea Kapoor
          </SidebarItem>
        }
      />
    </div>
  )
}

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return <Example />
}

const meta = {
  title: 'Organisms/AppSidebar',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Collapsed: the integrated sidebar folds to labelled icons before interaction. */
export const Collapsed: Story = {
  render: () => {
    const [collapsed, setCollapsed] = createSignal(true)
    return <Example collapsed={collapsed()} onCollapsedChange={setCollapsed} />
  },
}

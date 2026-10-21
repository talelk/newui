import {
  Sidebar,
  SidebarCollapseToggle,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSearch,
  SidebarSection,
} from '@talelk/newui-organisms'
import { createSignal, For } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DemoFrame } from './demo-frame'

const ITEMS = [
  { label: 'Overview', icon: 'lucide-house' },
  { label: 'Inbox', icon: 'lucide-inbox', count: 4 },
  { label: 'Reports', icon: 'lucide-chart-no-axes-column' },
]

function Example(props: {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}) {
  const [active, setActive] = createSignal('Inbox')
  const [query, setQuery] = createSignal('')
  const visible = () =>
    ITEMS.filter((item) =>
      item.label.toLowerCase().includes(query().toLowerCase()),
    )
  return (
    <DemoFrame medium>
      <Sidebar
        ariaLabel="Workspace navigation"
        width="15rem"
        collapsed={props.collapsed}
        onCollapsedChange={props.onCollapsedChange}
      >
        <SidebarHeader title="Acme workspace" subtitle="Production" />
        <SidebarSearch
          placeholder="Search pages…"
          value={query()}
          onInput={setQuery}
        />
        <div class="flex flex-col gap-0.5 px-1">
          <For each={visible()}>
            {(item) => (
              <SidebarItem
                label={item.label}
                icon={item.icon}
                active={active() === item.label}
                onClick={() => setActive(item.label)}
                suffix={
                  item.count ? (
                    <span class="rounded-full bg-surface-gray-2 px-1.5 py-px text-caption tabular-nums text-ink-gray-7">
                      {item.count}
                    </span>
                  ) : undefined
                }
              >
                {item.label}
              </SidebarItem>
            )}
          </For>
        </div>
        <SidebarSection label="Archived" collapsible defaultCollapsed>
          <div class="flex flex-col gap-0.5 px-1">
            <SidebarItem label="Q3 launch">Q3 launch</SidebarItem>
            <SidebarItem label="Website redesign">Website redesign</SidebarItem>
          </div>
        </SidebarSection>
        <SidebarLabel divider>General</SidebarLabel>
        <div class="mt-auto flex flex-col gap-1 p-2">
          <SidebarCollapseToggle />
          <SidebarItem label="Settings" icon="lucide-settings">
            Settings
          </SidebarItem>
        </div>
      </Sidebar>
    </DemoFrame>
  )
}

export function Demo() {
  return <Example />
}

const meta = {
  title: 'Organisms/Sidebar',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Collapsed: Story = {
  render: () => {
    const [collapsed, setCollapsed] = createSignal(true)
    return <Example collapsed={collapsed()} onCollapsedChange={setCollapsed} />
  },
}

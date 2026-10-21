import { Button } from '@newui/atoms'
import { Dropdown } from '@newui/molecules'
import { SidebarItem } from '@newui/organisms'
import { AppShell } from '@newui/templates'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/** The single responsive workspace frame, with one integrated sidebar. */
export function Demo(props: { collapsed?: boolean }): JSX.Element {
  const tenants = [
    {
      label: 'Acme · Production',
      value: 'production',
      icon: 'lucide-building-2',
    },
    { label: 'Acme · Staging', value: 'staging', icon: 'lucide-flask-conical' },
  ]
  return (
    <AppShell
      title="Projects"
      description="One responsive shell, one sidebar, grouped navigation."
      brand={
        <span class="flex min-h-10 items-center gap-2 rounded-3 px-2 font-semibold">
          <span
            aria-hidden="true"
            class="lucide-boxes size-5 text-ink-blue-6"
          />
          Acme workspace
        </span>
      }
      brandCollapsed={
        <span class="grid size-10 place-items-center">
          <span class="sr-only">Acme workspace</span>
          <span
            aria-hidden="true"
            class="lucide-boxes size-5 text-ink-blue-6"
          />
        </span>
      }
      tenant={
        <Dropdown options={tenants}>
          <span class="flex items-center gap-2">
            <span aria-hidden="true" class="lucide-building-2 size-4" />
            Acme · Production
          </span>
        </Dropdown>
      }
      tenantCollapsed={
        <Dropdown options={tenants}>
          <span class="grid size-9 place-items-center">
            <span class="sr-only">Choose tenant</span>
            <span aria-hidden="true" class="lucide-building-2 size-4" />
          </span>
        </Dropdown>
      }
      collapsed={props.collapsed}
      navigation={[
        {
          label: 'Workspace',
          items: [
            { label: 'Projects', icon: 'lucide-folder-kanban', active: true },
            { label: 'Customers', icon: 'lucide-users', count: 4 },
          ],
        },
        {
          label: 'Reports',
          items: [
            { label: 'Revenue', icon: 'lucide-chart-no-axes-combined' },
            { label: 'Activity', icon: 'lucide-activity' },
          ],
        },
      ]}
      settings={
        <SidebarItem label="Settings" icon="lucide-settings">
          Settings
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
      actions={
        <Button variant="solid" theme="blue" iconLeft="lucide-plus">
          New project
        </Button>
      }
    >
      <div class="rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-4">
        The desktop sidebar collapses to labelled icons. At phone width this
        same menu opens as an expanded drawer.
      </div>
    </AppShell>
  )
}

const meta = {
  title: 'Templates/AppShell',
  component: Demo,
  excludeStories: ['Demo'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The same sidebar is accessible as labeled icons when collapsed. */
export const Collapsed: Story = {
  render: () => <Demo collapsed />,
}

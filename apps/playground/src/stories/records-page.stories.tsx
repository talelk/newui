import { Button } from '@talelk/newui-atoms'
import { usd } from '@talelk/newui-data'
import { Dropdown } from '@talelk/newui-molecules'
import {
  DataTable,
  type DataTableColumn,
  FilterBar,
  SidebarItem,
  StatGrid,
} from '@talelk/newui-organisms'
import { AppShell } from '@talelk/newui-templates'
import { createSignal, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * A composed recipe: the frame, a block section and the data layer's table,
 * filled with the starter's records.
 *
 * The other stories answer "what is this component". This one answers "what does
 * a page look like when the levels are stacked" — the question a reader has after
 * learning the parts and before copying `apps/starter`. It is deliberately a
 * *composition*, not a new component: every piece here is a public surface.
 */

interface Project {
  id: string
  name: string
  owner: string
  status: 'Active' | 'Paused' | 'Done'
  budget: number
}

const ROWS: Project[] = [
  {
    id: 'PRJ-001',
    name: 'Ledger migration',
    owner: 'Rhea Kapoor',
    status: 'Active',
    budget: 4_000,
  },
  {
    id: 'PRJ-002',
    name: 'Billing portal',
    owner: 'Daniel Okafor',
    status: 'Paused',
    budget: 7_750,
  },
  {
    id: 'PRJ-003',
    name: 'Field service app',
    owner: 'Mariam Haddad',
    status: 'Done',
    budget: 11_500,
  },
  {
    id: 'PRJ-004',
    name: 'Design tokens audit',
    owner: 'Jonas Weber',
    status: 'Active',
    budget: 15_250,
  },
  {
    id: 'PRJ-005',
    name: 'Support inbox',
    owner: 'Sofia Rossi',
    status: 'Paused',
    budget: 19_000,
  },
]

const COLUMNS: DataTableColumn<Project>[] = [
  { accessorKey: 'name', header: 'Project' },
  { accessorKey: 'owner', header: 'Owner' },
  { accessorKey: 'status', header: 'Status' },
  {
    accessorKey: 'budget',
    header: 'Budget',
    meta: { align: 'end' },
    cell: (context) => usd(context.row.original.budget),
  },
]

export function Demo(): JSX.Element {
  const [status, setStatus] = createSignal('All statuses')
  return (
    <AppShell
      title="Projects, at a glance"
      description="One collection, filtered and sorted in the browser."
      breadcrumbs={[{ label: 'Workspace', href: '/' }, { label: 'Projects' }]}
      actions={
        <Button variant="solid" theme="blue" iconLeft="lucide-plus">
          New project
        </Button>
      }
      navLabel="Starter navigation"
      navigation={[
        {
          label: 'Workspace',
          items: [{ label: 'Projects', icon: 'lucide-folders', active: true }],
        },
      ]}
      brand={
        <span class="flex min-h-10 items-center gap-2 px-2 font-semibold">
          <span
            aria-hidden="true"
            class="lucide-boxes size-5 text-ink-blue-6"
          />
          Acme
        </span>
      }
      tenant={
        <Dropdown options={[{ label: 'Acme · Production', value: 'prod' }]}>
          Acme · Production
        </Dropdown>
      }
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
      footer={
        <footer class="flex flex-wrap justify-between gap-2 text-caption text-ink-gray-6">
          <span>Local demo data · Built with newui</span>
          <span>Settings →</span>
        </footer>
      }
    >
      <div class="flex flex-col gap-4">
        <div class="hidden sm:block">
          <StatGrid
            stats={[
              {
                label: 'Active budget',
                value: usd(19_250),
                hint: '2 projects in flight',
                icon: 'lucide-wallet',
              },
              {
                label: 'Active',
                value: '2',
                hint: 'Being worked on now',
                icon: 'lucide-activity',
              },
              {
                label: 'Paused',
                value: '2',
                hint: 'Waiting on a decision',
                icon: 'lucide-pause',
              },
              {
                label: 'Done',
                value: '1',
                hint: `${usd(11_500)} delivered`,
                icon: 'lucide-circle-check',
              },
            ]}
          />
        </div>
        <FilterBar
          selects={[
            {
              label: 'Status',
              options: [
                { label: 'All statuses', value: 'All statuses' },
                { label: 'Active', value: 'Active' },
                { label: 'Paused', value: 'Paused' },
                { label: 'Done', value: 'Done' },
              ],
              value: status(),
              onValueChange: setStatus,
            },
          ]}
          resultCount={ROWS.length}
        />
        <DataTable
          title="Projects"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={5}
          selectable={false}
          recordsLabel="projects"
        />
      </div>
    </AppShell>
  )
}

const meta = {
  title: 'Pages/RecordsPage',
  component: Demo,
  excludeStories: ['Demo'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** Every level at once: the frame, the blocks and the table. */
export const Default: Story = {}

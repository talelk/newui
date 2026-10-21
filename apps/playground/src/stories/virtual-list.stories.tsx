import { VirtualList } from '@talelk/newui-organisms'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

const ROWS = Array.from({ length: 250 }, (_, index) => ({
  id: `ACT-${String(index + 1).padStart(3, '0')}`,
  title: `Workspace activity ${index + 1}`,
  owner:
    ['Rhea Kapoor', 'Mariam Haddad', 'Jonas Weber'][index % 3] ?? 'Rhea Kapoor',
  status: ['Created', 'Updated', 'Reviewed'][index % 3] ?? 'Created',
}))

export function Demo() {
  return (
    <VirtualList
      label="Workspace activity"
      items={ROWS}
      itemSize={64}
      height="24rem"
    >
      {(row) => (
        <div class="flex h-full items-center gap-3 border-b border-outline-gray-1 px-4">
          <span class="grid size-8 shrink-0 place-items-center rounded-full bg-surface-blue-2 text-caption text-ink-blue-8">
            {row.owner
              .split(' ')
              .map((part) => part[0])
              .join('')}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium">{row.title}</p>
            <p class="text-caption text-ink-gray-7">{row.owner}</p>
          </div>
          <span class="text-caption text-ink-gray-7">{row.status}</span>
        </div>
      )}
    </VirtualList>
  )
}

const meta = {
  title: 'Organisms/VirtualList',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

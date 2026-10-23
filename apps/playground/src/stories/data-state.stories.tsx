import { Badge, Button } from '@talelk/newui-atoms'
import { DataState } from '@talelk/newui-organisms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DemoFrame } from './demo-frame'

export function Demo(): JSX.Element {
  return (
    <DemoFrame>
      <DataState
        status="ready"
        title="Expenses"
        description="Records in the selected period."
      >
        <div class="rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad text-interface">
          <div class="flex items-center justify-between">
            <span>Cloud infrastructure</span>
            <Badge theme="green" label="Posted" />
          </div>
        </div>
      </DataState>
    </DemoFrame>
  )
}

const meta = {
  title: 'Organisms/DataState',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = {
  render: () => (
    <DemoFrame>
      <DataState status="loading" skeleton="rows" rows={4} />
    </DemoFrame>
  ),
}

export const Empty: Story = {
  render: () => (
    <DemoFrame>
      <DataState
        status="empty"
        title="No expenses in this period"
        description="Change the date range or clear the filters."
        action={<Button variant="outline">Clear filters</Button>}
      />
    </DemoFrame>
  ),
}

export const Error: Story = {
  render: () => (
    <DemoFrame>
      <DataState
        status="error"
        title="Could not load expenses"
        error="The local request failed."
        onRetry={() => {}}
      />
    </DemoFrame>
  ),
}

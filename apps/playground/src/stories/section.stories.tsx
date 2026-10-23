import { Badge, Button } from '@talelk/newui-atoms'
import { Section } from '@talelk/newui-organisms'
import { For, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DemoFrame } from './demo-frame'

export function Demo(): JSX.Element {
  return (
    <DemoFrame>
      <Section
        title="Pending expenses"
        description="Records waiting for approval in the selected period."
        actions={
          <Button variant="outline" size="sm">
            Export
          </Button>
        }
        toolbar={
          <div class="flex items-center gap-2 border-y border-outline-gray-1 bg-surface-gray-1 px-3 py-2 text-caption text-ink-gray-7">
            Search, filters and column controls belong here.
          </div>
        }
        footer={
          <div class="flex items-center justify-between text-caption text-ink-gray-7">
            <span>18 records</span>
            <span>1–8 of 18</span>
          </div>
        }
        surface="card"
      >
        <div class="grid gap-2 p-card-pad">
          <For
            each={[
              'Cloud infrastructure',
              'Workspace supplies',
              'Monthly payroll',
            ]}
          >
            {(row) => (
              <div class="flex items-center justify-between gap-3 rounded-control border border-outline-gray-1 px-2 py-1.5 text-interface">
                <span>{row}</span>
                <Badge theme="amber" label="Pending" />
              </div>
            )}
          </For>
        </div>
      </Section>
    </DemoFrame>
  )
}

const meta = {
  title: 'Organisms/Section',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Compact rhythm for a dense table-led page. */
export const Compact: Story = {
  render: () => (
    <DemoFrame>
      <Section
        title="Ledger"
        description="Posted transactions in the selected period."
        density="compact"
        surface="card"
      >
        <div class="p-card-pad-compact text-caption text-ink-gray-7">
          The compact section uses an 8px rhythm and 12px card padding.
        </div>
      </Section>
    </DemoFrame>
  ),
}

/** A plain section around a surface that already owns its card. */
export const Plain: Story = {
  render: () => (
    <DemoFrame>
      <Section
        title="Cashflow ledger"
        description="The table below owns its own border and footer."
      >
        <div class="rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad text-caption text-ink-gray-7">
          Data surface
        </div>
      </Section>
    </DemoFrame>
  ),
}

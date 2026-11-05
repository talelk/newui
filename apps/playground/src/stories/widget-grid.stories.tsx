import { Switch } from '@talelk/newui-atoms'
import { WidgetGrid, type WidgetGridConfig } from '@talelk/newui-organisms'
import { createSignal, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DemoFrame } from './demo-frame'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  const [config, setConfig] = createSignal<WidgetGridConfig>({
    v: 1,
    widgets: {},
  })
  const [editing, setEditing] = createSignal(true)
  return (
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-end gap-2">
        <Switch
          checked={editing()}
          onCheckedChange={setEditing}
          label="Edit layout"
        />
      </div>
      <DemoFrame tall>
        <WidgetGrid
          config={config()}
          onConfigChange={setConfig}
          editable={editing()}
          resettable
          rowHeight={64}
          label="Analytics dashboard"
        >
          <WidgetGrid.Widget id="kpi-row" span={12} rows={1} title="This week">
            <div class="flex flex-wrap items-baseline gap-x-8 gap-y-1">
              <span class="text-base-semibold text-ink-gray-9 tabular-nums">
                1,284 sessions
              </span>
              <span class="text-sm text-ink-gray-7 tabular-nums">
                $41.2k revenue
              </span>
              <span class="text-sm text-ink-gray-7 tabular-nums">
                3.9% conversion
              </span>
            </div>
          </WidgetGrid.Widget>
          <WidgetGrid.Widget id="trend" span={8} rows={4} title="Revenue trend">
            <div class="flex h-full items-end gap-1.5">
              {[34, 52, 41, 68, 59, 77, 63, 88, 71, 92].map((value) => (
                <div
                  class="flex-1 rounded-t bg-surface-blue-4"
                  style={{ height: `${value}%` }}
                />
              ))}
            </div>
          </WidgetGrid.Widget>
          <WidgetGrid.Widget
            id="breakdown"
            span={4}
            rows={4}
            title="By channel"
          >
            <ul class="flex flex-col gap-2 text-sm">
              <li class="flex justify-between">
                <span class="text-ink-gray-7">Organic</span>
                <span class="text-ink-gray-9 tabular-nums">46%</span>
              </li>
              <li class="flex justify-between">
                <span class="text-ink-gray-7">Referral</span>
                <span class="text-ink-gray-9 tabular-nums">28%</span>
              </li>
              <li class="flex justify-between">
                <span class="text-ink-gray-7">Paid</span>
                <span class="text-ink-gray-9 tabular-nums">19%</span>
              </li>
              <li class="flex justify-between">
                <span class="text-ink-gray-7">Other</span>
                <span class="text-ink-gray-9 tabular-nums">7%</span>
              </li>
            </ul>
          </WidgetGrid.Widget>
        </WidgetGrid>
      </DemoFrame>
      <p class="text-sm text-ink-gray-7" aria-live="polite">
        Drag a header, pull a corner, or tab to a handle and use the arrows —
        the layout is one JSON document, ready for the config store.
      </p>
    </div>
  )
}

const meta = {
  title: 'Organisms/WidgetGrid',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

export const ReadOnly: Story = {
  render: () => (
    <DemoFrame tall>
      <WidgetGrid label="Analytics dashboard">
        <WidgetGrid.Widget id="kpi-row" span={12} rows={1} title="This week">
          <span class="text-base-semibold text-ink-gray-9 tabular-nums">
            1,284 sessions
          </span>
        </WidgetGrid.Widget>
        <WidgetGrid.Widget id="trend" span={8} rows={4} title="Revenue trend">
          <div class="flex h-full items-end gap-1.5">
            {[34, 52, 41, 68, 59, 77, 63, 88].map((value) => (
              <div
                class="flex-1 rounded-t bg-surface-blue-4"
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
        </WidgetGrid.Widget>
        <WidgetGrid.Widget id="breakdown" span={4} rows={4} title="By channel">
          <span class="text-sm text-ink-gray-7">Organic 46% · Referral 28%</span>
        </WidgetGrid.Widget>
      </WidgetGrid>
    </DemoFrame>
  ),
}

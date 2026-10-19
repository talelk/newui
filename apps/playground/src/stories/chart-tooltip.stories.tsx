import { ChartTooltip } from '@newui/charts'
import { Button } from '@newui/ui'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  const [open, setOpen] = createSignal(false)
  const [position, setPosition] = createSignal({ x: 0, y: 0 })
  return (
    <>
      <Button
        aria-expanded={open()}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect()
          setPosition({ x: bounds.left, y: bounds.bottom + 8 })
          setOpen(!open())
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
      >
        Toggle chart readout
      </Button>
      <ChartTooltip
        open={open()}
        x={position().x}
        y={position().y}
        label="January"
        items={[
          {
            name: 'revenue',
            label: 'Revenue',
            formattedValue: '$120',
            kind: 'series',
            value: 120,
            color: 'var(--chart-1)',
          },
          {
            name: 'refunds',
            label: 'Refunds',
            formattedValue: '$8',
            kind: 'series',
            value: 8,
            color: 'var(--chart-2)',
          },
          {
            name: 'orders',
            label: 'Orders',
            formattedValue: '1,840',
            kind: 'context',
            value: 1840,
          },
        ]}
      />
    </>
  )
}

const meta = {
  title: 'Charts/ChartTooltip',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

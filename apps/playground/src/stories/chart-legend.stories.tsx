import { ChartLegend } from '@newui/charts'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  const [hidden, setHidden] = createSignal<string[]>([])
  const toggle = (name: string) =>
    setHidden((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    )
  return (
    <ChartLegend
      items={[
        {
          name: 'revenue',
          label: 'Revenue',
          color: 'var(--chart-1)',
          hint: '$220K',
          hidden: hidden().includes('revenue'),
        },
        {
          name: 'refunds',
          label: 'Refunds',
          color: 'var(--chart-2)',
          hint: '$8K',
          hidden: hidden().includes('refunds'),
        },
        {
          name: 'fees',
          label: 'Fees',
          color: 'var(--chart-3)',
          hint: '$12K',
          hidden: hidden().includes('fees'),
        },
      ]}
      onToggle={toggle}
      onHighlight={() => {}}
    />
  )
}

const meta = {
  title: 'Charts/ChartLegend',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

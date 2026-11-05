import { CalendarHeatmapChart } from '@talelk/newui-charts'
import { createSignal, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * Deterministic activity for 2026: a quiet start, a busy middle, a tapering
 * end. No randomness, so the story renders the same grid every time.
 */
const YEAR = (() => {
  const days: { date: string; value: number }[] = []
  const start = Date.UTC(2026, 0, 1)
  const total = 365
  for (let i = 0; i < total; i += 1) {
    const day = new Date(start + i * 86_400_000)
    const weekend = day.getUTCDay() === 0 || day.getUTCDay() === 6
    const wave = Math.sin(i / 28) * 0.5 + 0.5
    const value = Math.round((weekend ? 1 : 6) + wave * 14 + ((i * 37) % 11))
    const key = day.toISOString().slice(0, 10)
    days.push({ date: key, value })
  }
  return days
})()

function ActivityCalendar(props: {
  loading?: boolean
  error?: string
  onSelect?: (date: string) => void
}): JSX.Element {
  return (
    <CalendarHeatmapChart
      title="Ledger activity"
      subtitle="Commits per day"
      data={YEAR}
      date="date"
      value="value"
      range={2026}
      height={200}
      loading={props.loading}
      error={props.error}
      onPointClick={
        props.onSelect ? (point) => props.onSelect?.(point.date) : undefined
      }
    />
  )
}

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  const [selected, setSelected] = createSignal<string>()
  return (
    <div class="flex flex-col gap-2">
      <ActivityCalendar onSelect={(date) => setSelected(date)} />
      <p class="text-sm text-ink-gray-7">
        {selected() ? `Selected ${selected()}` : 'Click a day to select it.'}
      </p>
    </div>
  )
}

const meta = {
  title: 'Organisms/CalendarHeatmapChart',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

export const Loading: Story = {
  render: () => <ActivityCalendar loading />,
}

export const Error: Story = {
  render: () => <ActivityCalendar error="Could not load activity." />,
}

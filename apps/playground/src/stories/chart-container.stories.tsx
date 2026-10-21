import { Button } from '@newui/atoms'
import { ChartCard, ChartContainer, ChartLegend } from '@newui/charts'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

function ActivityContainer(props: {
  loading?: boolean
  empty?: boolean
  error?: string
}) {
  return (
    <ChartCard>
      <ChartContainer
        title="Activity"
        subtitle="Sessions per day · last 30 days"
        height={240}
        loading={props.loading}
        empty={props.empty}
        error={props.error}
        legend={
          <ChartLegend
            items={[
              {
                name: 'sessions',
                label: 'Sessions',
                color: 'var(--chart-1)',
              },
            ]}
          />
        }
      >
        <p class="grid h-full place-items-center text-sm text-ink-gray-7">
          A plot drawn by the caller sits here.
        </p>
      </ChartContainer>
    </ChartCard>
  )
}

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  const [state, setState] = createSignal<
    'ready' | 'loading' | 'empty' | 'error'
  >('empty')
  return (
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap gap-2">
        <Button
          aria-pressed={state() === 'ready'}
          onClick={() => setState('ready')}
        >
          Ready
        </Button>
        <Button
          aria-pressed={state() === 'loading'}
          onClick={() => setState('loading')}
        >
          Loading
        </Button>
        <Button
          aria-pressed={state() === 'empty'}
          onClick={() => setState('empty')}
        >
          Empty
        </Button>
        <Button
          aria-pressed={state() === 'error'}
          onClick={() => setState('error')}
        >
          Error
        </Button>
      </div>
      <ActivityContainer
        loading={state() === 'loading'}
        empty={state() === 'empty'}
        error={
          state() === 'error' ? 'The activity query timed out.' : undefined
        }
      />
    </div>
  )
}

const meta = {
  title: 'Molecules/ChartContainer',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

export const Loading: Story = {
  render: () => <ActivityContainer loading />,
}

export const Empty: Story = {
  render: () => <ActivityContainer empty />,
}

export const Error: Story = {
  render: () => <ActivityContainer error="The activity query timed out." />,
}

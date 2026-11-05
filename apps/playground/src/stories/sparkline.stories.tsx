import { Sparkline } from '@talelk/newui-charts'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

const REVENUE = [12, 15, 13, 18, 17, 21, 24, 22, 27, 26, 31, 30]

function SparklineDemo(props: {
  loading?: boolean
  error?: string
  data?: (number | null | undefined)[]
}) {
  return (
    <div style={{ width: '16rem' }}>
      <Sparkline
        data={props.data ?? REVENUE}
        loading={props.loading}
        error={props.error}
      />
    </div>
  )
}

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return <SparklineDemo />
}

const meta = {
  title: 'Atoms/Sparkline',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

export const Loading: Story = {
  render: () => <SparklineDemo loading />,
}

export const Error: Story = {
  render: () => <SparklineDemo error="Could not load the trend." />,
}

export const Empty: Story = {
  render: () => <SparklineDemo data={[]} />,
}

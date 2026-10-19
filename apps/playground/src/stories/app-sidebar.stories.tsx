import { AppSidebar } from '@newui/blocks'
import { createSignal, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DemoFrame } from './demo-frame'

/** The demo body; the optional props let the Collapsed story start folded. */
function Example(props: {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}): JSX.Element {
  return (
    <DemoFrame medium>
      <AppSidebar
        title="Acme support"
        subtitle="18 members"
        showLogo={false}
        collapsed={props.collapsed}
        onCollapsedChange={props.onCollapsedChange}
        groups={[
          {
            items: [
              {
                label: 'Tickets',
                icon: 'lucide-ticket',
                count: 24,
                active: true,
              },
              { label: 'Customers', icon: 'lucide-building-2' },
            ],
          },
          {
            label: 'Knowledge',
            items: [
              { label: 'Articles', icon: 'lucide-book-open' },
              { label: 'Agents', icon: 'lucide-headset' },
            ],
          },
        ]}
      />
    </DemoFrame>
  )
}

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return <Example />
}

const meta = {
  title: 'Blocks/AppSidebar',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Collapsed: the sidebar folds to its rail before any interaction. */
export const Collapsed: Story = {
  render: () => {
    const [collapsed, setCollapsed] = createSignal(true)
    return <Example collapsed={collapsed()} onCollapsedChange={setCollapsed} />
  },
}

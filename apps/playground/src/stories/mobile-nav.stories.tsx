import { MobileNav, MobileNavItem } from '@newui/ui'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  const [active, setActive] = createSignal('Home')
  return (
    <MobileNav aria-label="Demo primary navigation">
      <MobileNavItem
        label="Home"
        icon="lucide-house"
        active={active() === 'Home'}
        onClick={() => setActive('Home')}
      />
      <MobileNavItem
        label="Reports"
        icon="lucide-chart-no-axes-combined"
        active={active() === 'Reports'}
        onClick={() => setActive('Reports')}
      />
      <MobileNavItem
        label="Settings"
        icon="lucide-settings-2"
        active={active() === 'Settings'}
        onClick={() => setActive('Settings')}
      />
    </MobileNav>
  )
}

const meta = {
  title: 'Components/Navigation/MobileNav',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

import { Dropdown, toast } from '@newui/molecules'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return (
    <Dropdown
      options={[
        { label: 'Edit workspace', value: 'edit', icon: 'lucide-pencil' },
        { label: 'Duplicate', value: 'duplicate', icon: 'lucide-copy' },
        { label: 'Delete', value: 'delete', danger: true },
      ]}
      onSelect={(value) => toast.info({ title: `Selected ${value}` })}
    >
      Workspace actions
    </Dropdown>
  )
}

const meta = {
  title: 'Molecules/Actions/Dropdown',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

import { Badge } from '@newui/atoms'
import { List, ListCell, ListRow } from '@newui/molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <List class="max-w-md">
      <ListRow>
        <ListCell>Draft</ListCell>
        <ListCell class="justify-end">
          <Badge theme="gray" label="12" />
        </ListCell>
      </ListRow>
      <ListRow>
        <ListCell>Paid</ListCell>
        <ListCell class="justify-end">
          <Badge theme="green" label="8" />
        </ListCell>
      </ListRow>
    </List>
  )
}

const meta = {
  title: 'Molecules/Display/List',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

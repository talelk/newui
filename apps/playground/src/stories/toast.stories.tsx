import { Button } from '@talelk/newui-atoms'
import { toast } from '@talelk/newui-molecules'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return (
    <div class="flex flex-wrap gap-2">
      <Button
        onClick={() => toast.success({ title: 'Changes saved locally.' })}
      >
        Success toast
      </Button>
      <Button
        onClick={() => toast.error({ title: 'Could not save. Try again.' })}
      >
        Error toast
      </Button>
      <Button
        onClick={() =>
          toast.promise(Promise.resolve('Saved'), {
            loading: { title: 'Saving…' },
            success: { title: 'Saved locally.' },
            error: { title: 'Save failed.' },
          })
        }
      >
        Promise toast
      </Button>
    </div>
  )
}

const meta = {
  title: 'Molecules/Feedback/Toast',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

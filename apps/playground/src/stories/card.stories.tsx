import { Button } from '@talelk/newui-atoms'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@talelk/newui-molecules'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  const [saved, setSaved] = createSignal(false)
  return (
    <Card class="max-w-sm">
      <CardHeader>
        <CardTitle>Monthly report</CardTitle>
        <CardDescription>A clear view of September.</CardDescription>
      </CardHeader>
      <CardContent>
        <p class="text-metric">$128,430</p>
        <p class="mt-2 text-caption text-ink-gray-7">
          Revenue grew 18.6% from $108,288 the previous month.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="solid" theme="blue" onClick={() => setSaved(true)}>
          {saved() ? 'Saved locally' : 'Save report'}
        </Button>
      </CardFooter>
    </Card>
  )
}

const meta = {
  title: 'Molecules/Display/Card',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

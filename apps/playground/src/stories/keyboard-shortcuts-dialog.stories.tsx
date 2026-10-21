import { Button } from '@newui/atoms'
import { KeyboardShortcutsDialog } from '@newui/molecules'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

function Example(props: {
  open?: boolean
  onOpenChange?: (value: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(false)
  const open = () => props.open ?? uncontrolledOpen()
  const setOpen = (value: boolean) => {
    if (props.open === undefined) setUncontrolledOpen(value)
    props.onOpenChange?.(value)
  }
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        View keyboard shortcuts
      </Button>
      <KeyboardShortcutsDialog
        open={open()}
        onOpenChange={setOpen}
        searchThreshold={0}
        shortcuts={[
          { group: 'Navigation', label: 'Open search', combo: 'Mod+K' },
          { group: 'Navigation', label: 'Go home', combo: 'G H' },
          { group: 'Editing', label: 'Save draft', combo: 'Mod+S' },
        ]}
      />
    </>
  )
}

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return <Example />
}

const meta = {
  title: 'Molecules/Actions/KeyboardShortcutsDialog',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** The dialog open on first render; Escape still dismisses it. */
export const Open: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)
    return <Example open={open()} onOpenChange={setOpen} />
  },
}

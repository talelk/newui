import { Button, KeyboardShortcutsDialog } from '@newui/ui'
import { createSignal } from 'solid-js'
export default function Demo() {
  const [open, setOpen] = createSignal(false)
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

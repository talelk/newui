import { BottomSheet, Button, Switch } from '@newui/ui'
import { createSignal, For } from 'solid-js'
export default function Demo() {
  const [open, setOpen] = createSignal(false)
  const [dismissible, setDismissible] = createSignal(true)
  return (
    <>
      <Switch
        label="Allow sheet dismissal"
        checked={dismissible()}
        onCheckedChange={setDismissible}
      />
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open preferences drawer
      </Button>
      <BottomSheet
        open={open()}
        onOpenChange={setOpen}
        title="Preferences"
        dismissible={dismissible()}
      >
        <div class="flex flex-col gap-5">
          <Switch label="Weekly digest" defaultChecked />
          <For each={Array.from({ length: 24 }, (_, index) => index + 1)}>
            {(number) => (
              <p>
                Preference guidance {number}: scroll this content without
                closing the sheet.
              </p>
            )}
          </For>
          <Button variant="solid" theme="blue" onClick={() => setOpen(false)}>
            Save preferences
          </Button>
        </div>
      </BottomSheet>
    </>
  )
}

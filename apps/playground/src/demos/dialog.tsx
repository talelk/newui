import { Dialog } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <Dialog.Root>
      <Dialog.Trigger class="rounded-4 bg-surface-gray-10 px-3 py-1.5 text-base text-ink-base">
        Open dialog
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header icon="lucide-circle-check" theme="green">
          <Dialog.Title>Confirm</Dialog.Title>
        </Dialog.Header>
        <Dialog.Description>
          Are you sure you want to continue?
        </Dialog.Description>
        <Dialog.Footer
          actions={[
            { label: 'Cancel', variant: 'subtle' },
            { label: 'Save', variant: 'solid', theme: 'blue' },
          ]}
        />
      </Dialog.Content>
    </Dialog.Root>
  )
}

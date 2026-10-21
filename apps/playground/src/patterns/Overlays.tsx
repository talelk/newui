import { Button, TextInput } from '@newui/atoms'
import { BottomSheet, Dialog } from '@newui/molecules'
import { createSignal, Show } from 'solid-js'

/** Enterprise overlay examples using the existing Dialog and BottomSheet APIs. */
export default function Overlays() {
  const [confirmOpen, setConfirmOpen] = createSignal(false)
  const [editOpen, setEditOpen] = createSignal(false)
  const [sheetOpen, setSheetOpen] = createSignal(false)
  const [name, setName] = createSignal('Acme workspace')
  const [saved, setSaved] = createSignal('')

  const save = () => {
    setSaved(name().trim())
    setEditOpen(false)
    setSheetOpen(false)
  }

  return (
    <div class="flex max-w-3xl flex-col gap-section-gap">
      <section class="flex flex-col gap-control-gap">
        <h2 class="text-section">Choose the overlay for the task</h2>
        <p class="text-caption text-ink-gray-7">
          Confirm a destructive action in a dialog, edit a record in a form
          dialog, or use a bottom sheet for a short mobile-first task.
        </p>
        <div class="flex flex-wrap gap-control-gap">
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            Confirm removal
          </Button>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Edit workspace
          </Button>
          <Button variant="outline" onClick={() => setSheetOpen(true)}>
            Edit in a sheet
          </Button>
        </div>
        <Show when={saved()}>
          <p role="status" class="text-caption text-ink-gray-7">
            Saved {saved()} locally.
          </p>
        </Show>
      </section>

      <Dialog.Root open={confirmOpen()} onOpenChange={setConfirmOpen}>
        <Dialog.Content size="sm">
          <Dialog.Header>
            <Dialog.Title>Remove workspace?</Dialog.Title>
            <Dialog.Description>
              This local demo keeps the workspace, but shows the confirmation
              pattern before a destructive action.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer
            actions={[
              { label: 'Cancel', variant: 'outline' },
              {
                label: 'Remove workspace',
                variant: 'solid',
                theme: 'red',
                onClick: ({ close }) => {
                  setSaved('removal confirmed locally')
                  close()
                },
              },
            ]}
          />
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={editOpen()} onOpenChange={setEditOpen}>
        <Dialog.Content size="md">
          <Dialog.Header>
            <Dialog.Title>Edit workspace</Dialog.Title>
            <Dialog.Description>
              A bounded form task with a clear cancel and save action.
            </Dialog.Description>
          </Dialog.Header>
          <form
            class="flex flex-col gap-field-gap"
            onSubmit={(event) => {
              event.preventDefault()
              save()
            }}
          >
            <TextInput
              label="Workspace name"
              required
              value={name()}
              onInput={(event) => setName(event.currentTarget.value)}
            />
            <Dialog.Footer
              actions={[
                { label: 'Cancel', variant: 'outline' },
                {
                  label: 'Save changes',
                  variant: 'solid',
                  theme: 'blue',
                  onClick: ({ close }) => {
                    setSaved(name().trim())
                    close()
                  },
                },
              ]}
            />
          </form>
        </Dialog.Content>
      </Dialog.Root>

      <BottomSheet
        open={sheetOpen()}
        onOpenChange={setSheetOpen}
        title="Edit workspace"
      >
        <form
          class="flex flex-col gap-field-gap"
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
        >
          <TextInput
            label="Workspace name"
            required
            value={name()}
            onInput={(event) => setName(event.currentTarget.value)}
          />
          <div class="flex justify-end gap-control-gap">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="solid" theme="blue">
              Save changes
            </Button>
          </div>
        </form>
      </BottomSheet>
    </div>
  )
}

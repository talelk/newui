import { Button } from '@newui/atoms'
import { Dialog } from '@newui/molecules'
import { createSignal, type JSX } from 'solid-js'

/**
 * The create-form dialog shell every example was repeating (H16,
 * spec/history/examples-refresh.md §1): Dialog chrome, the `noValidate` form, the
 * attempted-submit signal that gates field errors, and the
 * Cancel / solid-submit footer. Fields and the mutation stay local to
 * each page — only the scaffold is shared.
 *
 * `fields` receives `attempted()` so errors render exactly as they did
 * with a page-local signal. Attempted resets whenever the dialog opens.
 * The page's `onSubmit` runs after attempted flips true: validate, and
 * return early to stay open, or mutate and close via `onOpenChange`.
 */
export function CreateDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitLabel: string
  onSubmit: () => void
  /** Footer secondary action. Defaults to Cancel, which closes. */
  secondaryLabel?: string
  onSecondary?: () => void
  fields: (attempted: () => boolean) => JSX.Element
}): JSX.Element {
  const [attempted, setAttempted] = createSignal(false)
  const handleOpenChange = (open: boolean) => {
    if (open) setAttempted(false)
    props.onOpenChange(open)
  }
  return (
    <Dialog.Root open={props.open} onOpenChange={handleOpenChange}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>{props.title}</Dialog.Title>
          <Dialog.Description>{props.description}</Dialog.Description>
        </Dialog.Header>
        <form
          noValidate
          class="mt-5 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            setAttempted(true)
            props.onSubmit()
          }}
        >
          {props.fields(attempted)}
          <Dialog.Footer>
            <Button
              variant="outline"
              onClick={() => {
                // A custom secondary is a save-style action (Mail's draft):
                // it validates like a submit, so errors must show.
                if (props.onSecondary) {
                  setAttempted(true)
                  props.onSecondary()
                } else props.onOpenChange(false)
              }}
            >
              {props.secondaryLabel ?? 'Cancel'}
            </Button>
            <Button type="submit" variant="solid" theme="blue">
              {props.submitLabel}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

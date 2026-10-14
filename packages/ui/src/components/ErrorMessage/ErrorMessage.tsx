import { type JSX, Show, splitProps } from 'solid-js'
import { type ErrorMessageValue, errorLines } from '../../lib/error'
import { cn } from '../../lib/tv'

export interface ErrorMessageProps {
  /** A string, a list of strings, or an `Error` whose messages stack. */
  message?: ErrorMessageValue
  /** id, so a control can point `aria-describedby` / `aria-errormessage` at it. */
  id?: string
  class?: string
}

/**
 * A standalone error region: normalises `message` to lines and renders them
 * `role="alert"`, one per line. Renders nothing when there is no error, so it
 * doubles as the "no error" test.
 *
 * Ported from frappe-ui's `ErrorMessage`, minus its `v-html`: this library
 * renders the message as text (P10 — no HTML injection), so an `<b>` in a
 * server message shows literally rather than being sanitised.
 */
export function ErrorMessage(props: ErrorMessageProps): JSX.Element {
  const [local] = splitProps(props, ['message', 'id', 'class'])
  const lines = () => errorLines(local.message)

  return (
    <Show when={lines().length}>
      <div
        id={local.id}
        data-slot="error"
        role="alert"
        class={cn('whitespace-pre-line text-p-sm text-ink-red-7', local.class)}
      >
        {lines().join('\n')}
      </div>
    </Show>
  )
}

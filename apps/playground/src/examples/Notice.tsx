import { Button } from '@newui/ui'
import { type JSX, Show } from 'solid-js'

/**
 * The examples' one status strip (H1, spec/examples-refresh.md §1).
 *
 * Eleven pages kept a `notice` signal and hand-rendered the same bordered
 * `role="status"` box, three of them with an Undo button bolted on. This
 * renders nothing while `text` is empty, so a page drops it where its
 * `<Show>` used to be. The red tone speaks as an alert; the rest are
 * polite status.
 */

export type NoticeTone = 'blue' | 'green' | 'red'

const TONES: Record<NoticeTone, string> = {
  blue: 'border-outline-blue-1 bg-surface-blue-1 text-ink-blue-8',
  green: 'border-outline-green-3 bg-surface-green-1 text-ink-green-8',
  red: 'border-outline-red-3 bg-surface-red-1 text-ink-red-8',
}

export function Notice(props: {
  /** The message; empty (the common initial state) renders nothing. */
  text?: string
  tone?: NoticeTone
  /** Shows the undo action; pairs with `createUndo` in `./undo`. */
  onUndo?: () => void
  undoLabel?: string
  onDismiss?: () => void
}): JSX.Element {
  const tone = () => props.tone ?? 'blue'
  return (
    <Show when={props.text}>
      <div
        role={tone() === 'red' ? 'alert' : 'status'}
        class={`flex flex-wrap items-center justify-between gap-3 rounded-3 border p-3 ${TONES[tone()]}`}
      >
        <span>{props.text}</span>
        <Show when={props.onUndo || props.onDismiss}>
          <span class="flex flex-wrap items-center gap-2">
            <Show when={props.onUndo}>
              <Button size="sm" onClick={() => props.onUndo?.()}>
                {props.undoLabel ?? 'Undo'}
              </Button>
            </Show>
            <Show when={props.onDismiss}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => props.onDismiss?.()}
              >
                Dismiss
              </Button>
            </Show>
          </span>
        </Show>
      </div>
    </Show>
  )
}

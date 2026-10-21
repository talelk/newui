import * as zag from '@zag-js/dialog'
import {
  type Accessor,
  createSignal,
  For,
  type JSX,
  type Setter,
  Show,
} from 'solid-js'
import { createDisclosure } from '../disclosure'
import { createId } from '../id'
import { Portal } from '../portal'
import { cn } from '../tv'
import { createZagApi } from '../zag'
import { createRequestStore } from './store'

type DialogApi = ReturnType<typeof zag.connect>

/** Options shared by every imperative dialog helper. */
export interface DialogOptions {
  /** Heading rendered at the top of the dialog. */
  title?: string
  /** Body copy. */
  message?: string
  /** Alias of `message`; ignored when `message` is set. */
  description?: string
  /** Confirm button label. Default `"Confirm"` (`"Delete"` for `danger`). */
  confirmText?: string
  /** Cancel button label. Default `"Cancel"`. */
  cancelText?: string
  /** Colour the confirm action as destructive. `dialog.danger` forces this. */
  danger?: boolean
  /** Allow Escape / outside-click to dismiss. Default `true`. */
  dismissible?: boolean
}

/** Options for `dialog.prompt`. */
export interface PromptOptions extends DialogOptions {
  /** Placeholder for the text input. */
  placeholder?: string
  /** Initial text in the input. */
  defaultValue?: string
}

/**
 * What an imperative helper returns: the synchronous `close` handle P9 asks
 * for, on a promise that resolves with the user's answer. Await it for the
 * result, or call `close()` to dismiss early.
 */
export type DialogHandle<T> = Promise<T> & { close: () => void }

/** Which helper mounted the dialog — decides the resolved value's type. */
export type DialogKind = 'confirm' | 'prompt'

/**
 * A mounted dialog. Created by a helper, rendered by `DialogHost`. The state
 * lives here (not in the component) so `close()` can drive it from outside the
 * tree and the machine survives re-renders.
 */
export interface DialogRequest {
  id: string
  kind: DialogKind
  options: PromptOptions
  open: Accessor<boolean>
  setOpen: Setter<boolean>
  value: Accessor<string>
  setValue: Setter<string>
  confirm: () => void
  cancel: () => void
}

/**
 * Button chrome. Duplicated from `Button`'s recipe rather than imported:
 * `lib/` sits below `components/` (dependency-cruiser enforces it), and a
 * modal helper cannot reach up for a component. Only the three looks the
 * helper needs are transcribed.
 */
const BUTTON =
  'inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-4 px-2.5 text-base-medium transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60'

const BUTTON_CONFIRM =
  'bg-surface-gray-10 text-ink-base hover:bg-surface-gray-9 active:bg-surface-gray-8 focus-visible:focus-ring'

const BUTTON_DANGER =
  'bg-surface-red-8 text-ink-base hover:bg-surface-red-9 active:bg-surface-red-9 focus-visible:focus-ring-red'

const BUTTON_CANCEL =
  'border border-outline-gray-2 bg-surface-base text-ink-gray-8 hover:border-outline-gray-3 active:border-outline-gray-3 active:bg-surface-gray-4 focus-visible:focus-ring'

/**
 * The imperative dialog stack. Module-level, like the toaster store, because
 * `dialog.confirm` runs outside any component and must survive until
 * `DialogHost` mounts (or re-mounts).
 */
const store = createRequestStore<DialogRequest>()

/** Test seam: drop every pending request without resolving it. */
export function resetDialogRequests(): void {
  store.reset()
}

/**
 * Mount one request and return its handle.
 *
 * The state (open + value signals, resolution) is created here, outside any
 * component, so the returned promise resolves even if the host unmounts and
 * remounts. `resolveOnConfirm` reads the prompt's typed value; `resolveOnCancel`
 * is the fallback answer.
 */
function mount<T>(
  kind: DialogKind,
  options: PromptOptions,
  resolveOnConfirm: (value: string) => T,
  resolveOnCancel: T,
): DialogHandle<T> {
  const [open, setOpen] = createSignal(true)
  const [value, setValue] = createSignal(options.defaultValue ?? '')
  const id = createId('dialog')

  let settled = false
  let resolve: (outcome: T) => void = () => {}
  const promise = new Promise<T>((res) => {
    resolve = res
  })

  const finish = (outcome: T) => {
    if (settled) return
    settled = true
    setOpen(false)
    resolve(outcome)
    // Unmount on a microtask so a machine-driven close (Escape / outside
    // click) finishes its own transition before the component is disposed.
    queueMicrotask(() => store.remove(id))
  }

  const request: DialogRequest = {
    id,
    kind,
    options,
    open,
    setOpen,
    value,
    setValue,
    confirm: () => finish(resolveOnConfirm(value())),
    cancel: () => finish(resolveOnCancel),
  }

  store.add(request)
  return Object.assign(promise, { close: () => request.cancel() })
}

/** A modal confirm. Resolves `true` on confirm, `false` on cancel/dismiss. */
function confirm(options: DialogOptions = {}): DialogHandle<boolean> {
  return mount('confirm', options, () => true, false)
}

/** `confirm` preset for destructive actions: red confirm, `"Delete"` label. */
function danger(options: DialogOptions = {}): DialogHandle<boolean> {
  return mount('confirm', { ...options, danger: true }, () => true, false)
}

/** A modal single-field prompt. Resolves the text, or `null` on cancel. */
function prompt(options: PromptOptions = {}): DialogHandle<string | null> {
  return mount('prompt', options, (value) => value, null)
}

/**
 * The namespaced imperative API (P9). Mount `<DialogHost />` once, near the app
 * root, for these to render.
 */
export const dialog = { confirm, danger, prompt }

/** One imperative dialog, driven by Zag's `dialog` machine directly. */
function ImperativeDialog(props: { request: DialogRequest }): JSX.Element {
  const options = () => props.request.options

  const [open, setOpen] = createDisclosure({
    value: () => props.request.open(),
    onChange: (next) => {
      if (!next) props.request.cancel()
    },
  })

  let inputEl: HTMLInputElement | undefined

  const { api } = createZagApi<DialogApi>(zag.machine, zag.connect, () => ({
    id: createId('dialog'),
    role: 'dialog',
    modal: true,
    open: open(),
    closeOnEscape: options().dismissible ?? true,
    closeOnInteractOutside: options().dismissible ?? true,
    'aria-label': options().title ? undefined : 'Dialog',
    initialFocusEl:
      props.request.kind === 'prompt' ? () => inputEl ?? false : undefined,
    onOpenChange: (details: { open: boolean }) => setOpen(details.open),
  }))

  return (
    <Show when={api().open}>
      <Portal>
        <div
          {...api().getBackdropProps()}
          data-slot="dialog-backdrop"
          class="fixed inset-0 z-50 bg-black-overlay-200 dark:bg-black-overlay-700"
        />
        <div
          {...api().getPositionerProps()}
          data-slot="dialog-positioner"
          class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
        >
          <div
            {...api().getContentProps()}
            data-slot="dialog-content"
            class="relative z-50 w-full max-w-md rounded-7 bg-surface-elevation-1 p-4 text-ink-gray-9 shadow-xl focus-visible:outline-none"
          >
            <Show when={options().title}>
              <h2
                {...api().getTitleProps()}
                data-slot="dialog-title"
                class="text-lg-medium text-ink-gray-9"
              >
                {options().title}
              </h2>
            </Show>

            <Show when={options().message ?? options().description}>
              <p
                {...api().getDescriptionProps()}
                data-slot="dialog-description"
                class={cn(
                  'text-base text-ink-gray-6',
                  options().title && 'mt-1',
                )}
              >
                {options().message ?? options().description}
              </p>
            </Show>

            <Show when={props.request.kind === 'prompt'}>
              <input
                ref={(el) => {
                  inputEl = el
                }}
                value={props.request.value()}
                onInput={(event) =>
                  props.request.setValue(event.currentTarget.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') props.request.confirm()
                }}
                placeholder={options().placeholder}
                aria-label="Value"
                data-slot="dialog-input"
                class="mt-3 w-full rounded-4 border border-outline-gray-2 bg-surface-base px-2.5 py-2 text-base text-ink-gray-9 focus-visible:focus-ring"
              />
            </Show>

            <footer
              data-slot="dialog-footer"
              class="mt-4 flex justify-end gap-2"
            >
              <button
                type="button"
                data-slot="dialog-cancel"
                class={cn(BUTTON, BUTTON_CANCEL)}
                onClick={() => props.request.cancel()}
              >
                {options().cancelText ?? 'Cancel'}
              </button>
              <button
                type="button"
                data-slot="dialog-confirm"
                class={cn(
                  BUTTON,
                  options().danger ? BUTTON_DANGER : BUTTON_CONFIRM,
                )}
                onClick={() => props.request.confirm()}
              >
                {options().confirmText ??
                  (options().danger ? 'Delete' : 'Confirm')}
              </button>
            </footer>
          </div>
        </div>
      </Portal>
    </Show>
  )
}

/** Mounts the imperative `dialog.*` stack. Mount once, near the app root. */
export function DialogHost(): JSX.Element {
  return (
    <For each={store.requests()}>
      {(request) => <ImperativeDialog request={request} />}
    </For>
  )
}

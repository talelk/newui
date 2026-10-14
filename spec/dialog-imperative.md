# Imperative dialogs (`dialog.*`)

`dialog.confirm`, `dialog.danger` and `dialog.prompt` — the namespaced
imperative helpers (P9). Each mounts a modal dialog, returns a synchronous
`{ close }` handle, and resolves a promise with the user's answer. Mount
`<DialogHost />` once, near the app root, for the stack to render.

The host is built on Zag's `dialog` machine directly (`lib/` sits below
`components/`, so it cannot reuse the `Dialog` compound). Keyboard, focus trap
and ARIA come from the primitive, exactly as in `Dialog`.

## API

```ts
const answer = dialog.confirm({ title: 'Delete file?' }) // Promise<boolean>
const { close } = dialog.confirm({ title: '…' })          // handle is a promise too

if (await answer) { /* confirmed */ }
```

`dialog.confirm` / `dialog.danger` resolve `true` on confirm and `false` on
cancel, dismiss (Escape / outside-click) or `close()`. `dialog.prompt` resolves
the typed string on confirm and `null` on cancel / dismiss / `close()`.

| helper | signature |
| --- | --- |
| `dialog.confirm` | `(options?: DialogOptions) => DialogHandle<boolean>` |
| `dialog.danger` | `(options?: DialogOptions) => DialogHandle<boolean>` |
| `dialog.prompt` | `(options?: PromptOptions) => DialogHandle<string \| null>` |

### Options

| prop | type | default | notes |
| --- | --- | --- | --- |
| `title` | `string` | — | heading; also the dialog's accessible name |
| `message` | `string` | — | body copy |
| `description` | `string` | — | alias of `message`; ignored when `message` is set |
| `confirmText` | `string` | `"Confirm"` (`"Delete"` for `danger`) | confirm button label |
| `cancelText` | `string` | `"Cancel"` | cancel button label |
| `danger` | `boolean` | `false` | colour the confirm action as destructive |
| `dismissible` | `boolean` | `true` | allow Escape / outside-click to dismiss |
| `placeholder` | `string` | — | `prompt` only — input placeholder |
| `defaultValue` | `string` | `""` | `prompt` only — initial input text |

### Return

`DialogHandle<T>` is a `Promise<T>` with a synchronous `close: () => void`
attached. Await it for the answer; call `close()` to dismiss early (resolves the
cancel value).

## Behavior

- **Stacking.** Each call appends a request to a module-level store; `DialogHost`
  renders the stack in order. Requests survive a host unmount/remount, so a
  helper called before the host mounts still resolves.
- **Resolution is once.** Confirm, cancel, dismiss and `close()` all funnel
  through one settle; the first wins. The request is removed on a microtask
  after settling, so a machine-driven close finishes its transition first.
- **Prompt input.** `Enter` submits, the input takes initial focus, and the
  typed value is read from a signal (no `v-model`).
- **Danger preset.** `dialog.danger` forces `danger: true`, the red confirm
  look, and the `"Delete"` label default. Everything else matches `confirm`.

## Accessibility

Zag supplies `role="dialog"`, `aria-modal`, the focus trap and focus
restoration. The title is wired with `aria-labelledby`; when no title is given,
the content falls back to `aria-label="Dialog"`. The prompt input is labelled
`aria-label="Value"`.

## Styling hooks

`data-slot` — `dialog-backdrop`, `dialog-positioner`, `dialog-content`,
`dialog-title`, `dialog-description`, `dialog-input`, `dialog-footer`,
`dialog-cancel`, `dialog-confirm`. Zag adds `data-state`
(`open`/`closed`). Colors are semantic tokens only; the confirm/cancel buttons
transcribe the relevant `Button` recipe looks because `lib/` cannot import the
component.

## Mounting

```tsx
<UIProvider>
  <App />
  <DialogHost />
</UIProvider>
```

The portal target is the `UIProvider` `portalTarget` when present, else
`document.body` (via `lib/portal`).

/**
 * Show a modal `<dialog>` without depending on the engine having implemented it.
 *
 * Where `showModal` is missing the `open` attribute is set instead: the drawer is
 * still rendered and closable, it just loses the *modal* behaviour (top layer,
 * inert background, focus trap) rather than throwing. Modern engines all have
 * it; jsdom does not.
 */
export function showDialog(dialog: HTMLDialogElement | undefined) {
  if (!dialog) return
  if (typeof dialog.showModal === 'function') dialog.showModal()
  else dialog.setAttribute('open', '')
}

export function closeDialog(dialog: HTMLDialogElement | undefined) {
  if (!dialog) return
  if (typeof dialog.close === 'function') dialog.close()
  else dialog.removeAttribute('open')
}

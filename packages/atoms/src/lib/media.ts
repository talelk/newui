import { type Accessor, createSignal, onCleanup } from 'solid-js'

/**
 * A live media query.
 *
 * It starts from the query's *current* answer rather than from `false`, and it
 * falls back to `false` where `matchMedia` does not exist (SSR, a test in jsdom
 * without the polyfill) — so a component that lays itself out from this never
 * flashes the wrong frame on its first paint.
 */
export function createMediaQuery(query: string): Accessor<boolean> {
  const supported =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  const media = supported ? window.matchMedia(query) : undefined
  const [matches, setMatches] = createSignal(media?.matches ?? false)
  if (media) {
    const onChange = () => setMatches(media.matches)
    media.addEventListener('change', onChange)
    onCleanup(() => media.removeEventListener('change', onChange))
  }
  return matches
}

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

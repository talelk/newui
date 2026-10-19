import type { JSX } from 'solid-js'

/**
 * The one Suspense fallback (H8, spec/examples-refresh.md §1).
 *
 * Seven `<p>Loading…</p>` copies disagreed on wording and shade. A page
 * passes its own noun (`Loading props…`); the treatment is shared.
 */
export function LoadingNote(props: { label?: string }): JSX.Element {
  return <p class="text-base text-ink-gray-7">{props.label ?? 'Loading…'}</p>
}

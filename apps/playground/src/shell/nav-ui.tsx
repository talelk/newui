import type { JSX } from 'solid-js'

/**
 * Shared navigation chrome for the shell (H12, spec/history/examples-refresh.md §1).
 *
 * The nav-row class was spelled out five times across the masthead and the
 * two sidebars, and the filter field twice. Both live here once. Plain
 * markup and string constants only — this file sits beside `SidebarNav` in
 * the shell, so it must never import a component (`routes.test.ts` pins
 * that rule for this file too).
 */

/**
 * One navigation row: 32px, icon-then-label room, quiet until hovered or
 * current. Both `aria-current` spellings are covered — the masthead marks
 * a section `true`, the sidebars mark a page `page`.
 */
export const NAV_ROW =
  'flex h-8 items-center gap-2 rounded-3 px-2 text-interface text-ink-gray-7 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring motion-reduce:transition-none aria-[current=page]:bg-surface-gray-2 aria-[current=page]:text-ink-gray-9 aria-[current=true]:bg-surface-gray-2 aria-[current=true]:text-ink-gray-9'

/** The sidebar filter field: a labelled search input with a glyph. */
export function FilterInput(props: {
  label: string
  placeholder: string
  value: string
  onInput: (value: string) => void
}): JSX.Element {
  return (
    <label class="relative flex items-center">
      <span class="sr-only">{props.label}</span>
      <span
        aria-hidden="true"
        class="lucide-search pointer-events-none absolute start-2.5 size-4 text-ink-gray-7"
      />
      <input
        type="search"
        value={props.value}
        onInput={(event) => props.onInput(event.currentTarget.value)}
        placeholder={props.placeholder}
        class="h-8 w-full rounded-4 border border-outline-gray-2 bg-surface-base ps-8 pe-2 text-base text-ink-gray-8 placeholder:text-ink-gray-7 focus-visible:focus-ring"
      />
    </label>
  )
}

/** The shared empty-filter line. */
export function NothingMatches(props: { query: string }): JSX.Element {
  return (
    <p class="px-2 py-1 text-sm text-ink-gray-7">
      Nothing matches “{props.query}”.
    </p>
  )
}

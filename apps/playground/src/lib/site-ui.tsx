import type { JSX } from 'solid-js'

/**
 * Shared site chrome strings and plain-markup patterns.
 *
 * One home for the navigation row, the filter field, the segmented switch,
 * the square icon button and the inline-code chip, so height, radius role,
 * focus ring and motion change in one edit. Plain markup and string
 * constants only — the shell imports these strings and must never grow a
 * component import (`routes.test.ts` pins that rule).
 */

/**
 * One navigation row: 32px, icon-then-label room, quiet until hovered or
 * current. Both `aria-current` spellings are covered — the masthead marks
 * a section `true`, the sidebars mark a page `page`.
 */
const NAV_BASE =
  'flex h-7 items-center gap-2 px-2 text-interface text-ink-gray-7 transition-colors duration-base ease-standard hover:text-ink-gray-9 focus-visible:focus-ring motion-reduce:transition-none'

/**
 * A navigation row on the Mist frame (masthead, sidebar, drawer). The current
 * destination is a piece of sheet lifted out of the frame — the same white the
 * content sits on, as in the application sidebar.
 */
export const NAV_ROW = `${NAV_BASE} rounded-control hover:bg-surface-gray-3 aria-[current=page]:bg-surface-elevation-1 aria-[current=page]:text-ink-gray-9 aria-[current=page]:shadow-sm aria-[current=true]:bg-surface-elevation-1 aria-[current=true]:text-ink-gray-9 aria-[current=true]:shadow-sm`

/**
 * A navigation row on a sheet (the "On this page" index). White on white
 * cannot mark a place, so the current entry carries the Petrol leading rule.
 */
export const NAV_ROW_ON_SHEET = `${NAV_BASE} border-s-2 border-transparent hover:bg-surface-gray-1 aria-[current=true]:border-outline-blue-6 aria-[current=true]:text-ink-gray-9`

/** The tray a segmented switch sits in (colour scheme, preview width). */
export const SEGMENTED =
  'm-0 flex w-fit shrink-0 items-center gap-0.5 rounded-control border-0 bg-surface-gray-3 p-0.5'

/** One segment of a segmented switch: pressed reads as raised. */
export const SEGMENTED_BTN =
  'grid size-10 place-items-center rounded-control text-ink-gray-6 transition-colors duration-base ease-standard hover:text-ink-gray-9 aria-pressed:bg-surface-base aria-pressed:text-ink-gray-9 aria-pressed:shadow-sm focus-visible:focus-ring motion-reduce:transition-none sm:size-7'

/** One square icon button in shell chrome (masthead, rails, toolbars). */
export const ICON_BTN =
  'grid size-8 place-items-center rounded-control text-ink-gray-6 transition-colors duration-base ease-standard hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring motion-reduce:transition-none'

/** The inline-code chip used by long-form pages and rendered markdown. */
export const INLINE_CODE =
  'rounded-control bg-surface-gray-2 px-1 py-px font-mono text-sm text-ink-gray-8'

export function InlineCode(props: { children: JSX.Element }): JSX.Element {
  return <code class={INLINE_CODE}>{props.children}</code>
}

/** The sidebar filter field: a labelled search input with a glyph. */
export function FilterInput(props: {
  label: string
  placeholder: string
  value: string
  onInput: (value: string) => void
  class?: string
}): JSX.Element {
  return (
    <label class={`relative flex items-center ${props.class ?? ''}`}>
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
        class="h-8 w-full rounded-card border border-outline-gray-2 bg-surface-base ps-8 pe-2 text-base text-ink-gray-8 placeholder:text-ink-gray-7 focus-visible:focus-ring"
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

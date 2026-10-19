import { card } from '@newui/ui'
import { type JSX, Show } from 'solid-js'

/**
 * The examples' titled surface (H6, spec/examples-refresh.md §1).
 *
 * `rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3` was
 * spelled out on twenty-odd sections. That is the library `Card`'s own
 * recipe, so Panel renders a `<section>` with `card()` — a section because
 * the pages label these regions (`aria-label` / `aria-labelledby`), which
 * `Card`'s plain `<div>` cannot carry. Playground-only: this is page
 * scaffolding, not a library API.
 */
export function Panel(props: {
  title?: string
  /** Set with `title` when something else must point at the heading. */
  titleId?: string
  /** Heading-row actions (a tab switch, a button), end-aligned. */
  actions?: JSX.Element
  label?: string
  labelledBy?: string
  /** Placement in the page's own grid (e.g. `xl:col-span-2`). */
  class?: string
  children: JSX.Element
}): JSX.Element {
  return (
    <section
      aria-label={props.label}
      aria-labelledby={props.labelledBy}
      class={`${card()} min-w-0 gap-4 ${props.class ?? ''}`}
    >
      <Show when={props.title || props.actions}>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <Show when={props.title}>
            <h2 id={props.titleId} class="text-section text-ink-gray-9">
              {props.title}
            </h2>
          </Show>
          {props.actions}
        </div>
      </Show>
      {props.children}
    </section>
  )
}

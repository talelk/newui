import { type JSX, Show } from 'solid-js'

/**
 * A titled, anchored page section (H9, spec/examples-refresh.md §1).
 *
 * Docs, Foundations and Settings each defined this component locally, and
 * the reference page repeated the markup four times. The `id` is required
 * because these headings are the anchor source for the "On this page"
 * column (`TableOfContents`); `scroll-mt-16` keeps a jumped-to heading
 * clear of the sticky masthead.
 */
export function PageSection(props: {
  id: string
  title: string
  description?: string
  /** Baseline-aligned beside the title (the reference page's spec link). */
  actions?: JSX.Element
  children: JSX.Element
}): JSX.Element {
  return (
    <section id={props.id} class="flex scroll-mt-16 flex-col gap-3">
      <div class="flex flex-wrap items-baseline gap-2">
        <h2 class="text-section text-ink-gray-9">{props.title}</h2>
        {props.actions}
      </div>
      <Show when={props.description}>
        <p class="text-base text-ink-gray-7">{props.description}</p>
      </Show>
      {props.children}
    </section>
  )
}

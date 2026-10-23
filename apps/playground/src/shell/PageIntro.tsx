import { type JSX, Show } from 'solid-js'

/**
 * The masthead of a page: one `h1`, one line of intent.
 *
 * Every page opens with this so the document has exactly one top-level heading
 * (the sidebar's section titles are `h2`, its links are not headings at all) and
 * so a reader arriving from a search result knows what they landed on.
 */
export function PageIntro(props: {
  title: string
  description?: string
  /** Rendered on the trailing edge of the title row — counts, switches, filters. */
  actions?: JSX.Element
  class?: string
}): JSX.Element {
  return (
    <header
      class={`mb-4 flex flex-wrap items-end justify-between gap-4 ${props.class ?? ''}`}
    >
      <div class="flex min-w-0 flex-col gap-1">
        <h1 class="break-words [overflow-wrap:anywhere] text-heading text-ink-gray-9">
          {props.title}
        </h1>
        <Show when={props.description}>
          <p class="max-w-[30rem] text-base text-ink-gray-7">
            {props.description}
          </p>
        </Show>
      </div>
      <Show when={props.actions}>{props.actions}</Show>
    </header>
  )
}

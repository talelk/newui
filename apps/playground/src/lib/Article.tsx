import type { JSX } from 'solid-js'

/**
 * The one long-form page frame: a vertical stack on the shared rhythm.
 * Docs, foundations, architecture, kit and changelog pages open with this
 * so measure and section spacing cannot drift per page.
 */
export function Article(props: { children: JSX.Element }): JSX.Element {
  return <div class="flex flex-col gap-8">{props.children}</div>
}

import { A } from '@solidjs/router'
import type { JSX } from 'solid-js'

/**
 * The one exit every demo application shares: a quiet footer link back to the
 * pages gallery, so leaving a fullscreen demo never depends on browser Back.
 */
export function BackToExamples(): JSX.Element {
  return (
    <footer class="border-t border-outline-gray-1 p-3">
      <A
        href="/pages"
        class="flex w-fit items-center gap-1.5 rounded-3 px-1 py-1 text-caption text-ink-gray-7 hover:text-ink-gray-9 focus-visible:focus-ring"
      >
        <span aria-hidden="true" class="lucide-arrow-left size-3.5" />
        Back to examples
      </A>
    </footer>
  )
}

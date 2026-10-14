import { Show } from 'solid-js'
import { DEMOS } from '../demos'

/**
 * One component's live demo, on its own route: `/play?c=Button`. The generated
 * docs embed this in an iframe so every component page has a real, styled
 * preview. Unknown names render a message rather than throwing.
 */
export function Play() {
  const name = new URLSearchParams(window.location.search).get('c') ?? ''
  const demo = DEMOS[name]

  return (
    <div class="min-h-screen bg-surface-base p-8 text-ink-gray-9">
      <Show
        when={demo}
        fallback={
          <p class="text-base text-ink-gray-6">
            No demo registered for “{name}”.
          </p>
        }
      >
        {demo?.()}
      </Show>
    </div>
  )
}

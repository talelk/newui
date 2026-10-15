import { createMemo, lazy, Show, Suspense } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { DEMOS } from '../demos'

/**
 * One component's live demo, on its own route: `/play?c=Button`.
 *
 * The reference pages embed this route (and it is the unit the screenshot script
 * drives), so a demo is written once — in `demos/<name>.tsx` — and both surfaces
 * render it. The demo module is lazily imported, so this route fetches the one
 * demo it was asked for rather than all of them.
 *
 * Unknown names render a message rather than throwing.
 */
export function Play() {
  const name = new URLSearchParams(window.location.search).get('c') ?? ''

  // Wrapped in an object rather than passed as the value: a component *is* a
  // function, and `<Show when={fn}>` would be ambiguous.
  const demo = createMemo(() => {
    const load = DEMOS[name]
    return load ? { Component: lazy(load) } : undefined
  })

  return (
    <main
      aria-label="Component demo"
      class="min-h-screen bg-surface-base p-8 text-ink-gray-9"
    >
      <Show
        when={demo()}
        fallback={
          <p class="text-base text-ink-gray-6">
            No demo registered for “{name}”.
          </p>
        }
      >
        {(entry) => (
          <Suspense
            fallback={<p class="text-base text-ink-gray-6">Loading demo…</p>}
          >
            <Dynamic component={entry().Component} />
          </Suspense>
        )}
      </Show>
    </main>
  )
}

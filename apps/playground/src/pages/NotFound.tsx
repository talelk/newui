import { A } from '@solidjs/router'
import type { JSX } from 'solid-js'

/** The catch-all. Names the URL, because a typo is the usual cause. */
export function NotFound(): JSX.Element {
  return (
    <div class="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-4 px-6">
      <p class="text-sm text-ink-gray-5">404</p>
      <h1 class="text-2xl-semibold text-ink-gray-9">There is no page here.</h1>
      <p class="text-base text-ink-gray-6">
        No route matches{' '}
        <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
          {window.location.pathname}
        </code>
        . The sidebar lists everything that exists.
      </p>
      <div class="flex gap-3">
        <A
          href="/"
          class="inline-flex h-8 items-center rounded-4 bg-surface-gray-10 px-3 text-base-medium text-ink-base transition-colors hover:bg-surface-gray-9 focus-visible:focus-ring"
        >
          Home
        </A>
        <A
          href="/components/atoms"
          class="inline-flex h-8 items-center rounded-4 border border-outline-gray-2 px-3 text-base text-ink-gray-8 transition-colors hover:bg-surface-gray-2 focus-visible:focus-ring"
        >
          Components
        </A>
      </div>
    </div>
  )
}

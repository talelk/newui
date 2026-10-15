import { A, useParams } from '@solidjs/router'
import { For, lazy, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { PATTERNS, REFERENCE_EXAMPLES } from '../lib/reference-examples'
import { PageIntro } from '../shell/PageIntro'

const modules = {
  carousel: lazy(() => import('../patterns/Carousel')),
  command: lazy(() => import('../patterns/Command')),
  layout: lazy(() => import('../patterns/Layout')),
  navigation: lazy(() => import('../patterns/Navigation')),
  verification: lazy(() => import('../patterns/Verification')),
  'analytics-widgets': lazy(() => import('../patterns/AnalyticsWidgets')),
}

export function Patterns() {
  const params = useParams()
  const pattern = () => PATTERNS.find((item) => item.slug === params['name'])
  const Content = () => (
    <Dynamic component={modules[pattern()?.slug ?? 'carousel']} />
  )
  return (
    <div class="flex min-w-0 flex-col gap-8">
      <PageIntro
        title={pattern()?.title ?? 'Component recipes'}
        description={
          pattern()?.description ??
          'The solid-ui registry, translated into newui composition. Each destination is a working example with its own lazy module.'
        }
      />
      <Show
        when={pattern()}
        fallback={
          <>
            <section
              class="grid gap-4 sm:grid-cols-2"
              aria-label="Additional patterns"
            >
              <For each={PATTERNS}>
                {(item) => (
                  <A
                    href={`/examples/patterns/${item.slug}`}
                    class="rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3 hover:border-outline-gray-3 focus-visible:focus-ring"
                  >
                    <h2 class="text-section">{item.title}</h2>
                    <p class="mt-2 text-ink-gray-6">{item.description}</p>
                  </A>
                )}
              </For>
            </section>
            <section aria-labelledby="registry-heading">
              <h2 id="registry-heading" class="mb-4 text-section">
                All {REFERENCE_EXAMPLES.length} reference examples
              </h2>
              <ul class="grid gap-2 sm:grid-cols-2">
                <For each={REFERENCE_EXAMPLES}>
                  {(item) => (
                    <li>
                      <A
                        href={item.href}
                        class="block rounded-3 border border-outline-gray-1 px-3 py-2 capitalize text-ink-blue-link hover:bg-surface-gray-2 focus-visible:focus-ring"
                      >
                        {item.name}
                      </A>
                    </li>
                  )}
                </For>
              </ul>
            </section>
          </>
        }
      >
        <div class="min-w-0 rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3 sm:p-4">
          <Content />
        </div>
        <A
          href="/examples/patterns"
          class="w-fit rounded-3 text-ink-blue-link focus-visible:focus-ring"
        >
          <span
            aria-hidden="true"
            class="lucide-arrow-left inline-block size-4 align-middle"
          />{' '}
          All component recipes
        </A>
      </Show>
    </div>
  )
}

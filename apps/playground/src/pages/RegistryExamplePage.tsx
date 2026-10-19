import { A, useParams } from '@solidjs/router'
import { createMemo, createResource, lazy, Show, Suspense } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { COMPONENTS } from '../generated/components'
import { STORIES } from '../generated/stories'
import { LoadingNote } from '../lib/LoadingNote'
import { REFERENCE_EXAMPLES } from '../lib/reference-examples'
// The raw-sources glob lives in a `.ts` module: a glob call written in a
// `.tsx` file breaks Vite 8's dependency scan (registry-example-sources.ts).
import { REGISTRY_EXAMPLE_SOURCES as sources } from '../lib/registry-example-sources'
import { PageIntro } from '../shell/PageIntro'
import { ThemeMenu } from '../shell/ThemeMenu'

const patterns: Record<
  string,
  () => Promise<{ default: import('solid-js').Component<{ example?: string }> }>
> = {
  carousel: () => import('../patterns/Carousel'),
  command: () => import('../patterns/Command'),
  layout: () => import('../patterns/Layout'),
  navigation: () => import('../patterns/Navigation'),
  verification: () => import('../patterns/Verification'),
  'analytics-widgets': () => import('../patterns/AnalyticsWidgets'),
}

const PATTERN_FILES: Record<string, string> = {
  carousel: 'Carousel',
  command: 'Command',
  layout: 'Layout',
  navigation: 'Navigation',
  verification: 'Verification',
  'analytics-widgets': 'AnalyticsWidgets',
}

/** A story file's `Demo` as a lazily loaded component. */
function storyDemo(
  load: () => Promise<{ Demo: import('solid-js').Component }>,
) {
  return () => load().then((module) => ({ default: module.Demo }))
}

export function RegistryExamplePage() {
  const params = useParams()
  const entry = () =>
    REFERENCE_EXAMPLES.find((item) => item.source === params['name'])
  const resolved = createMemo(() => {
    const target = entry()?.implementation ?? ''
    const slug = target.split('/').at(-1) ?? ''
    if (
      entry()?.source === 'data-table-demo' ||
      entry()?.source === 'table-demo'
    )
      return {
        Component: lazy(
          storyDemo(() => import('../stories/task-table.stories')),
        ),
        source: '../stories/task-table.stories.tsx',
      }
    const component = COMPONENTS.find((item) => item.slug === slug)
    if (component) {
      const story = STORIES[component.name]
      return story
        ? {
            Component: lazy(storyDemo(story.load)),
            source: `../stories/${slug}.stories.tsx`,
          }
        : undefined
    }
    const pattern = patterns[slug]
    return pattern
      ? {
          Component: lazy(pattern),
          source: `../patterns/${PATTERN_FILES[slug]}.tsx`,
        }
      : undefined
  })
  const [source] = createResource(
    () => resolved()?.source,
    async (file) => (await sources[file]?.()) ?? '',
  )
  return (
    <Show when={entry()} fallback={<p>Unknown registry example.</p>}>
      {(item) => (
        <article class="flex min-w-0 flex-col gap-4">
          <PageIntro
            title={item().name}
            description={`Adapted from solid-ui ${item().source}. The example uses newui semantic tokens and keyboard behavior.`}
          />
          <Suspense fallback={<LoadingNote label="Loading example…" />}>
            <Show
              when={resolved()}
              fallback={
                item().source === 'mode-toggle' ? (
                  <ThemeMenu />
                ) : (
                  <A href={item().implementation}>
                    Open the application workflow
                  </A>
                )
              }
            >
              {(demo) => (
                <section
                  aria-label={item().name}
                  class="min-w-0 rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3"
                >
                  <Dynamic
                    component={demo().Component}
                    example={item().source}
                  />
                </section>
              )}
            </Show>
            <Show when={source()}>
              <details>
                <summary class="cursor-pointer rounded-3 py-3 focus-visible:focus-ring">
                  Copyable example source
                </summary>
                <pre class="max-h-96 overflow-auto rounded-5 border border-outline-gray-1 p-3 text-caption">
                  <code>{source()}</code>
                </pre>
              </details>
            </Show>
          </Suspense>
          <A href={item().implementation} class="text-ink-blue-link underline">
            Full component contract or application
          </A>
        </article>
      )}
    </Show>
  )
}

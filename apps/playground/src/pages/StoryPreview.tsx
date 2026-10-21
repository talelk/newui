import { useLocation, useParams } from '@solidjs/router'
import {
  createEffect,
  createMemo,
  type JSX,
  lazy,
  Show,
  Suspense,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { componentBySlug } from '../generated/components'
import { STORIES } from '../generated/stories'
import { LoadingNote } from '../lib/LoadingNote'

/**
 * Same-origin preview document for organisms and templates.
 *
 * The site can render these stories without requiring a second Storybook
 * process: it uses the exact `Demo` export Storybook uses, in a bare document
 * like Storybook's own preview frame. The iframe keeps its real viewport while
 * the host scales it, and the theme/direction query is the same contract the
 * fullscreen link opens.
 */
export function StoryPreview(): JSX.Element {
  const params = useParams()
  const location = useLocation()
  createEffect(() => {
    const query = new URLSearchParams(location.search)
    const theme = query.get('theme') === 'dark' ? 'dark' : 'light'
    const dir = query.get('dir') === 'rtl' ? 'rtl' : 'ltr'
    document.documentElement.dataset['theme'] = theme
    document.documentElement.style.colorScheme = theme
    document.documentElement.dir = dir
  })
  const demo = createMemo(() => {
    const name = params['name'] ?? ''
    const component = componentBySlug(name)
    const story =
      (component ? STORIES[component.name] : undefined) ??
      Object.values(STORIES).find((entry) => entry.id === name)
    return story
      ? {
          Component: lazy(() =>
            story.load().then((module) => ({ default: module.Demo })),
          ),
          name: component?.name ?? name,
        }
      : undefined
  })
  return (
    <main
      aria-label="Story preview"
      class="min-h-dvh bg-surface-base p-8 text-ink-gray-9"
    >
      <Show
        when={demo()}
        fallback={
          <p class="text-interface text-ink-gray-7">
            No isolated preview exists for this component.
          </p>
        }
      >
        {(entry) => (
          <Suspense fallback={<LoadingNote label="Loading preview…" />}>
            <Dynamic component={entry().Component} />
          </Suspense>
        )}
      </Show>
    </main>
  )
}

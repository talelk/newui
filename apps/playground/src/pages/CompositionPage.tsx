import { useParams } from '@solidjs/router'
import { Show } from 'solid-js'
import { STORIES } from '../generated/stories'
import { ResponsivePreview } from '../lib/ResponsivePreview'
// The story-sources glob lives in a `.ts` module: a glob call written in a
// `.tsx` file breaks Vite 8's dependency scan (story-sources.ts).
import { storySources as sources } from '../lib/story-sources'
import { PageIntro } from '../shell/PageIntro'

const compositions: Record<string, { title: string; demo: string }> = {
  'sidebar-01': {
    title: 'Grouped documentation sidebar',
    demo: 'Grouped documentation sidebar',
  },
  'demo-sidebar': { title: 'Application sidebar', demo: 'DemoSidebar' },
}
export function CompositionPage() {
  const params = useParams()
  const entry = () => compositions[params['name'] ?? '']
  return (
    <Show when={entry()} fallback={<p>Unknown composition.</p>}>
      {(item) => (
        <article class="flex min-w-0 flex-col gap-4">
          <PageIntro
            title={item().title}
            description="A copyable solid-ui block composition built from newui. This composition lives in the site; it is not a package export."
          />
          <Show when={STORIES[item().demo]}>
            {(story) => (
              <ResponsivePreview
                title={item().title}
                src={`/preview/${story().id}`}
                source={() =>
                  sources[`../stories/${params['name']}.stories.tsx`]?.() ??
                  Promise.resolve('')
                }
              />
            )}
          </Show>
        </article>
      )}
    </Show>
  )
}

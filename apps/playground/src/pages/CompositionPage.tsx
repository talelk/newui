import { useParams } from '@solidjs/router'
import { Show } from 'solid-js'
import { ResponsivePreview } from '../lib/ResponsivePreview'
import { PageIntro } from '../shell/PageIntro'

const compositions: Record<string, { title: string; demo: string }> = {
  'sidebar-01': { title: 'Grouped documentation sidebar', demo: 'Sidebar01' },
  'demo-sidebar': { title: 'Application sidebar', demo: 'DemoSidebar' },
}
const sources = import.meta.glob<string>('../demos/*.tsx', {
  query: '?raw',
  import: 'default',
})
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
          <ResponsivePreview
            title={item().title}
            src={`/play?c=${item().demo}`}
            source={() =>
              sources[`../demos/${params['name']}.tsx`]?.() ??
              Promise.resolve('')
            }
          />
        </article>
      )}
    </Show>
  )
}

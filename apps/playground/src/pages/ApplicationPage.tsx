import { useLocation } from '@solidjs/router'
import { Show } from 'solid-js'
import { applicationSources } from '../lib/application-sources'
import { stripBase } from '../lib/base'
import { EXAMPLES } from '../lib/examples'
import { ResponsivePreview } from '../lib/ResponsivePreview'
import { PageIntro } from '../shell/PageIntro'

export function ApplicationPage() {
  const location = useLocation()
  const path = () => stripBase(location.pathname)
  const example = () => EXAMPLES.find((item) => item.href === path())
  const slug = () => path().split('/').at(-1) ?? ''
  return (
    <Show when={example()}>
      {(entry) => (
        <article class="flex min-w-0 flex-col gap-4">
          <PageIntro title={entry().name} description={entry().description} />
          <ResponsivePreview
            title={entry().name}
            src={`${entry().href}/fullscreen`}
            source={() => applicationSources(slug())}
          />
        </article>
      )}
    </Show>
  )
}

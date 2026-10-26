import { A } from '@solidjs/router'
import { For, type JSX } from 'solid-js'
import { AppSilhouette, type AppSilhouetteKind } from '../lib/AppSilhouette'
import { CatalogIcon } from '../lib/CatalogIcon'
import { EXAMPLES } from '../lib/examples'
import { PageIntro } from '../shell/PageIntro'

/** The screen shape each application preview opens into. */
const SILHOUETTES: Record<string, AppSilhouetteKind> = {
  '/pages/accounting': 'table',
  '/pages/analytics': 'analytics',
  '/pages/authentication': 'auth',
  '/pages/cards': 'cards',
  '/pages/compose': 'compose',
  '/pages/deals': 'board',
  '/pages/discussions': 'threads',
  '/pages/files': 'files',
  '/pages/mail': 'mail',
  '/pages/settings': 'settings',
  '/pages/tasks': 'table',
  '/pages/tickets': 'board',
}

export function Examples(): JSX.Element {
  return (
    <div class="flex flex-col gap-4">
      <PageIntro
        title="Pages"
        description="Whole screens wired to real state: every level of the ladder, used the way a product uses it."
      />
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <For each={EXAMPLES}>
          {(example) => (
            <A
              href={example.href}
              class="group flex min-h-11 flex-col gap-3 rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-3 hover:bg-surface-gray-2 focus-visible:focus-ring"
            >
              <AppSilhouette kind={SILHOUETTES[example.href] ?? 'table'} />
              <div class="flex min-w-0 flex-1 items-start gap-3">
                <span class="mt-0.5 flex shrink-0">
                  <CatalogIcon icon={example.icon} />
                </span>
                <div class="min-w-0 flex-1">
                  <h2 class="text-interface font-medium">{example.name}</h2>
                  <p class="mt-1 text-caption text-ink-gray-7">
                    {example.description}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  class="lucide-arrow-up-right size-4 shrink-0 self-center text-ink-gray-7 transition-colors group-hover:text-ink-gray-9"
                />
              </div>
            </A>
          )}
        </For>
      </div>
    </div>
  )
}

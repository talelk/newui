import { A } from '@solidjs/router'
import { For, type JSX } from 'solid-js'
import { CatalogIcon } from '../lib/CatalogIcon'
import { EXAMPLES } from '../lib/examples'
import { PageIntro } from '../shell/PageIntro'

export function Examples(): JSX.Element {
  return (
    <div class="flex flex-col gap-4">
      <PageIntro
        title="Examples"
        description="Working applications and reusable patterns for your next product."
      />
      <div class="flex flex-col divide-y divide-outline-gray-1 rounded-5 border border-outline-gray-1">
        <For each={EXAMPLES}>
          {(example) => (
            <A
              href={example.href}
              class="flex min-h-11 items-center gap-3 rounded-3 p-3 hover:bg-surface-gray-2 focus-visible:focus-ring"
            >
              <CatalogIcon />
              <div class="min-w-0 flex-1">
                <h2 class="text-interface font-medium">{example.name}</h2>
                <p class="mt-1 text-caption text-ink-gray-6">
                  {example.description}
                </p>
                <p class="mt-1 text-caption text-ink-gray-6">
                  {example.source}
                </p>
              </div>
              <span
                aria-hidden="true"
                class="lucide-arrow-up-right size-4 shrink-0 text-ink-gray-6"
              />
            </A>
          )}
        </For>
      </div>
    </div>
  )
}

import { A } from '@solidjs/router'
import { createMemo, For, type JSX } from 'solid-js'
import { BLOCKS } from '../generated/components'
import { CatalogIcon } from '../lib/CatalogIcon'
import { PageIntro } from '../shell/PageIntro'

/**
 * The blocks index: the composed sections `@newui/blocks` ships.
 *
 * Separate from `/components` on purpose. A component answers "what is this
 * control"; a block answers "how does a page open" — so they are read in
 * different moods, and mixing the two lists makes both harder to scan.
 *
 * Every card links to a page generated the same way a component's is: the live
 * demo, the prop tables from the source, and the contract.
 */
export function BlocksIndex(): JSX.Element {
  const grouped = createMemo(() => {
    const groups = new Map<string, typeof BLOCKS>()
    for (const block of BLOCKS.filter((entry) => entry.shipped)) {
      groups.set(block.group, [...(groups.get(block.group) ?? []), block])
    }
    return [...groups].map(([group, entries]) => ({ group, entries }))
  })

  return (
    <>
      <PageIntro
        title="Blocks"
        description="Composed page sections built with @newui/ui."
      />

      <section
        class="mb-4 flex flex-col gap-3"
        aria-label="Copyable site compositions"
      >
        <h2 class="text-section">Site compositions</h2>
        <p class="text-ink-gray-6">
          Adapted from solid-ui. Copy the source; these are not package exports.
        </p>
        <A
          href="/blocks/compositions/sidebar-01"
          class="text-ink-blue-link underline"
        >
          Grouped documentation sidebar
        </A>
        <A
          href="/blocks/compositions/demo-sidebar"
          class="text-ink-blue-link underline"
        >
          Application sidebar
        </A>
      </section>
      <div class="flex flex-col gap-4">
        <For each={grouped()}>
          {(section) => (
            <section class="flex flex-col gap-3">
              <h2 class="text-section text-ink-gray-9">{section.group}</h2>
              <ul class="flex flex-col divide-y divide-outline-gray-1 rounded-5 border border-outline-gray-1">
                <For each={section.entries}>
                  {(block) => (
                    <li>
                      <A
                        href={`/blocks/${block.slug}`}
                        class="flex min-h-11 items-center gap-3 rounded-3 p-3 transition-colors hover:bg-surface-gray-2 focus-visible:focus-ring"
                      >
                        <CatalogIcon group={section.group} />
                        <span class="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-2">
                          <span class="truncate text-base-medium text-ink-gray-9">
                            {block.name}
                          </span>
                          <span class="hidden min-w-0 flex-1 truncate text-caption text-ink-gray-6 md:block">
                            {block.description}
                          </span>
                          <span class="shrink-0 text-xs text-ink-gray-6">
                            {section.group}
                          </span>
                        </span>
                        <span class="text-caption text-ink-gray-6">
                          {block.parts.length} prop
                          {block.parts.length === 1 ? '' : 's'} · live demo ·
                          contract
                        </span>
                      </A>
                    </li>
                  )}
                </For>
              </ul>
            </section>
          )}
        </For>
      </div>
    </>
  )
}

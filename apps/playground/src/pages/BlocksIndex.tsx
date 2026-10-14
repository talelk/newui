import { A } from '@solidjs/router'
import { createMemo, For, type JSX } from 'solid-js'
import { BLOCKS } from '../generated/components'
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
        description="Composed sections, built from the components in @newui/ui. A block is opinionated about layout and can be replaced wholesale — take it, or copy the twenty lines it saves."
      />

      <div class="flex flex-col gap-10">
        <For each={grouped()}>
          {(section) => (
            <section class="flex flex-col gap-3">
              <h2 class="text-lg-medium text-ink-gray-9">{section.group}</h2>
              <ul class="grid gap-2 sm:grid-cols-2">
                <For each={section.entries}>
                  {(block) => (
                    <li>
                      <A
                        href={`/blocks/${block.slug}`}
                        class="flex h-full flex-col gap-1 rounded-5 border border-outline-gray-2 p-3 transition-colors hover:border-outline-gray-3 hover:bg-surface-gray-2 focus-visible:focus-ring"
                      >
                        <span class="flex items-baseline justify-between gap-2">
                          <span class="truncate text-base-medium text-ink-gray-9">
                            {block.name}
                          </span>
                          <span class="shrink-0 text-xs text-ink-gray-5">
                            {section.group}
                          </span>
                        </span>
                        <span class="text-sm text-ink-gray-5">
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

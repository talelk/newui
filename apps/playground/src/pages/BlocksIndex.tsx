import { A } from '@solidjs/router'
import { createMemo, type JSX } from 'solid-js'
import { BLOCKS } from '../generated/components'
import { CatalogList } from '../lib/CatalogList'
import { groupEntries } from '../lib/catalog'
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
  const grouped = createMemo(() =>
    groupEntries(BLOCKS.filter((entry) => entry.shipped)),
  )

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
        <p class="text-ink-gray-7">
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
      <CatalogList
        sections={grouped()}
        href={(block) => `/blocks/${block.slug}`}
        trailing={(block) => (
          <>
            <span class="shrink-0 text-xs text-ink-gray-7">
              {block.parts.length} part{block.parts.length === 1 ? '' : 's'}
            </span>
            <span class="hidden text-caption text-ink-gray-7 sm:block">
              Has a contract
            </span>
          </>
        )}
      />
    </>
  )
}

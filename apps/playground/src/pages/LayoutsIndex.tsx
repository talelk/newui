import { createMemo, type JSX } from 'solid-js'
import { LAYOUTS } from '../generated/components'
import { CatalogList } from '../lib/CatalogList'
import { groupEntries } from '../lib/catalog'
import { PageIntro } from '../shell/PageIntro'

/**
 * The layouts index: the page templates `@newui/layouts` ships.
 *
 * The third list, and the third question. A component answers *what is this
 * control*; a block answers *how does this section open*; a layout answers *how
 * does the page open* — where the title and the actions live, whether the
 * filters sit in a toolbar or a row, and what a phone does with the navigation.
 */
export function LayoutsIndex(): JSX.Element {
  const grouped = createMemo(() =>
    groupEntries(LAYOUTS.filter((entry) => entry.shipped)),
  )

  return (
    <>
      <PageIntro
        title="Layouts"
        description="Page templates built on the components and the blocks: the frame, the title block, the navigation column, and where the content scrolls."
      />
      <CatalogList
        sections={grouped()}
        href={(layout) => `/layouts/${layout.slug}`}
        trailing={(layout) => (
          <span class="shrink-0 text-xs text-ink-gray-7">
            {layout.parts.length} part{layout.parts.length === 1 ? '' : 's'}
          </span>
        )}
      />
    </>
  )
}

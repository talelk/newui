import { A } from '@solidjs/router'
import { For, type JSX } from 'solid-js'
import { CatalogIcon } from './CatalogIcon'
import type { CatalogSection } from './catalog'

/**
 * The grouped catalog list (H10, spec/history/examples-refresh.md §1).
 *
 * The components and blocks indexes rendered the same ~35-line block:
 * a group heading over a divided list of icon + name + description rows.
 * What differs per index is where a row links and what quiet text closes
 * it, so those are the two callbacks.
 */
export interface CatalogEntry {
  name: string
  slug: string
  description?: string
}

export function CatalogList<T extends CatalogEntry>(props: {
  sections: CatalogSection<T>[]
  href: (entry: T) => string
  /** Quiet end-of-row text: part counts, contract notes. */
  trailing?: (entry: T) => JSX.Element
}): JSX.Element {
  return (
    <div class="flex flex-col gap-4">
      <For each={props.sections}>
        {(section) => (
          <section class="flex flex-col gap-3">
            <h2 class="text-section text-ink-gray-9">{section.group}</h2>
            <ul class="flex flex-col divide-y divide-outline-gray-1 rounded-5 border border-outline-gray-1">
              <For each={section.entries}>
                {(entry) => (
                  <li>
                    <A
                      href={props.href(entry)}
                      class="flex min-h-11 items-center gap-3 rounded-3 p-3 transition-colors hover:bg-surface-gray-2 focus-visible:focus-ring"
                    >
                      <CatalogIcon group={section.group} />
                      <span class="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-2">
                        <span class="truncate text-base-medium text-ink-gray-9">
                          {entry.name}
                        </span>
                        <span class="hidden min-w-0 flex-1 truncate text-caption text-ink-gray-7 md:block">
                          {entry.description}
                        </span>
                      </span>
                      {props.trailing?.(entry)}
                    </A>
                  </li>
                )}
              </For>
            </ul>
          </section>
        )}
      </For>
    </div>
  )
}

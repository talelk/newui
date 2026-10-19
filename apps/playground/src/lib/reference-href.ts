import type { ComponentEntry } from '../generated/components'

/**
 * Which reference section an entry lives in, and its one canonical URL.
 *
 * Five route groups share one generated page, and the mapping is by *level of
 * the ladder*, not by the group a component happens to sit in: a layout is a
 * layout wherever it is filed. Kept here rather than repeated in the palette,
 * the page and the harness — the three drifted once already
 * (`/components/app-layout` rendered a layout under the wrong breadcrumb).
 */
export function sectionOf(
  entry: Pick<ComponentEntry, 'kind' | 'group'>,
): 'components' | 'blocks' | 'layouts' | 'charts' | 'editors' {
  if (entry.kind === 'layout') return 'layouts'
  if (entry.kind === 'block') return 'blocks'
  if (entry.group === 'Charts') return 'charts'
  if (entry.group === 'Editors') return 'editors'
  return 'components'
}

export function hrefOf(entry: Pick<ComponentEntry, 'kind' | 'group' | 'slug'>) {
  return `/${sectionOf(entry)}/${entry.slug}`
}

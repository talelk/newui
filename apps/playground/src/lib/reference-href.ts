import type { ComponentEntry } from '../generated/components'

/**
 * Which reference section an entry lives in, and its one canonical URL.
 *
 * The sections are atomic design's levels, not the packages: an entry is filed
 * by what it *is* (an atom, a molecule, an organism, a template), which the
 * registry records once in `entry.atomic`. Kept here rather than repeated in the
 * palette, the page and the harness — the three drifted once already
 * (`/templates/app-layout` rendered a layout under the wrong breadcrumb).
 */
export type ReferenceSection = 'atoms' | 'molecules' | 'organisms' | 'templates'

/** `atom` → `atoms`, and so on: the four levels are regular. */
export function sectionOf(
  entry: Pick<ComponentEntry, 'atomic'>,
): ReferenceSection {
  return `${entry.atomic}s` as ReferenceSection
}

export function hrefOf(entry: Pick<ComponentEntry, 'atomic' | 'slug'>) {
  return `/${sectionOf(entry)}/${entry.slug}`
}

/**
 * Catalog filtering and grouping (H11, spec/examples-refresh.md §1).
 *
 * The reference sidebar and the two index pages grouped the generated
 * registry three slightly different ways. The predicate and the grouping
 * are pure, so they live here once and each surface keeps only its own
 * "which entries are eligible" rule (kind, package, section).
 */

/** The shape grouping needs; the generated entries satisfy it. */
export interface GroupableEntry {
  name: string
  group: string
  parts: readonly string[]
}

/** Name, group and part names are all fair game for the filter. */
export function matchesEntry(entry: GroupableEntry, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (needle === '') return true
  return (
    entry.name.toLowerCase().includes(needle) ||
    entry.group.toLowerCase().includes(needle) ||
    entry.parts.some((part) => part.toLowerCase().includes(needle))
  )
}

export interface CatalogSection<T> {
  group: string
  entries: T[]
}

/**
 * Entries grouped under their `group`, empty groups dropped. With
 * `groups`, sections follow that order (the generated `GROUPS` list);
 * without it, first-seen order — which is the order the registry was
 * generated in.
 */
export function groupEntries<T extends { group: string }>(
  entries: readonly T[],
  groups?: readonly string[],
): CatalogSection<T>[] {
  if (groups) {
    return groups
      .map((group) => ({
        group,
        entries: entries.filter((entry) => entry.group === group),
      }))
      .filter((section) => section.entries.length > 0)
  }
  const byGroup = new Map<string, T[]>()
  for (const entry of entries) {
    byGroup.set(entry.group, [...(byGroup.get(entry.group) ?? []), entry])
  }
  return [...byGroup].map(([group, grouped]) => ({ group, entries: grouped }))
}

import { type RouteSectionProps, useLocation } from '@solidjs/router'
import type { JSX } from 'solid-js'
import { COMPONENTS } from '../generated/components'
import { ATOMIC, type AtomicLevel } from '../lib/atomic'
import { TableOfContents } from '../lib/TableOfContents'
import { ComponentNav } from './ComponentNav'
import type { NavItem } from './nav'
import { Chrome } from './SiteLayout'

/**
 * A reference section's frame: its own index in the sidebar, and a prev/next
 * that walks that section's list rather than dropping the reader back into the
 * site tree.
 *
 * The four sections are atomic design's levels (atoms, molecules, organisms,
 * templates); which entries belong to one is the registry's `atomic` field.
 */
function ReferenceLayout(
  props: RouteSectionProps & {
    level: AtomicLevel
    toc?: () => JSX.Element
  },
): JSX.Element {
  const location = useLocation()
  const meta = () => ATOMIC[props.level]
  const siblings = (): NavItem[] => [
    { title: `All ${meta().label.toLowerCase()}`, href: meta().href },
    ...COMPONENTS.filter(
      (entry) => entry.shipped && entry.atomic === props.level,
    )
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((entry) => ({
        title: entry.name,
        href: `${meta().href}/${entry.slug}`,
      })),
  ]

  // An entry page (`/atoms/button`) has the reference page's four anchored
  // sections; the indexes and the compositions do not, so they keep whatever
  // the caller supplied (today: nothing).
  const isEntry = () =>
    location.pathname.split('/').filter(Boolean).length === 2
  const toc = () =>
    props.toc ??
    (isEntry()
      ? () => (
          <TableOfContents
            entries={[
              { id: 'preview', label: 'Live demo' },
              { id: 'usage', label: 'Usage' },
              { id: 'props', label: 'Props' },
              { id: 'contract', label: 'Contract' },
            ]}
          />
        )
      : undefined)

  return (
    <Chrome
      {...props}
      sidebar={() => <ComponentNav level={props.level} />}
      siblings={siblings()}
      toc={toc()}
    />
  )
}

/** The atoms frame. */
export function AtomsLayout(props: RouteSectionProps): JSX.Element {
  return <ReferenceLayout {...props} level="atom" />
}

/** The molecules frame. */
export function MoleculesLayout(props: RouteSectionProps): JSX.Element {
  return <ReferenceLayout {...props} level="molecule" />
}

/** The organisms frame. */
export function OrganismsLayout(props: RouteSectionProps): JSX.Element {
  return <ReferenceLayout {...props} level="organism" />
}

/** The templates frame. */
export function TemplatesLayout(props: RouteSectionProps): JSX.Element {
  return <ReferenceLayout {...props} level="template" />
}

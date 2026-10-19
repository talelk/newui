import { type RouteSectionProps, useLocation } from '@solidjs/router'
import type { JSX } from 'solid-js'
import { COMPONENTS } from '../generated/components'
import { TableOfContents } from '../lib/TableOfContents'
import { ComponentNav, OVERVIEW } from './ComponentNav'
import type { NavItem } from './nav'
import { Chrome } from './SiteLayout'

/**
 * A reference section's frame: its own index in the sidebar, and a prev/next
 * that walks that section's list rather than dropping the reader back into the
 * site tree.
 */

/** Which package a section's entries come from. */
const PACKAGE = {
  component: '@newui/ui',
  block: '@newui/blocks',
  layout: '@newui/layouts',
} as const
function ReferenceLayout(
  props: RouteSectionProps & {
    kind: 'component' | 'block' | 'layout'
    toc?: () => JSX.Element
  },
): JSX.Element {
  const location = useLocation()
  const base = () => `/${location.pathname.split('/')[1] ?? 'components'}`
  const siblings = (): NavItem[] => [
    ...(base() === '/charts' || base() === '/editors'
      ? [
          {
            title: base() === '/charts' ? 'All charts' : 'All editors',
            href: base(),
          },
        ]
      : OVERVIEW[props.kind]
    ).map((item) => ({
      title: item.title,
      href: item.href,
    })),
    ...COMPONENTS.filter(
      (entry) =>
        entry.shipped &&
        entry.kind === props.kind &&
        (base() === '/charts'
          ? entry.group === 'Charts'
          : base() === '/editors'
            ? entry.group === 'Editors'
            : entry.package === PACKAGE[props.kind]),
    )
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((entry) => ({
        title: entry.name,
        href: `${base()}/${entry.slug}`,
      })),
  ]

  // An entry page (`/components/button`) has the reference page's four
  // anchored sections; the indexes and the compositions do not, so they
  // keep whatever the caller supplied (today: nothing).
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
      sidebar={() => <ComponentNav kind={props.kind} />}
      siblings={siblings()}
      toc={toc()}
    />
  )
}

/** The components frame. */
export function ComponentsLayout(props: RouteSectionProps): JSX.Element {
  return <ReferenceLayout {...props} kind="component" />
}

/** The blocks frame. */
export function BlocksLayout(props: RouteSectionProps): JSX.Element {
  return <ReferenceLayout {...props} kind="block" />
}

/** The layouts frame. */
export function LayoutsLayout(props: RouteSectionProps): JSX.Element {
  return <ReferenceLayout {...props} kind="layout" />
}

/**
 * The site's navigation model — one tree, three consumers.
 *
 * The masthead, the sidebar and the prev/next footer all read this, and
 * `routes.tsx` is written to match it. Keeping the tree here (rather than
 * deriving it from the router) means the sidebar can list a page that is still
 * being written without the router having to resolve it first — and `nav.test.ts`
 * fails if the two drift, so a link in the sidebar always has a route behind it.
 *
 * `status` is the only decoration: a small pill in the sidebar. `new` marks a
 * surface added in the current push, `beta` an unstable contract (the
 * `/experimental` entry).
 */

export type NavStatus = 'new' | 'beta'

export interface NavItem {
  title: string
  href: string
  /** One line, shown under the title on an index page and as a tooltip. */
  description?: string
  status?: NavStatus
}

export interface NavSection {
  title: string
  items: NavItem[]
}

/** Top-level destinations, rendered as the masthead nav. */
export const MASTHEAD: NavItem[] = [
  { title: 'Docs', href: '/docs' },
  { title: 'Foundations', href: '/foundations' },
  { title: 'Components', href: '/components' },
  { title: 'Blocks', href: '/blocks' },
  { title: 'Examples', href: '/examples' },
]

/**
 * The sidebar tree. Order is the reading order: learn the system, then the
 * parts, then the compositions, then the whole apps.
 */
export const NAV: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Introduction',
        href: '/',
        description: 'What newui is, and what it refuses to be.',
      },
      {
        title: 'Installation',
        href: '/docs',
        description: 'Packages, stylesheet, provider, theme.',
      },
    ],
  },
  {
    title: 'Foundations',
    items: [
      {
        title: 'Design tokens',
        href: '/foundations',
        description: 'Colour, type, radius, elevation, focus, motion.',
      },
    ],
  },
  {
    title: 'Components',
    items: [
      {
        title: 'All components',
        href: '/components',
        description: 'Every compound the library exports, by group.',
      },
      {
        title: 'Anatomy & variants',
        href: '/components/atoms',
        description: 'Every axis of every atom on one page.',
      },
      {
        title: 'Feedback & state',
        href: '/components/feedback',
        description: 'Alerts, tabs, scroll areas, the chart ramp.',
      },
    ],
  },
  {
    title: 'Blocks',
    items: [
      {
        title: 'All blocks',
        href: '/blocks',
        description: 'Composed sections, one card per shape.',
      },
    ],
  },
  {
    title: 'Examples',
    items: [
      {
        title: 'Overview',
        href: '/examples',
        description: 'Whole screens, taken from real products.',
      },
      {
        title: 'Discussions · desktop',
        href: '/examples/discussions/desktop',
        description: 'Rail, sidebar, feed and settings dialog.',
      },
      {
        title: 'Discussions · mobile',
        href: '/examples/discussions/mobile',
        description: 'Pinned header, feed and a Spaces sheet.',
      },
    ],
  },
  {
    title: 'Internals',
    items: [
      {
        title: 'Component spec',
        href: '/spec',
        description: 'The deterministic route the tests drive.',
      },
      {
        title: 'Single demo',
        href: '/play?c=Button',
        description: 'One component, isolated — the docs embed this.',
      },
    ],
  },
]

/** Flattened reading order, for prev/next. */
export const NAV_ORDER: NavItem[] = NAV.flatMap((section) => section.items)

/** The sidebar section a path belongs to, or undefined for the masthead-only pages. */
export function sectionFor(pathname: string): NavSection | undefined {
  return NAV.find((section) =>
    section.items.some((item) => item.href.split('?')[0] === pathname),
  )
}

/**
 * Prev/next within the flat reading order. Both are `NavItem`s so the footer
 * can render the title and the description without a second lookup.
 */
export function siblingsFor(pathname: string): {
  previous?: NavItem
  next?: NavItem
} {
  const index = NAV_ORDER.findIndex(
    (item) => item.href.split('?')[0] === pathname,
  )
  if (index === -1) return {}
  return {
    previous: index > 0 ? NAV_ORDER[index - 1] : undefined,
    next: index < NAV_ORDER.length - 1 ? NAV_ORDER[index + 1] : undefined,
  }
}

import { LADDER_COUNTS } from '../generated/counts'
import { EXAMPLES } from '../lib/examples'
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
 *
 * The order is the ladder (ADR-0012): foundations → components → blocks →
 * layouts → applications. A reader who follows it downwards learns one level,
 * then watches the next level use it.
 */

export type NavStatus = 'new' | 'beta'

export interface NavItem {
  title: string
  href: string
  /** One line, shown under the title on an index page and as a tooltip. */
  description?: string
  status?: NavStatus
  /** How many entries the destination lists, when the count is meaningful. */
  count?: number
}

export interface NavSection {
  title: string
  items: NavItem[]
  /** How many entries this level of the ladder ships. */
  count?: number
}

/** One level's count, from the registry the pages are generated from. */
const level = (key: keyof typeof LADDER_COUNTS) => LADDER_COUNTS[key]

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
      {
        title: 'Architecture',
        href: '/architecture',
        description:
          'The five levels of the ladder, and the rule between them.',
      },
    ],
  },
  {
    title: 'Foundations',
    count: level('foundations'),
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
    count: level('components'),
    items: [
      {
        title: 'All components',
        href: '/components',
        description: 'Every compound the library exports, by group.',
      },
    ],
  },
  {
    title: 'Blocks',
    count: level('blocks'),
    items: [
      {
        title: 'All blocks',
        href: '/blocks',
        description: 'Composed sections built from the components.',
      },
    ],
  },
  {
    title: 'Layouts',
    count: level('layouts'),
    items: [
      {
        title: 'All layouts',
        href: '/layouts',
        description: 'Page templates: how a page opens.',
      },
    ],
  },
  {
    title: 'Kit',
    items: [
      {
        title: 'Build an app',
        href: '/kit',
        description: 'Compose a page, wire data, start from the gated starter.',
      },
    ],
  },
  {
    title: 'Charts',
    items: [{ title: 'All charts', href: '/charts' }],
  },
  {
    title: 'Editors',
    items: [{ title: 'Rich text and code', href: '/editors' }],
  },
  {
    title: 'Examples',
    count: level('applications'),
    items: [
      {
        title: 'Overview',
        href: '/examples',
        description: 'Whole screens and working local applications.',
      },
      ...EXAMPLES.map((example) => ({
        title: example.name,
        href: example.href,
        description: example.description,
      })),
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
    ],
  },
]

/** Flattened reading order, for prev/next. */
export const NAV_ORDER: NavItem[] = NAV.flatMap((section) => section.items)

/** The sidebar section a path belongs to, or undefined for the masthead-only pages. */
export function sectionFor(pathname: string): NavSection | undefined {
  const segment = pathname.split('/')[1]
  if (!segment || segment === 'docs') return NAV[0]
  return NAV.find((section) =>
    section.items.some((item) => item.href.split('/')[1] === segment),
  )
}

/**
 * Prev/next within one ordered list. Both are `NavItem`s so the footer can
 * render a title without a second lookup.
 *
 * `items` exists because a section has its own order: the component reference
 * walks the component list, not the site tree — and a page with no place in the
 * order it was given gets no footer rather than an empty strip.
 */
export function siblingsFor(
  pathname: string,
  items: NavItem[] = NAV_ORDER,
): { previous?: NavItem; next?: NavItem } {
  const index = items.findIndex((item) => item.href.split('?')[0] === pathname)
  if (index === -1) return {}
  return {
    previous: index > 0 ? items[index - 1] : undefined,
    next: index < items.length - 1 ? items[index + 1] : undefined,
  }
}

/** Icons are literal utilities so the build can discover every glyph. */
export const SECTION_ICONS: Record<string, string> = {
  Overview: 'lucide-house',
  Foundations: 'lucide-palette',
  Components: 'lucide-component',
  Blocks: 'lucide-blocks',
  Layouts: 'lucide-layout-template',
  Charts: 'lucide-chart-no-axes-combined',
  Editors: 'lucide-square-pen',
  Examples: 'lucide-panels-top-left',
  Internals: 'lucide-wrench',
}

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
 * The order is the ladder (ADR-0012): foundations → atoms → molecules →
 * organisms → templates → pages. A reader who follows it downwards learns one
 * level, then watches the next level use it.
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
        title: 'Atomic design',
        href: '/architecture',
        description:
          'The five levels, the rule between them, and where the logic layer sits.',
      },
      {
        title: 'Build an app',
        href: '/kit',
        description: 'Compose a page, wire data, start from the starter.',
      },
      {
        title: 'Recipes',
        href: '/kit/recipes',
        description:
          'Small compositions and reference examples linked to their atomic owner.',
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
    title: 'Atoms',
    count: level('atoms'),
    items: [
      {
        title: 'All atoms',
        href: '/atoms',
        description:
          'One control or mark, with nothing else inside. The smallest unit a page is built from.',
      },
    ],
  },
  {
    title: 'Molecules',
    count: level('molecules'),
    items: [
      {
        title: 'All molecules',
        href: '/molecules',
        description:
          'Atoms assembled into one interaction: a field, a picker, a menu, a chart legend.',
      },
    ],
  },
  {
    title: 'Organisms',
    count: level('organisms'),
    items: [
      {
        title: 'All organisms',
        href: '/organisms',
        description:
          'Self-contained regions: sidebars, toolbars, boards, charts, editors.',
      },
    ],
  },
  {
    title: 'Templates',
    count: level('templates'),
    items: [
      {
        title: 'All templates',
        href: '/templates',
        description:
          'The arrangement: the frame, the title block, the navigation column.',
      },
    ],
  },
  {
    title: 'Pages',
    count: level('pages'),
    items: [
      {
        title: 'Overview',
        href: '/pages',
        description:
          'Whole screens, wired to real state — the top of the ladder.',
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
  Atoms: 'lucide-circle-dot',
  Molecules: 'lucide-shapes',
  Organisms: 'lucide-layout-dashboard',
  Templates: 'lucide-layout-template',
  Pages: 'lucide-panels-top-left',
  Internals: 'lucide-wrench',
}

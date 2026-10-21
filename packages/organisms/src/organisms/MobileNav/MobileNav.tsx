import { Icon, type IconProp } from '@talelk/newui-atoms'
import { cn } from '@talelk/newui-atoms/internal'
import { type JSX, Show, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export interface MobileNavProps {
  /** Accessible name for the `<nav>` landmark. */
  'aria-label'?: string
  /** Merged into the root `<nav>`. */
  class?: string
  /** One or more `MobileNavItem`s, each becoming an equal-width tab. */
  children?: JSX.Element
}

/**
 * A bottom navigation bar. A bare grid frame: each `MobileNavItem` is one
 * equal-width column (`auto-cols-fr` + `grid-flow-col`), so the bar adapts to
 * any item count without a hardcoded column class.
 *
 * In an installed PWA the bar runs to the bottom edge and its padding clears
 * the home indicator — the safe-area inset, or `1rem` where the inset is
 * smaller. Presentational: it owns no selection state.
 */
export function MobileNav(props: MobileNavProps): JSX.Element {
  const [local] = splitProps(props, ['aria-label', 'class', 'children'])

  return (
    <nav
      aria-label={local['aria-label']}
      data-slot="mobile-nav"
      class={cn(
        'grid shrink-0 auto-cols-fr grid-flow-col border-t border-outline-gray-2 bg-surface-elevation-2',
        '[@media(display-mode:standalone)]:pb-[max(1rem,env(safe-area-inset-bottom))]',
        local.class,
      )}
    >
      {local.children}
    </nav>
  )
}

export interface MobileNavItemProps {
  /** Label under the glyph; also the accessible name. */
  label: string
  /** Lucide icon name or component (P11). Replaced by `children`. */
  icon?: IconProp
  /** In-app destination. Renders an anchor; wins over `href`. */
  route?: string
  /** External URL. Renders an anchor when `route` is absent. */
  href?: string
  /** Highlight this tab. A state prop, independent of the current route. */
  active?: boolean
  /** Marks the item as the current page for assistive tech. */
  'aria-current'?:
    | 'page'
    | 'step'
    | 'location'
    | 'date'
    | 'time'
    | 'true'
    | 'false'
  /** Merged into the item. */
  class?: string
  /** Custom content in place of the icon — an avatar, a badge. */
  children?: JSX.Element
  /** Click handler. Set it on button items, and on links to navigate in-app. */
  onClick?: (event: MouseEvent) => void
}

/**
 * One tab of a `MobileNav`: a glyph over a label, with an active highlight.
 * Renders a real anchor when it has a `route`/`href` and a plain button
 * otherwise. `active` drives the highlight through `data-state`; it is a state
 * prop, not a theme, and may stay lit across a whole section.
 */
export function MobileNavItem(props: MobileNavItemProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'label',
    'icon',
    'route',
    'href',
    'active',
    'class',
    'children',
    'onClick',
  ])

  const destination = () => local.route ?? local.href
  const isLink = () => Boolean(destination())
  const isActive = () => Boolean(local.active)
  const rootProps = () =>
    isLink() ? { href: destination() } : { type: 'button' as const }

  return (
    <Dynamic
      component={isLink() ? 'a' : 'button'}
      {...rootProps()}
      {...rest}
      data-slot="mobile-nav-item"
      data-state={isActive() ? 'active' : 'inactive'}
      onClick={local.onClick}
      class={cn(
        'flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-ink-gray-6 transition',
        'active:scale-95 data-[state=active]:text-ink-gray-8',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline-gray-3',
        local.class,
      )}
    >
      <Show
        when={local.children}
        fallback={<Icon icon={local.icon} class="size-6" />}
      >
        <span aria-hidden="true" class="contents">
          {local.children}
        </span>
      </Show>
      <span class="text-xs-medium leading-tighter">{local.label}</span>
    </Dynamic>
  )
}

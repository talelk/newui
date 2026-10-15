import { For, type JSX, Show, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { cn } from '../../lib/tv'

/**
 * One crumb. `route` is the in-app destination and `href` the external URL
 * (CONTEXT: route = in-app, href = external); either renders an anchor, and
 * `route` wins when both are set. `icon` is a `lucide-*` glyph name shown before
 * the label (P11). Extra fields are allowed so a crumb can carry its source
 * record, but the component itself only reads the fields declared here.
 */
export interface BreadcrumbItem {
  /** Text shown for the breadcrumb item. */
  label: string
  /** In-app destination. Renders an anchor; wins over `href`. */
  route?: string
  /** External URL. Renders an anchor; ignored when `route` is set. */
  href?: string
  /** Lucide icon name shown before the label (e.g. `lucide-home`). */
  icon?: string
  /**
   * Click handler. Set it together with `route`/`href` to keep a real URL on
   * the crumb while navigating in-app: a plain left click runs the handler,
   * a modified click (Cmd/Ctrl/Shift/Alt or middle) stays with the browser.
   * On the current (last) item it is ignored — that crumb is not a target.
   */
  onClick?: (event?: MouseEvent) => void
  /** Any extra field the caller wants to carry on the item. */
  [key: string]: unknown
}

export interface BreadcrumbsProps {
  /** Ordered list of breadcrumb items, root first and current page last. */
  items: BreadcrumbItem[]
  /** Accessible name for the landmark. Defaults to `"Breadcrumb"`. */
  'aria-label'?: string
  /** Merged into the root `<nav>`. */
  class?: string
}

function isModifiedClick(event: MouseEvent): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  )
}

interface CrumbProps {
  item: BreadcrumbItem
  current: boolean
}

/**
 * The interactive part of a crumb. The current page renders as a plain
 * `<span aria-current="page">`; everything else is an anchor when it has a
 * destination and a button otherwise. The element is chosen with `<Dynamic>`
 * so a Solid component body keeps a single return.
 */
function Crumb(props: CrumbProps): JSX.Element {
  const [local] = splitProps(props, ['item', 'current'])

  const destination = () => local.item.route ?? local.item.href
  const tag = () => {
    if (local.current) return 'span'
    return destination() ? 'a' : 'button'
  }
  const slot = () => {
    if (local.current) return 'breadcrumbs-current'
    return destination() ? 'breadcrumbs-link' : 'breadcrumbs-button'
  }
  const rootProps = () => {
    if (tag() === 'a') return { href: destination() }
    if (tag() === 'button') return { type: 'button' as const }
    return {}
  }

  const handleClick = (event: MouseEvent) => {
    const item = local.item
    if (!item.onClick) return
    const link = tag() === 'a'
    if (link && isModifiedClick(event)) return
    if (link) event.preventDefault()
    item.onClick(event)
  }

  return (
    <Dynamic
      component={tag()}
      {...rootProps()}
      data-slot={slot()}
      aria-current={local.current ? 'page' : undefined}
      onClick={handleClick}
      class={cn(
        'flex items-center rounded-4 px-0.5 py-1 text-lg-medium leading-tighter',
        local.current
          ? 'min-w-0 text-ink-gray-9'
          : 'text-ink-gray-6 hover:text-ink-gray-7',
      )}
    >
      <Show when={local.item.icon}>
        {(icon) => (
          <span class={cn(icon(), 'size-4 shrink-0')} aria-hidden="true" />
        )}
      </Show>
      <span
        class={cn(local.current && 'min-w-0 truncate')}
        title={local.current ? local.item.label : undefined}
      >
        {local.item.label}
      </span>
    </Dynamic>
  )
}

/**
 * A row of links showing where the current page sits in a hierarchy. Renders
 * the `nav > ol` landmark itself, so it is the page's main breadcrumb trail
 * (unlike frappe-ui, which leaves the landmark to the caller). The last item is
 * the current page and carries `aria-current="page"`; separators are hidden
 * from assistive tech.
 */
export function Breadcrumbs(props: BreadcrumbsProps): JSX.Element {
  const [local] = splitProps(props, ['items', 'aria-label', 'class'])

  return (
    <nav
      aria-label={local['aria-label'] ?? 'Breadcrumb'}
      data-slot="breadcrumbs"
      class={cn('flex min-w-0 items-center', local.class)}
    >
      <ol
        data-slot="breadcrumbs-list"
        class="m-0 flex min-w-0 list-none items-center p-0"
      >
        <For each={local.items}>
          {(item, index) => (
            <li data-slot="breadcrumbs-item" class="flex min-w-0 items-center">
              <Crumb item={item} current={index() === local.items.length - 1} />
              <Show when={index() < local.items.length - 1}>
                <span
                  data-slot="breadcrumbs-separator"
                  aria-hidden="true"
                  class="mx-0.5 text-base text-ink-gray-4"
                >
                  /
                </span>
              </Show>
            </li>
          )}
        </For>
      </ol>
    </nav>
  )
}

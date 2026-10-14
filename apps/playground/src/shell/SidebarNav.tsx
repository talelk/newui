import { A, useLocation } from '@solidjs/router'
import { For, type JSX, Show } from 'solid-js'
import { NAV, type NavItem } from './nav'

function isCurrent(pathname: string, href: string): boolean {
  const target = href.split('?')[0] ?? href
  if (target === '/') return pathname === '/'
  return pathname === target || pathname.startsWith(`${target}/`)
}

function Link(props: { item: NavItem; current: boolean }): JSX.Element {
  return (
    <li>
      <A
        href={props.item.href}
        aria-current={props.current ? 'page' : undefined}
        class="flex items-baseline gap-2 rounded-4 px-2 py-1 text-sm text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring aria-[current=page]:bg-surface-gray-2 aria-[current=page]:text-ink-gray-9"
      >
        <span class="min-w-0 flex-1">{props.item.title}</span>
        <Show when={props.item.status}>
          {(status) => (
            <span
              class="shrink-0 rounded-3 px-1 text-xs"
              classList={{
                'bg-surface-blue-2 text-ink-blue-8': status() === 'new',
                'bg-surface-amber-2 text-ink-amber-8': status() === 'beta',
              }}
            >
              {status()}
            </span>
          )}
        </Show>
      </A>
    </li>
  )
}

/**
 * The section-scoped sidebar. Rendered inside the site grid rather than fixed,
 * so it scrolls with the document on a short page and sticks on a long one; the
 * `overflow-y-auto` + `max-h` pair keeps a 40-item section reachable without
 * nesting a scroll container inside the page scroll.
 */
export function SidebarNav(): JSX.Element {
  const location = useLocation()

  return (
    <nav aria-label="Documentation" class="flex flex-col gap-6">
      <For each={NAV}>
        {(section) => (
          <div class="flex flex-col gap-1">
            <h2 class="px-2 text-xs font-medium tracking-wide text-ink-gray-5 uppercase">
              {section.title}
            </h2>
            <ul class="flex flex-col gap-0.5">
              <For each={section.items}>
                {(item) => (
                  <Link
                    item={item}
                    current={isCurrent(location.pathname, item.href)}
                  />
                )}
              </For>
            </ul>
          </div>
        )}
      </For>
    </nav>
  )
}

import { A, useLocation } from '@solidjs/router'
import { For, type JSX, Show } from 'solid-js'
import { NAV, SECTION_ICONS, sectionFor } from './nav'

/** Shared destinations and contextual links for the rail and mobile drawer. */
export function SidebarNav(props: {
  collapsed?: boolean
  context?: () => JSX.Element
}): JSX.Element {
  const location = useLocation()
  const current = () => sectionFor(location.pathname)
  return (
    <nav aria-label="Documentation" class="flex flex-col gap-1">
      <For each={NAV}>
        {(section) => (
          <div
            classList={{
              'mt-4 border-t border-outline-gray-1 pt-3':
                section.title === 'Internals',
            }}
          >
            <A
              href={section.items[0]?.href ?? '/'}
              aria-label={props.collapsed ? section.title : undefined}
              title={props.collapsed ? section.title : undefined}
              aria-current={current() === section ? 'true' : undefined}
              class="flex min-h-8 items-center gap-2 rounded-3 px-2 text-interface text-ink-gray-6 hover:bg-surface-gray-2 focus-visible:focus-ring aria-[current=true]:bg-surface-gray-2 aria-[current=true]:text-ink-gray-9"
            >
              <span
                aria-hidden="true"
                class={`${SECTION_ICONS[section.title]} size-4 shrink-0`}
              />
              <Show when={!props.collapsed}>
                <span>
                  {section.title === 'Internals' ? 'Developer' : section.title}
                </span>
              </Show>
            </A>
            <Show
              when={
                !props.collapsed &&
                (current() === section || section.title === 'Internals')
              }
            >
              <div class="my-2 ms-3 border-s border-outline-gray-1 ps-2">
                <Show
                  when={
                    props.context &&
                    ['Components', 'Blocks', 'Charts', 'Editors'].includes(
                      section.title,
                    )
                  }
                  fallback={
                    <ul class="flex flex-col gap-1">
                      <For each={section.items}>
                        {(item) => (
                          <li>
                            <A
                              href={item.href}
                              aria-current={
                                location.pathname === item.href
                                  ? 'page'
                                  : undefined
                              }
                              class="block rounded-3 px-2 py-1 text-interface text-ink-gray-6 hover:bg-surface-gray-2 focus-visible:focus-ring aria-[current=page]:text-ink-gray-9 aria-[current=page]:bg-surface-gray-2"
                            >
                              {item.title}
                            </A>
                          </li>
                        )}
                      </For>
                    </ul>
                  }
                >
                  {props.context?.()}
                </Show>
              </div>
            </Show>
          </div>
        )}
      </For>
    </nav>
  )
}

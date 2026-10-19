import {
  MobileNav,
  MobileNavItem,
  ResponsiveShell,
  Sidebar,
  SidebarItem,
} from '@newui/ui'
import { createSignal, For, type JSX } from 'solid-js'

/** Registered in `demos.tsx`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  const [tab, setTab] = createSignal('board')
  return (
    <div class="h-[26rem] overflow-hidden rounded-6 border border-outline-gray-1">
      <ResponsiveShell
        title="Pipeline"
        label="Pipeline navigation"
        sidebar={
          <Sidebar width="14rem" ariaLabel="Pipeline">
            <For each={['Board', 'List', 'Owners', 'Settings']}>
              {(entry) => (
                <SidebarItem
                  label={entry}
                  prefix={
                    <span class="lucide-handshake size-4" aria-hidden="true" />
                  }
                >
                  {entry}
                </SidebarItem>
              )}
            </For>
          </Sidebar>
        }
        mobileNav={
          <MobileNav aria-label="Pipeline tabs">
            <For
              each={[
                { id: 'board', label: 'Board' },
                { id: 'list', label: 'List' },
                { id: 'owners', label: 'Owners' },
              ]}
            >
              {(entry) => (
                <MobileNavItem
                  label={entry.label}
                  icon="lucide-columns-3"
                  active={tab() === entry.id}
                  onClick={() => setTab(entry.id)}
                />
              )}
            </For>
          </MobileNav>
        }
      >
        <div class="p-4 text-ink-gray-7">
          <p>
            Drag the demo edge, or narrow the window, to see the frame change.
          </p>
        </div>
      </ResponsiveShell>
    </div>
  )
}

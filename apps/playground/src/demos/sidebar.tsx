import {
  Sidebar,
  SidebarCollapseToggle,
  SidebarHeader,
  SidebarItem,
} from '@newui/ui'
import { createSignal } from 'solid-js'
export default function Demo() {
  const [active, setActive] = createSignal('Overview')
  return (
    <div class="h-80 overflow-hidden rounded-5 border border-outline-gray-1">
      <Sidebar width="15rem" ariaLabel="Demo sidebar">
        <SidebarHeader
          title="Acme workspace"
          subtitle="A clearer way to work"
        />
        <SidebarItem
          active={active() === 'Overview'}
          onClick={() => setActive('Overview')}
        >
          Overview
        </SidebarItem>
        <SidebarItem
          active={active() === 'Reports'}
          onClick={() => setActive('Reports')}
        >
          Reports
        </SidebarItem>
        <div class="mt-auto">
          <SidebarCollapseToggle />
        </div>
      </Sidebar>
    </div>
  )
}

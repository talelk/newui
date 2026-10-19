import {
  MobileNav,
  MobileNavItem,
  MobileShell,
  PageHeaderMobile,
} from '@newui/ui'
import { createSignal } from 'solid-js'
export default function Demo() {
  const [active, setActive] = createSignal('Home')
  return (
    <div class="relative h-80 overflow-hidden rounded-5 border border-outline-gray-1 transform-gpu">
      <MobileShell
        header={<PageHeaderMobile title={active()} />}
        nav={
          <MobileNav aria-label="Demo navigation">
            <MobileNavItem
              label="Home"
              icon="lucide-house"
              active={active() === 'Home'}
              onClick={() => setActive('Home')}
            />
            <MobileNavItem
              label="Reports"
              icon="lucide-chart-no-axes-combined"
              active={active() === 'Reports'}
              onClick={() => setActive('Reports')}
            />
          </MobileNav>
        }
      >
        <p class="p-4 text-interface text-ink-gray-7">
          {active()} content stays between the pinned header and navigation.
        </p>
      </MobileShell>
    </div>
  )
}

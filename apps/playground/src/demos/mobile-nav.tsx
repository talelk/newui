import { MobileNav, MobileNavItem } from '@newui/ui'
import { createSignal } from 'solid-js'
export default function Demo() {
  const [active, setActive] = createSignal('Home')
  return (
    <MobileNav aria-label="Demo primary navigation">
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
      <MobileNavItem
        label="Settings"
        icon="lucide-settings-2"
        active={active() === 'Settings'}
        onClick={() => setActive('Settings')}
      />
    </MobileNav>
  )
}

# AppShell

The one responsive application frame: one integrated sidebar and the page it opens.

## Usage

```tsx
import { AppShell } from '@newui/templates'
import { SidebarItem } from '@newui/organisms'
import { Dropdown } from '@newui/molecules'

<AppShell
  title="Projects"
  brand={<Brand />}
  tenant={<TenantSwitcher />}
  navigation={[
    { label: 'Workspace', items: [
      { label: 'Projects', icon: 'lucide-folders', route: '/', active: true },
    ] },
    { label: 'Reports', items: [
      { label: 'Revenue', icon: 'lucide-chart-no-axes-combined', route: '/reports' },
    ] },
  ]}
  settings={<SidebarItem label="Settings" icon="lucide-settings" route="/settings">Settings</SidebarItem>}
  account={<AccountMenu />}
>
  <PageContent />
</AppShell>
```

The template owns responsive layout and collapse behavior. The app owns the
brand, tenant selection, routes, settings action and account behavior. There is
one sidebar model: no separately supplied rail, desktop sidebar or mobile nav.

## Props

| prop | type | notes |
| --- | --- | --- |
| `brand` | `JSX.Element` | app logo/name at the top of the sidebar |
| `brandCollapsed` | `JSX.Element` | compact brand mark; defaults to the full brand |
| `tenant` | `JSX.Element` | tenant/workspace switcher, usually a Dropdown |
| `tenantCollapsed` | `JSX.Element` | compact tenant action in icon-only mode |
| `navigation` | `AppSidebarGroup[]` | headings, icons, active routes, counts and group actions |
| `navigationContent` | `JSX.Element \| (() => JSX.Element)` | advanced custom menu inside the same sidebar; use the function form when it reads `useSidebar()` |
| `sidebarSearch` | `JSX.Element` | optional fixed filter above the scrolling groups |
| `settings` | `JSX.Element` | pinned utility action above the account |
| `account` | `JSX.Element` | pinned user/account control |
| `accountCollapsed` | `JSX.Element` | compact account control while collapsed |
| `collapsed` | `boolean` | controlled desktop icon-collapse state |
| `onCollapsedChange` | `(collapsed: boolean) => void` | collapse change callback |
| `title` | `JSX.Element` | page title, rendered as the page's `h1` |
| `description` | `JSX.Element` | optional page explanation |
| `breadcrumbs` | `BreadcrumbItem[]` | optional page trail |
| `actions` | `JSX.Element` | page-level actions |
| `headerActions` | `JSX.Element` | actions in the shell header |
| `mobileTitle` | `JSX.Element` | title in the mobile bar; defaults to `title` |
| `footer` | `JSX.Element` | page footer inside the content scroller |
| `navLabel` | `string` | accessible navigation/drawer name |
| `children` | `JSX.Element` | page content |
| `class` | `string` | merged into the shell root |

## Behavior and accessibility

- Desktop has one full sidebar. Collapse changes it to labelled icons with
  tooltips; it never becomes a second rail beside the navigation.
- Mobile opens the same expanded navigation in a modal drawer. Escape closes it,
  focus returns to the trigger, and selecting a destination closes the drawer.
- The navigation list scrolls independently. Brand, tenant, settings and account
  remain in their fixed regions; the settings/account controls stay at the foot.
- `navigation` groups support multiple sections, optional headings/actions,
  active links, counts, icons and app-owned click handlers.
- For custom `navigationContent` that reads `useSidebar()`, pass a render
  function (`() => <CustomNavigation />`); it is evaluated inside the sidebar
  provider so collapse state reaches the content.
- The tenant switcher is a slot: changing tenants is application behavior, not
  a framework policy or an authentication backend.
- One document `h1`; the mobile bar is a `span` and does not duplicate it.

## Deliberately not included

- No app rail or second navigation column.
- No authentication provider, tenant backend, router dependency or persistence
  policy. Use `collapsed`/`onCollapsedChange` when the app owns persistence.
- No dashboard/list/detail/auth-specific frame variants. Use `PaneLayout` for
  split content and `AuthLayout` for public access screens.

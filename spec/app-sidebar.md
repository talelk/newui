# AppSidebar

The single navigation organism an application shell needs: app identity and
tenant at the top, a grouped menu, utilities and account at the bottom.

## Composition

```tsx
import { AppSidebar } from '@talelk/newui-organisms'
import { Dropdown } from '@talelk/newui-molecules'
import { SidebarItem } from '@talelk/newui-organisms'

<AppSidebar
  brand={<Brand />}
  tenant={<Dropdown options={tenants}>Acme · Production</Dropdown>}
  groups={[{ label: 'Workspace', items }]}
  settings={<SidebarItem label="Settings" icon="lucide-settings">Settings</SidebarItem>}
  account={<AccountMenu />}
/>
```

`AppShell` composes this organism into its one responsive navigation region. It
does not create a separate app rail.

## Props

| prop | type | notes |
| --- | --- | --- |
| `brand` | `JSX.Element` | required app name/logo |
| `brandCollapsed` | `JSX.Element` | optional compact brand mark |
| `tenant` | `JSX.Element` | tenant/workspace switcher |
| `tenantCollapsed` | `JSX.Element` | optional compact tenant action |
| `search` | `JSX.Element` | optional fixed control above the scrolling groups |
| `groups` | `AppSidebarGroup[]` | grouped headings/actions and icon rows |
| `children` | `JSX.Element \| (() => JSX.Element)` | advanced custom menu within the same sidebar; use the function form when it reads `useSidebar()` |
| `settings` | `JSX.Element` | pinned utility slot |
| `account` | `JSX.Element` | pinned user/account slot |
| `accountCollapsed` | `JSX.Element` | compact user control |
| `width` | `string` | expanded width; defaults to `16rem` |
| `collapsedWidth` | `string` | icon width; defaults to `3.5rem` |
| `collapsed` | `boolean` | controlled collapse state |
| `onCollapsedChange` | `(collapsed: boolean) => void` | collapse callback |
| `collapsible` | `boolean` | show collapse control; defaults to `true` |
| `ariaLabel` | `string` | navigation landmark name |

`AppSidebarItem` is `{ label, icon?, count?, active?, route?, href?, onClick? }`.
`AppSidebarGroup` is `{ label?, action?, items }`. Items become labelled icon
controls with tooltips in collapsed mode; the app owns active-route state.

## Behavior

- Brand/tenant stay fixed above the scroll region. Menu groups scroll; settings,
  account and the collapse control stay in the footer.
- Multiple labeled groups and group-level actions are supported.
- The sidebar has no app-rail sibling. App identity and all destinations live in
  this one navigation surface.
- Custom `children` that reads `useSidebar()` must be a render function
  (`() => <CustomNavigation />`), so it is evaluated inside the sidebar provider
  and reacts to collapse; an already-created element has already captured the
  caller's context.

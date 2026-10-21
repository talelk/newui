# Sidebar

The collapsible navigation organism used inside `AppSidebar`.

## Anatomy

```tsx
import {
  Sidebar,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarCollapseToggle,
} from '@newui/organisms'

<Sidebar ariaLabel="Workspace navigation">
  <SidebarHeader title="Workspace" subtitle="Production" />
  <SidebarLabel>Workspace</SidebarLabel>
  <SidebarItem icon="lucide-house" active route="/">Home</SidebarItem>
  <SidebarSection label="Projects" collapsible>
    <SidebarItem icon="lucide-folder-kanban" route="/projects">Projects</SidebarItem>
  </SidebarSection>
  <SidebarCollapseToggle />
</Sidebar>
```

Application code should normally use the complete `AppSidebar` inside
`AppShell`; use `Sidebar` when composing a specialized organism.

## Parts

| part | notes |
| --- | --- |
| `Sidebar` | named `<nav>` with controlled/uncontrolled collapse, width and icon-only width |
| `SidebarHeader` | title, subtitle, logo and optional header actions |
| `SidebarLabel` | group label, optional group action, divider when collapsed |
| `SidebarItem` | icon row; `route` is in-app, `href` external, otherwise button |
| `SidebarCollapseToggle` | `SidebarItem` that toggles collapse |
| `SidebarSection` | labelled, optionally collapsible group with `aria-controls` |
| `SidebarSearch` | labelled search field, hidden while collapsed |
| `SidebarCard` | compact optional status/upgrade card, hidden while collapsed |
| `SidebarTrigger` | compact icon button that toggles collapse |

## Behavior and accessibility

- Controlled via `collapsed`/`onCollapsedChange`, otherwise the sidebar owns its
  state. `⌘B`/`Ctrl+B` toggles unless `shortcut={false}`.
- In collapsed mode, item text becomes visually hidden but remains the accessible
  name; a tooltip exposes the label. There is no separate rail API.
- Sections keep their body mounted and use `hidden`, so `aria-controls` always
  resolves.
- In-app `route` and external `href` render anchors; callers own active state.
  Active links carry `aria-current="page"`.
- Item suffixes render outside the link, so a trailing action remains valid HTML.

## Styling hooks

`data-slot` on each part (`sidebar`, `sidebar-header`, `sidebar-label`,
`sidebar-item`, `sidebar-section`, `sidebar-card`), plus `data-state` and
`data-active` where applicable. No rail slot exists.

# Sidebar

The desktop navigation rail: a labelled sidebar with a header, items, an
optional collapsed rail, collapsible sections and status cards.

## Anatomy

```tsx
<Sidebar collapsible defaultCollapsed={false}>
  <SidebarHeader title="Acme" />
  <SidebarSection label="Workspace" collapsible>
    <SidebarItem active prefix={<Icon icon="lucide-house" />}>
      Home
    </SidebarItem>
  </SidebarSection>
  <SidebarCard theme="amber" title="Trial" description="6 days left" action={{ label: 'Upgrade' }} />
  <SidebarCollapseToggle />
</Sidebar>
```

`SidebarRail` + `SidebarRailItem` are the icon-only rail for a collapsed shell.

## Parts

| part | notes |
| --- | --- |
| `Sidebar` | `<nav>` landmark; `collapsible` (default `true`), `collapsed`/`onCollapsedChange`, `collapsedWidth` (3rem), `ariaLabel` (Main). Auto-collapses below `sm` when uncontrolled. |
| `SidebarHeader` | `title`/`subtitle`, `logo`/`showLogo`, collapse-aware. |
| `SidebarLabel` | group label; `divider` swaps it for a rule while collapsed. |
| `SidebarItem` | row; `active`, `label` (accessible name + native tooltip when collapsed), `prefix`/`suffix`. |
| `SidebarRail` / `SidebarRailItem` | icon-only rail; item `variant` (`subtle`/`ghost`), `description`, `badge` + `badgeStyle` (`count`/`dot`), active indicator, tooltip. |
| `SidebarCollapseToggle` | a `SidebarItem` that toggles the sidebar; `expandLabel`/`collapseLabel`. |
| `SidebarSection` | labelled, optionally collapsible group (accordion ARIA). |
| `SidebarCard` | compact status card: `theme`, `title`, `description`, `icon`, `action`, `dismissible`. |

`useSidebar()` returns `{ collapsed, toggle }` for a custom toggle.

## Behavior

- **Collapse.** Controlled via `collapsed`/`onCollapsedChange`, else the sidebar
  tracks its own state and collapses below `sm`. A collapsed item's label moves
  to `title`/`aria-label` and its text becomes `sr-only`.
- **Section.** `collapsible` renders an accordion heading (`aria-expanded` +
  `aria-controls`); the body unmounts when collapsed.

## Styling hooks

`data-slot` on every part (`sidebar`, `sidebar-header`, `sidebar-label`,
`sidebar-item`, `sidebar-rail`, `sidebar-rail-item`, `sidebar-section`,
`sidebar-card`), plus `data-state` (`collapsed`/`expanded`, `active`/`inactive`)
and `data-theme` on the card.

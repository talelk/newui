---
'@newui/organisms': minor
---

`AppSidebar` can fold. It now forwards the sidebar's collapse state —
`collapsible`, `collapsed`, `onCollapsedChange` and `collapsedWidth` — and
renders the frappe-shaped `SidebarCollapseToggle` at its foot (below the
scroll region, dropped when `collapsible={false}`). Previously the block
rendered a bare `Sidebar` with no visible fold control: ⌘B worked, but
nothing on screen said so. Items without an `icon` fold to a tooltip-only
row, as `SidebarItem` already specifies.

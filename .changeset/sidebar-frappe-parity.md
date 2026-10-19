---
'@newui/ui': minor
'@newui/blocks': minor
---

Sidebar family reaches frappe-ui parity. `SidebarItem` and
`SidebarRailItem` gain `route`/`href` link rendering (route wins, `onClick`
still fires for router interception) and mark the active row with
`aria-current="page"`. `SidebarItem` gains an `icon` prop (used when
`prefix` is unset), derives its collapsed tooltip label from string
children, and renders `suffix` beside the link instead of inside it, so a
menu button there is valid HTML. `SidebarSection` can be controlled via
`collapsed`/`onCollapsedChange`. `SidebarCard` actions receive
`{ dismiss }`. `AppSidebar` items pass `route`/`href` through.

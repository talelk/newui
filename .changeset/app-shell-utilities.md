---
'@talelk/newui-organisms': minor
'@talelk/newui-templates': minor
---

The application sidebar's fold becomes chrome instead of a menu row: `Collapse`
sits at the end of the identity block and the rail repeats an `Expand` control
under the tenant, so the footer is free for settings and account. `AppSidebar`
now binds `⌘B`/`Ctrl+B` like the bare `Sidebar`, and its trigger tooltip only
advertises the shortcut when it is real.

`AppShell` and `AppSidebar` accept a `utilities` slot, rendered above Settings
while the sidebar is expanded, and a compact `utilitiesCollapsed` form so a
global control such as the theme switch does not disappear in the rail. Group
labels drop to 12px Ink Muted, active rows gain weight and a tinted count, and
counts join the collapsed tooltip. The mobile drawer pins its close control in
a 40px header, keeps the navigation list as the only scroller, and uses an
opaque surface in dark mode.

The page heading and its actions now share one row; breadcrumbs sit above them.

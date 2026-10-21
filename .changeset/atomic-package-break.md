---
'@newui/atoms': major
'@newui/molecules': major
'@newui/organisms': major
'@newui/templates': major
'@newui/data': major
---

Clean break to the atomic public API. The `@newui/ui`, `@newui/blocks` and
`@newui/layouts` packages are removed; consumers import atoms, molecules,
organisms and templates from the new package names. No compatibility barrels,
deprecated shell adapters or legacy route redirects are shipped.

`@newui/templates` now exposes exactly `AppShell`, `PaneLayout` and
`AuthLayout`. `AppShell` owns one responsive sidebar with tenant, grouped
navigation and pinned settings/account controls; split rail/sidebar composition
is removed. `DataTable`, `ScrollTable` and `VirtualList` move from the logic
package into the atomic visual packages, leaving `@newui/data` headless.

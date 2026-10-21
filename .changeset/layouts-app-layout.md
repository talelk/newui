---
'@newui/templates': major
---

The template package now has exactly three public compositions: `AppShell`,
`PaneLayout` and `AuthLayout`. `AppShell` replaces the intermediate `AppLayout`
API and is the only application frame. Its one responsive sidebar owns app
identity, tenant selection, grouped navigation, collapse-to-icons, and pinned
settings/account actions. `PaneLayout` is an in-shell two-pane arrangement;
`AuthLayout` is the public-access frame. There are no separate desktop/mobile
shells or rail/sidebar pairing.

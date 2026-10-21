---
'@newui/templates': major
'@newui/organisms': major
---

The final template API is a clean break from the intermediate
`DesktopShell`/`MobileShell`/`ResponsiveShell` design. `AppShell` owns one
responsive sidebar model: it docks and collapses to labelled icons on desktop,
and the same expanded menu opens as a modal drawer on mobile. The brand, tenant,
grouped destinations, settings and account actions remain in that single
navigation surface. No separate rail, mobile-only shell or compatibility
wrapper is exported.

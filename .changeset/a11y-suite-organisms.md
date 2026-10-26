---
"@talelk/newui-organisms": patch
---

Every organism now carries a dedicated axe accessibility suite in both of its
rendered states (twelve new `*.a11y.test.tsx` files, from `AppSidebar` to
`VirtualList`), and the package's export pin lists the whole public surface
(`DataState`, `Section`, `SelectionBar` were unpinned). No axe rule beyond the
two baseline suppressions was disabled anywhere; no violations surfaced.

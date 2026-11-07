---
'@talelk/newui-organisms': minor
'@talelk/newui-templates': minor
---

Sidebar and AppShell polish.

- **Rail:** the Expand control heads the footer instead of taking a ruled row
  under the tenant, so the collapsed rail reads as one column of identity and
  destinations above one column of square controls.
- **Footer:** while expanded, `settings` and `utilities` share one row.
- **`settings` accepts a render function** (`settings={() => <SidebarItem …/>}`)
  so a `SidebarItem` renders inside the sidebar and follows the collapsed rail;
  a caller-created element kept its expanded padding and sat off-centre.
- **Mobile drawer:** the brand row is the header, with Close at its end; the
  separate "Navigation" bar is gone and the drawer is 288px wide.
- **Top bar (below lg):** sits on the Mist frame with a ghost menu button.

---
'@talelk/newui-molecules': minor
'@talelk/newui-organisms': patch
'@talelk/newui-atoms': patch
'@talelk/newui-tailwind': minor
---

Record sheets, settings rows and open fixes.

- **`Dialog.Content position="end"`** — a full-height side sheet on the
  inline-end edge: it scrolls as one region, `Dialog.Footer` pins to its bottom
  edge, and it slides in from that edge (`animate-sheet-in`, mirrored for RTL).
  For reading or editing a record beside the list it came from.
- **SettingsDialog rows** are a ruled two-column grid with a fixed control
  track that text fields fill; switches keep their size at its end.
- **WidgetGrid** bodies that overflow become focusable regions, named for their
  widget (axe `scrollable-region-focusable`); short bodies add no tab stop.
- **Merge:** bare side and corner radii (`rounded-t`, `rounded-ss`, …) now
  override their numbered steps in `cn()`, as `rounded` already did.
- **DataTable** shows its empty state in the card column below the card
  breakpoint, where the table is hidden — an emptied view on a phone showed
  nothing. Its inline edit, sort, column-menu and expander controls (and the
  Password reveal toggle) use the control radius.

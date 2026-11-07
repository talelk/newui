---
'@talelk/newui-tokens': minor
'@talelk/newui-tailwind': minor
'@talelk/newui-atoms': minor
'@talelk/newui-molecules': minor
'@talelk/newui-organisms': minor
'@talelk/newui-templates': minor
'@talelk/newui-charts': patch
---

The instrument-panel look (ADR-0016): the kit retuned for people who work
inside records all day. This is a visible change for every consumer.

- **Tokens.** A hand-authored layer over the Figma export: a cool gray family
  (a Mist frame, white sheets for data, Graphite ink), the `blue` theme retuned
  to Petrol as the single accent, a solid Petrol focus ring, radius by role
  (4px controls, 6px sheets, 8px overlays) and one new semantic token,
  `surface-canvas`.
- **Type.** IBM Plex Sans replaces Inter (self-hosted, SIL OFL), with 13px
  interface text. Its figures are tabular by default; table headers use its
  semi-condensed width. `font-stretch-*` joins the merge vocabulary.
- **Density.** `DataTable` defaults to `density="compact"` (about 28px rows;
  `comfortable` is about 36px), and table cell spacing tightens everywhere,
  including the `Table` molecule.
- **AppShell** paints the Mist frame and folds the page header into one compact
  band: the trail, then the title with its description and the actions.
- **StatGrid** is one ruled strip instead of a row of cards; deltas are toned
  text.
- **FilterBar** keeps a lone result count on the control row.
- **Sidebar** items are 28px; the current destination is a white sheet with a
  Petrol icon; counts are plain figures.
- **DataTable** marks the row holding keyboard focus with a Petrol edge.

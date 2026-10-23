---
'@talelk/newui-organisms': major
---

`DataTable` gains `rowSelectable`, which disables selection for ineligible rows
and makes select-all skip them, and mobile cards driven by `meta.mobile` on
column definitions. When any column declares `mobile`, rows render as cards
below `sm`; the library owns the card, selection and pagination, and the column
cell renders unchanged. With no mobile metadata the table keeps its existing
horizontal-scroll behaviour.

`FilterBar`'s `tabs` config now requires `label`, forwarded to the segmented
radiogroup. This is a breaking prop change for every FilterBar with a view
switcher.

`StatGrid` gains `compact`, which drops the icon tile, uses 10px card padding
and a 4px gap for table-led screens, and moves to a two-up grid from 360px.
`DataTable` gains `caption` for page context beside Search.

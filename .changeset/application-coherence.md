---
'@talelk/newui-atoms': patch
'@talelk/newui-molecules': patch
'@talelk/newui-organisms': minor
'@talelk/newui-templates': patch
'@talelk/newui-charts': patch
'@talelk/newui-editor': patch
---

Application coherence pass across the twelve example applications.

- **Atoms:** checked/indeterminate Checkbox now paints a semantic check icon that
  is legible in both themes and disabled states; Switch thumbs contrast against
  both track states; required markers use a passing red step; disabled solid
  blue actions use the neutral disabled treatment; Password keeps its visual
  size with a larger coarse-pointer hit area.
- **Molecules:** Card descriptions use the interface type role; `ListRow` only
  advertises pointer/hover when it is actionable; TabButtons fluid tracks can
  shrink at 320/150%; editor mention surfaces use the overlay radius; a
  controlled DateRangePicker holds the first click as a draft until the range
  completes.
- **Organisms:** DataTable gains `cardBreakpoint`, a stable titled toolbar,
  humanized column labels, compact mobile paging, guarded external empty
  actions, a bottom spacer for the sticky selection bar, and selection only
  when a bulk action exists; Section gains explicit accessible naming; DataState
  accepts an empty-state icon; SettingsDialog has stable desktop width, true
  mobile full-bleed, 40px mobile nav/close, an accessible tablist label and
  logical RTL borders; AuthCard is card-only and flat; KanbanBoard restores
  focus after keyboard moves, uses 40px touch targets below `lg`, and fits four
  columns at 1440; PageToolbar uses an ellipsis menu, icons on secondary
  actions and the section scale for nested headings; FilterBar selects are
  two-up from 360px; StatGrid compact is four-up at `md`.
- **Templates:** AppShell's mobile menu trigger is 40px.
- **Charts:** ChartLegend renders static text when it has no handler; NumberCard
  titles wrap under text zoom and its loading state reserves card geometry;
  time-axis labels format the numeric timestamp ECharts passes, so monthly
  plots keep their month ticks; axis charts reserve the label band.
- **Editor:** toolbar and mention surfaces follow the card/overlay radius scale.

Existing props remain valid; the new state and layout props are additive.

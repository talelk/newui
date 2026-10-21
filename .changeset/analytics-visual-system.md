---
"@newui/atoms": major
"@newui/molecules": major
"@newui/tokens": minor
"@newui/tailwind": major
"@newui/charts": major
"@newui/organisms": major
"@newui/editor": minor
"@newui/code-editor": minor
---

Adopt compact analytics styling: 32px default controls, outlined text entry,
6px control corners, border-led cards and role typography. Style NumberCard,
clarify dark chart palettes, and align block controls with the shared defaults.
See spec/migrations.md for explicit props that retain previous defaults.

Chart engines are registered by their wrapper. Raw ChartBase/useChart consumers
register their own mark and coordinate-system modules through ECharts core.

Typography utilities retain their names and use rem sizes so user text scaling
is respected. Controls, badges and metrics reflow instead of clipping enlarged
labels. All input families share Field help/error wiring without remounting
uncontrolled state when validation appears. Settings tabs support vertical
arrow, Home and End navigation.

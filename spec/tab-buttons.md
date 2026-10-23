# TabButtons

A segmented choice without panels. `label` names the radiogroup and is
required. `options` contains string `label`/`value`, optional icon and disabled
state. Use `value`/`onValueChange`, or `defaultValue` for an uncontrolled
initial selection. The default is the first option.

Variants and sizes share the Tabs visual vocabulary: default `subtle`, default
`sm` (28px), explicit `md` (32px). `vertical` stacks options; `wrap` lays them
out on multiple rows instead of scrolling horizontally; `fluid` distributes
their widths equally. `edge` controls a vertical browser-tab attachment.

The root is a labelled `role="radiogroup"`; each option is a `role="radio"` with
`aria-checked`. One option is in the tab order. Arrow keys move and select,
skip disabled options and wrap. Horizontal movement follows computed writing
direction; vertical movement uses Up/Down. Home and End select the first and
last enabled options. Enter/Space retain native button activation. Every
trigger has visible focus.

`wrap` hides the absolute sliding indicator, which assumes one row; the active
option then carries a variant-aware surface (a filled pill for subtle/ghost, a
bottom rule for underline, a card edge for browser-tab). Use it where the full
choice set must stay visible on narrow screens.

Hooks include `tab-buttons`, `tab-trigger`, `tab-indicator`, `data-wrap`,
`data-value`, `data-state`, `data-size` and `data-variant`.

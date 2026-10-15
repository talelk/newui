# TabButtons

A segmented choice without panels. `options` contains string `label`/`value`,
optional icon and disabled state. Use `value`/`onValueChange`, or `defaultValue`
for an uncontrolled initial selection. The default is the first option.

Variants and sizes share the Tabs visual vocabulary: default `subtle`, default
`sm` (28px), explicit `md` (32px). `vertical` stacks options; `fluid` distributes
their widths equally. `edge` controls a vertical browser-tab attachment.

Only the selected button is in the tab order. Arrow keys move and activate,
skip disabled options and wrap. Horizontal movement follows computed writing
direction; vertical movement uses Up/Down. Home and End select the first and
last enabled options. Enter/Space retain native button activation.

The existing tablist/tab semantics and `aria-selected` state are retained.
For choices that own panels, use Tabs instead. Every trigger has visible focus.
Hooks include `tab-buttons`, `tab-trigger`, `tab-indicator`, `data-value`,
`data-state`, `data-size` and `data-variant`.

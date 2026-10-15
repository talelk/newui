# Tabs

Tabs.Root, Tabs.List, Tabs.Trigger and Tabs.Content compose a Zag tab interface.
`value`/`onValueChange` control selection; `defaultValue` supplies an initial
selection. Triggers and panels share a string `value`.

The root defaults to horizontal, automatic activation, `variant="underline"`
and `size="sm"`. Tabs.List may override the root's variant, size, orientation
and browser-tab attachment edge. Variants are `underline`, `subtle`, `ghost`,
and `browser-tab`; sizes are `sm` (28px) and `md` (32px). Horizontal pill tracks
include their padding within this height. Vertical lists retain their own track
padding while each trigger follows the size scale.

Zag owns arrow/Home/End keys, activation, disabled triggers, roving focus,
tab/panel relationships and direction. The shared indicator measures the active
trigger, including RTL and fractional geometry. Indicator transitions respect
reduced motion. Focus remains visible independently of selection.

Hooks: `data-slot` on tabs/list/trigger/content/indicator and state/size/variant
attributes. Customisation uses root classes and data attributes.

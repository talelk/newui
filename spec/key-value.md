# KeyValue

One label/value pair: the row a settings page repeats for "Email digests —
Weekly" and "Plan — Team".

## Usage and anatomy

Import `KeyValue` from `@talelk/newui-atoms`. Pass `label` and either `value`
or children (children win). `orientation="vertical"` stacks the pair where the
value is long. A group of pairs stacks as plain siblings; the row owns no list
semantics and renders no roles.

## Behavior and accessibility

The row is display-only: no input, no controlled state, nothing focusable
unless the app passes interactive content into the value. The label is the
quiet half; the value carries tabular figures so numeric values line up.
Labels and values remain legible in both colour schemes and at 200%
enlargement; long values wrap, never truncate.

## Styling and responsive behavior

Use semantic tokens and the `data-slot` hooks (`key-value`,
`key-value-label`, `key-value-value`). At narrow widths the horizontal pair
wraps; prefer `vertical` where the value must not wrap.

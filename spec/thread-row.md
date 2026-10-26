# ThreadRow

One discussion thread in a list: subject, a one-line preview, and its meta —
replies and age.

## Usage and anatomy

Import `ThreadRow` from `@talelk/newui-molecules`. A space's thread list
stacks the rows as plain siblings inside its own scroll container. The row
renders as a `div` by default; pass `as="button"` (or `as="a"` with `href`)
to make the whole row the open action. `avatar` takes the community or author
mark; `meta` carries the reply count and space, `time` the age, `suffix` the
app's follow or mark-read controls.

## Behavior and accessibility

`unread` is carried by text weight and an unread dot, never by colour alone;
`selected` sets `aria-current="true"`. `disabled` mutes the row via
`data-disabled` and does not set the native attribute, so apps skip the
action in their own handler. Suffix controls keep their own accessible names
and stay visible, never hover-only.

## Styling and responsive behavior

Use semantic tokens and `data-slot="thread-row"` with `data-state`,
`data-size`, `data-unread`, `data-selected` and `data-disabled` hooks. Long
subjects and previews truncate to one line each; the meta line may drop
before the subject does at narrow widths.

# MessageListItem

One conversation in a mailbox list: sender, subject, a one-line preview and
its time.

## Usage and anatomy

Import `MessageListItem` from `@talelk/newui-molecules`. A mailbox stacks the
rows as plain siblings inside its own scroll container. The row renders as a
`div` by default; pass `as="button"` (or `as="a"` with `href`) to make the
whole row the open action. `avatar` takes an `Avatar`; `unread`, `selected`,
`time` and `suffix` map to the mailbox's own state and controls.

## Behavior and accessibility

`unread` is carried by text weight and an unread dot, never by colour alone;
`selected` sets `aria-current="true"`. `disabled` mutes the row via
`data-disabled` and does not set the native attribute, so apps skip the
action in their own handler. Suffix controls keep their own accessible names
and stay visible, never hover-only. Keep the preview to one line; the row
truncates it.

## Styling and responsive behavior

Use semantic tokens and `data-slot="message-list-item"` with `data-state`,
`data-size`, `data-unread`, `data-selected` and `data-disabled` hooks. At
narrow widths the snippet drops before the sender does; the time stamp uses
tabular figures so column scans stay aligned.

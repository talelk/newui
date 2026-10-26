# NotificationItem

One notification in a feed or menu: an event icon, what happened, the
affected record and its time.

## Usage and anatomy

Import `NotificationItem` from `@talelk/newui-molecules`. A notification
menu or feed stacks the rows as plain siblings inside its own popover or
panel. The row renders as a `div` by default; pass `as="button"` (or `as="a"`
with `href`) to make the whole row the open action. `icon` names the event
(`lucide-bell` by default); `suffix` carries the app's mark-read and snooze
controls.

## Behavior and accessibility

`unread` is carried by text weight and an unread dot, never by colour alone;
`selected` sets `aria-current="true"`. `disabled` mutes the row via
`data-disabled` and does not set the native attribute, so apps skip the
action in their own handler. Suffix controls keep their own accessible names
and stay visible, never hover-only. The event tile is decorative; the title
carries the meaning.

## Styling and responsive behavior

Use semantic tokens and `data-slot="notification-item"` with `data-state`,
`data-size`, `data-unread`, `data-selected` and `data-disabled` hooks. Keep
rows at a comfortable touch height in narrow viewports; descriptions
truncate to one line.

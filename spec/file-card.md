# FileCard

One file as a tile: a type icon, a name, a meta line and room for the app's
own actions.

## Usage and anatomy

Import `FileCard` from `@talelk/newui-molecules`. A file grid is `FileCard`
siblings inside a grid. The card renders as a `div` by default; pass
`as="button"` (or `as="a"` with `href`) to make the whole tile the open
action. Star, delete and overflow controls ride in through `suffix` — the
card composes app-owned actions and owns none itself. `selected` marks the
current file; `badge` carries a `Shared`-style tag.

## Behavior and accessibility

`selected` sets `aria-current="true"` and the `data-selected` hook; `disabled`
mutes the card via `data-disabled` and does not set the native attribute, so
apps skip the action in their own handler. Trailing controls must stay
visible — never hover-only — and each carries its own accessible name. The
icon tile is decorative; the name carries the meaning.

## Styling and responsive behavior

Use semantic tokens and `data-slot="file-card"` with `data-state`,
`data-size`, `data-selected` and `data-disabled` hooks. Names truncate to one
line; the grid owns wrapping. Keep touch targets at the card's min-height in
narrow viewports.

# `BottomSheet` on the `dialog` machine, not `@zag-js/drawer`

**Status**: accepted

## Context

frappe-ui's `BottomSheet` is a bottom-anchored modal sheet. Zag ships a
`@zag-js/drawer` machine, but it models a **stacked-drawer registry** (iOS-style
multi-level sheets with a shared backdrop), not a single bottom sheet.

## Decision

Build `BottomSheet` on Zag's `dialog` machine (the one `Dialog` uses), with a
grab handle, an optional title, a `90dvh`-capped scroll body, and a
`dismissible` prop controlling Escape/outside-click.

## Rationale

The drawer registry is a different model: adopting it would import a stack
abstraction, a backdrop coordinator and a gesture layer we do not use for a
single sheet. The `dialog` machine already gives focus trapping, Escape and
outside-click. Swipe-to-dismiss is the only missing behaviour, and it is a
gesture, not a machine concern.

## Consequences

- `BottomSheet` is a preset over `Dialog`, not a second modal implementation.
- Swipe-to-dismiss is deferred; the handle is presentational.
- If stacked drawers are ever needed, that is a new component on
  `@zag-js/drawer`, not a flag here.

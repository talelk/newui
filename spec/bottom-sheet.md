# BottomSheet

`BottomSheet` — a bottom-anchored modal sheet: a grab handle, an optional title,
and a scrollable body, capped at `90dvh`. Built on Zag's `dialog` machine (the
same one `Dialog` uses), so focus trapping, Escape and outside-click dismissal
come from the primitive.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `open` | `boolean` | — | controlled |
| `defaultOpen` | `boolean` | `false` | uncontrolled |
| `onOpenChange` | `(open: boolean) => void` | — | |
| `title` | `JSX.Element` | — | centered in the handle area; names the sheet |
| `dismissible` | `boolean` | `true` | outside-click + Escape |
| `class` | `string` | — | merged into the sheet content |

## Behavior

- Modal (`role="dialog"`), focus-trapped, portalled to the body.
- `dismissible={false}` disables both outside-click and Escape dismissal.
- With no `title`, the sheet takes `aria-label="Bottom sheet"`.

## Styling hooks

`data-slot` (`bottom-sheet-backdrop` / `-positioner` / `-content` / `-handle` /
`-title` / `-body`), plus Zag's `data-state`.

## Not yet

Swipe-down-to-close is not implemented; the handle is presentational. The
component uses the `dialog` machine rather than `@zag-js/drawer`, whose stacked
drawer registry is a different model from frappe-ui's sheet.

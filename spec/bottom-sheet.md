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
| `dismissible` | `boolean` | `true` | outside-click + Escape + downward drag |
| `class` | `string` | — | merged into the sheet content |

## Behavior

- Modal (`role="dialog"`), focus-trapped, portalled to the body.
- `dismissible={false}` disables outside-click, Escape and gesture dismissal.
- With no `title`, the sheet takes `aria-label="Bottom sheet"`.

## Styling hooks

`data-slot` (`bottom-sheet-backdrop` / `-positioner` / `-content` / `-handle` /
`-title` / `-body`), plus Zag's `data-state`.

The sheet uses the shared 12px overlay radius on its top corners, an opaque
elevated surface, a semantic border, and a 20px section title.

## Gestures

Drag the handle down by at least 96 CSS pixels to dismiss. A shorter drag snaps
back; cancellation never dismisses. Horizontal gestures do not dismiss. A body
gesture can begin dismissal only at scrollTop zero. Scrolling within content
keeps the sheet open. Snap-back motion is disabled with reduced motion.
Keyboard users can dismiss with Escape when dismissible; provide an explicit
close action for a non-dismissible sheet.

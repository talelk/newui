# VisuallyHidden

Content for assistive tech that takes no space on screen.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `class` | `string` | — | merged into the root, e.g. `focus:not-sr-only` for skip links |
| `children` | `JSX.Element` | — | the hidden content |

## Behavior and accessibility

Use it for the context a sighted user gets but a screen reader does not: a
required marker, a live region, the column a cell belongs to. It is the
`sr-only` utility with a stable `data-slot="visually-hidden"`; do not hide
interactive controls with it — a focusable element inside must become visible
on focus.

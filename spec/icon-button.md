# IconButton

A square, icon-only command sharing the Button recipe's box and states.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `label` | `string` | — | **required** — the accessible name; an icon alone names nothing |
| `icon` | `lucide-*` string or `Component` | — | the glyph (P11) |
| `variant` | `'solid' \| 'subtle' \| 'outline' \| 'ghost'` | `subtle` | |
| `theme` | `'gray' \| 'blue' \| 'green' \| 'red'` | `gray` | |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `sm` | square box at every step |
| `disabled` | `boolean` | — | |
| `href` | `string` | — | external URL; renders an anchor, opens a new tab |
| `route` | `string` | — | in-app destination; wins over `href` |
| `target` | `string` | — | |
| `type` | `'button' \| 'submit' \| 'reset'` | `button` | |
| `class` | `string` | — | merged into the root |

## Behavior and accessibility

`label` becomes the `aria-label`, so the control is never unnamed. Rendering
follows Button: `route`/`href` render an anchor (in-app vs new-tab, per the
shared vocabulary). The box is the Button recipe's `icon` variant — same rest,
pressed, disabled and focus looks; the recipe keeps a touch-safe box.
Styling hooks: `data-slot="icon-button"`, `data-size`, `data-variant`,
`data-color`, `data-disabled` (P10).

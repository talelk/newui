# AvatarGroup

A stack of people with one box each: avatars overlap, and everyone past `max`
collapses into a single "+N" tile.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `avatars` | `AvatarGroupItem[]` | — | `{ image?, label? }` per person, the same pair `Avatar` uses |
| `max` | `number` | `4` | how many render before the overflow count |
| `size` | `AvatarSize` | `md` | xs–3xl, shared with `Avatar` |
| `shape` | `'circle' \| 'square'` | `circle` | |
| `theme` | `AvatarTheme` | `gray` | fallback tiles, including the overflow count |
| `label` | `string` | — | accessible name; adds `role="group"` |
| `class` | `string` | — | merged into the root |

## Behavior and accessibility

Data-driven (like `Avatar`'s own `label`/`image` pair) so the overflow count
stays the group's decision, not each avatar's. The stack is decorative unless
`label` names it. Tiles separate by a surface ring so overlapped boxes stay
legible in both colour schemes; the overlap uses logical margins, so it flips
with writing direction. Styling hooks: `data-slot="avatar-group"`.

## Styling and responsive behavior

The group wraps like inline content. At 200% enlargement the stack keeps its
geometry; give it room or let it wrap.

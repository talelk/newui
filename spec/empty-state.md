# EmptyState

`EmptyState` — what a list, table or panel shows when it has nothing to show.
Plain markup: no machine, no state.

Worth a component rather than three divs per screen, because an empty state is
where a product explains itself. The default pattern (icon, one line of what is
missing, one action) is a decision about tone, and every team re-decides it
badly.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `icon` | `IconProp` | — | a `lucide-*` string or a component (P11) |
| `title` | `JSX.Element` | required | what is missing |
| `description` | `JSX.Element` | — | the one sentence of context |
| `action` | `JSX.Element` | — | usually a primary `Button` |
| `secondaryAction` | `JSX.Element` | — | a quieter escape hatch |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | vertical padding and glyph size |
| `bordered` | `boolean` | `false` | a dashed frame, for a drop zone or a blank panel |
| `class` | `string` | — | |

## Behavior

- `title` is required and `description` is not, so the common case stays one
  line.
- The icon sits in a tinted tile: it reads as a placeholder slot rather than a
  broken image.
- The copy is centred and capped at `max-w-md`, so a long description wraps
  instead of stretching the panel.

## Styling hooks

`data-slot` (`empty-state` / `-icon`) and `data-size`.

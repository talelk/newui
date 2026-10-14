# PageToolbar

`PageToolbar` — the page header: a title, an optional title menu, and the
actions.

## Props

| prop | type | notes |
| --- | --- | --- |
| `title` | `JSX.Element` | required |
| `menu` | `PageToolbarAction[]` | title menu; omitted → no menu |
| `action` | `PageToolbarAction` | the primary action |
| `children` | `JSX.Element` | extra trailing controls, before the primary |
| `class` | `string` | merged into the `PageHeader` |

`PageToolbarAction` is `{ label, icon?, onClick? }`.

## Behavior

- The header is `PageHeader`, not a bare sticky div, so it flips to the pinned
  mobile variant with the shell.
- The title menu is an ellipsis button. A chevron beside a title reads as a
  dropdown *for the title*, which is not what it is; the ellipsis is the
  convention for "more".
- The primary action defaults to a leading `+`. Set `icon` when the action is not
  a creation.

## Not yet

No tabs. A screen with tabs puts `TabButtons` in the page body under this header
rather than inside it — the header is 48px tall and a tab row does not belong in
it.

# PageToolbar

`PageToolbar` — the page header: a title, an optional title menu, and the
actions.

## Props

| prop | type | notes |
| --- | --- | --- |
| `title` | `JSX.Element` | required |
| `headingLevel` | `1 \| 2 \| 3 \| 4` | semantic heading level; defaults to `1` |
| `menu` | `PageToolbarAction[]` | title menu; omitted → no menu |
| `secondary` | `PageToolbarAction[]` | outline actions before the primary |
| `action` | `PageToolbarAction` | the primary action |
| `children` | `JSX.Element` | extra trailing controls, before the primary |
| `class` | `string` | merged into the `PageHeader` |

`PageToolbarAction` is `{ label, icon?, onClick?, loading?, disabled? }`.

## Behavior

- A `headingLevel` above 1 uses the section scale (18px), not the page-heading
  scale, so a toolbar nested under an AppShell H1 does not compete with it.
- The title is a semantic heading, not a span. It defaults to `h1`; a page that
  already has an `AppShell` H1 passes `headingLevel={2}` to make the toolbar a
  section header.
- The header is `PageHeader`, not a bare sticky div, so it flips to the pinned
  mobile variant with the shell.
- The title menu is an ellipsis button. A chevron beside a title reads as a
  dropdown *for the title*, which is not what it is; the ellipsis is the
  convention for "more".
- **No icon is implied.** Pass `icon` when the primary action creates something;
  an export or archive action does not inherit a `+`.

## Not yet

No tabs. A screen with tabs puts `TabButtons` in the page body under this header
rather than inside it — the header is 48px tall and a tab row does not belong in
it.

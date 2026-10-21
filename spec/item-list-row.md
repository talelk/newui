# ItemListRow

`ItemListRow` — a single row of a menu or list, with a prefix, a label and a
suffix. It is the row `Dropdown`, `Select`, `Combobox` and `MultiSelect` render,
so use it to build a custom menu that matches them. It is presentational: it
owns no role, no keyboard handling and no selection state — the caller supplies
all three.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `"div"` | element tag or component for the row wrapper |
| `size` | `xs \| sm \| md \| lg` | `sm` | row density; 24/28/32/40px, matching `InputSize` |
| `active` | `boolean` | `false` | marks the row the pointer or keyboard is on |
| `selected` | `boolean` | `false` | marks the chosen value |
| `disabled` | `boolean` | `false` | mutes the row; does not stop clicks |
| `prefix` | `JSX.Element` | — | leading adornment |
| `label` | `JSX.Element` | — | replaces the default content when both are passed (`#label`) |
| `suffix` | `JSX.Element` | — | trailing adornment |
| `class` | `string` | — | merged into the root |
| `children` | `JSX.Element` | — | the default label content |
| `role` / `aria-*` / `onClick` / … | — | — | land on the wrapper element (attribute fallthrough) |

## Behavior

- **Label.** The default content (`children`) fills the label region. Passing
  `label` replaces the default content when both are set
  overriding the default slot.
- **Prefix / suffix.** `prefix` and `suffix` render only when provided, so an
  empty adornment leaves no gap.
- **Active and selected.** `active` marks the row the pointer or keyboard is on;
  `selected` marks the chosen value. Both apply the same highlight. The row does
  not track either state — set them from your own state.
- **Disabled.** `disabled` mutes the row and shows a not-allowed cursor. It does
  not stop clicks or set the native `disabled` attribute, so skip the action in
  your handler.
- **Element.** The row renders a `div`. `as` sets another tag or a component,
  such as `as="button"` or `as="a"`; other attributes (`type`, `href`, `role`,
  `aria-selected`, event handlers) fall through to that element.

## Accessibility

The row sets no role. Add the roles your menu needs, such as `role="option"`
and `aria-selected` inside a `role="listbox"` container. The disabled state
exposes a `data-disabled` hook but no ARIA by itself — pair it with
`aria-disabled` when the row is part of a composite widget.

## Styling hooks

`data-slot` (`item-list-row`/`item-prefix`/`item-label`/`item-suffix`), plus
`data-size` (`xs`/`sm`/`md`/`lg`), `data-state` (`active`/`inactive`) and
`data-disabled` (present when disabled).

# AppSidebar

`AppSidebar` — the navigation sidebar a screen opens with, from `@newui/blocks`.
A titled header, then labelled groups of items with optional counts.

## Why a block

Every reference screen opens this way, and each was repeating the same twenty
lines of `SidebarHeader` + `SidebarLabel` + `SidebarItem` — including the parts
that are easy to get subtly wrong:

- the header is **not** inside the scroll region;
- a count is a quiet trailing pill (tabular numerals on `surface-gray-2`), not
  a `Badge`;
- the label row is what gives a long list its structure, and **a group's action
  sits on that row** — the sort that reorders one group belongs beside the group
  it sorts, not in the header acting on everything.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `title` | `JSX.Element` | required | header title |
| `subtitle` | `JSX.Element` | — | second header line, e.g. a member count |
| `logo` | `IconProp` | — | header mark |
| `showLogo` | `boolean` | `true` | set `false` when a rail already shows it |
| `headerActions` | `JSX.Element` | — | trailing header slot, usually a menu |
| `groups` | `AppSidebarGroup[]` | required | `{ label?, action?, items }` |
| `width` | `SidebarProps['width']` | `'14rem'` | |
| `collapsible` | `boolean` | `true` | folds to the rail, toggle at the foot |
| `collapsed` | `boolean` | — | controlled state; unset tracks its own |
| `onCollapsedChange` | `(collapsed: boolean) => void` | — | the `Sidebar` callback, forwarded |
| `collapsedWidth` | `string` | `'3rem'` | |
| `class` | `string` | — | merged into the `Sidebar` |

`AppSidebarItem` is `{ label, icon?, count?, active?, route?, href?, onClick? }`
— `route`/`href` render the row as a link, exactly as `SidebarItem` does.
`AppSidebarGroup` is `{ label?, action?, items }`: the action is rendered on the
label row and disappears with it in the rail.

## Behavior

- The scroll region is `ScrollArea` (thin, auto-hiding overlay scrollbar), not
  `overflow-y-auto`, so the sidebar does not show a permanent track beside the
  page's own scrollbar.
- An item with no `icon` renders no leading slot at all: an empty flex child
  would shift its label out of line with the items that have one.
- The header stays put while the groups scroll.
- **Collapse** is the `Sidebar` behavior, forwarded whole — controlled via
  `collapsed`/`onCollapsedChange`, otherwise its own state (⌘B / Ctrl+B
  included, auto-collapse below `sm` included). The block's one addition is
  the visible control: a `SidebarCollapseToggle` at the foot, below the
  scroll region so it never scrolls away, rendered only while `collapsible`
  is on. An item without an `icon` folds to a tooltip-only row, exactly as
  `SidebarItem` specifies — give rail-bound items icons.

## Styling hooks

The library's own: `data-slot="sidebar-header"` / `-label` / `sidebar-item` /
`scroll-area`. No new hooks.

# AppSidebar

`AppSidebar` — the navigation sidebar a screen opens with, from `@newui/blocks`.
A titled header, then labelled groups of items with optional counts.

## Why a block

Every reference screen opens this way, and each was repeating the same twenty
lines of `SidebarHeader` + `SidebarLabel` + `SidebarItem` — including the parts
that are easy to get subtly wrong:

- the header is **not** inside the scroll region;
- a count is a quiet trailing suffix, not a `Badge`;
- the label row is what gives a long list its structure.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `title` | `JSX.Element` | required | header title |
| `subtitle` | `JSX.Element` | — | second header line, e.g. a member count |
| `logo` | `IconProp` | — | header mark |
| `showLogo` | `boolean` | `true` | set `false` when a rail already shows it |
| `headerActions` | `JSX.Element` | — | trailing header slot, usually a menu |
| `groups` | `AppSidebarGroup[]` | required | `{ label?, items }` |
| `width` | `SidebarProps['width']` | `'14rem'` | |
| `class` | `string` | — | merged into the `Sidebar` |

`AppSidebarItem` is `{ label, icon?, count?, active?, onClick? }`.

## Behavior

- The scroll region is `ScrollArea` (thin, auto-hiding overlay scrollbar), not
  `overflow-y-auto`, so the sidebar does not show a permanent track beside the
  page's own scrollbar.
- An item with no `icon` renders no leading slot at all: an empty flex child
  would shift its label out of line with the items that have one.
- The header stays put while the groups scroll.

## Styling hooks

The library's own: `data-slot="sidebar-header"` / `-label` / `sidebar-item` /
`scroll-area`. No new hooks.

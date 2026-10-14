# ContextMenu

`ContextMenu` — a menu that opens at the pointer when the user right-clicks
inside its trigger area. Built on Zag's `menu` machine (the same primitive as
`Menu`), using its `contextTrigger` part; keyboard, ARIA and focus come from the
machine. To open a menu from a button, use `Menu` (aliased `Dropdown`) instead.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `open` | `boolean` | — | controlled visibility |
| `defaultOpen` | `boolean` | `false` | uncontrolled |
| `onOpenChange` | `(open: boolean) => void` | — | |
| `onSelect` | `(value: string) => void` | — | fires with the selected item's `value` |

`Root` takes the props above; `Trigger`/`Content`/`Item`/`Separator`/
`ItemGroup`/`Label` mirror `Menu`'s parts, including the per-part `class`
fallthrough and `Item`'s `value`/`disabled`/`valueText`.

## Structure

Compound parts, no named slots (P6):

- `Root` — owns the disclosure (`open` + `onOpenChange`) and the Zag machine.
- `Trigger` — the right-click area. Renders Zag's `contextTrigger` part, so it
  opens at the pointer on `contextmenu` and on a long press on touch screens.
- `Content` — the positioned menu, portalled to the app mount point; renders
  only while open.
- `Item` / `Separator` / `ItemGroup` / `Label` — same vocabulary as `Menu`.

## Behavior

- Opening: right-clicking anywhere in `Trigger` opens the menu at the cursor.
  `setOpen(true)` from a parent opens it at the trigger's lower-left corner
  (there is no pointer coordinate to use).
- Selecting: click an item, or move with the arrow keys and press Enter.
  Selecting closes the menu and reports the item's `value` through `onSelect`.
  Disabled items are skipped and not clickable.
- Keyboard/ARIA come from Zag: `role="menu"` on the content, `role="menuitem"`
  on items, arrow-key navigation, typeahead, `Escape` to close, and focus
  return to the trigger area.

## Styling hooks

`data-slot` (`context-menu-trigger`/`context-menu-positioner`/
`context-menu-content`/`context-menu-item`/`context-menu-separator`/
`context-menu-group-label`), plus Zag's `data-state` (`open`/`closed`),
`data-highlighted` and `data-disabled`. Semantic tokens only.

## Accessibility

| Keys | Action |
| --- | --- |
| `ArrowDown` / `ArrowUp` | Move focus between items |
| `Enter` / `Space` | Run the focused item |
| `Escape` | Close the menu |

The menu opens on right-click, which users may not discover; also offer
important actions somewhere visible, such as a `Menu` (Dropdown) trigger.

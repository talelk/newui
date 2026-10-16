# CommandPalette

`CommandPalette` — ⌘K, a query, and a list of things you can do.

## Usage

```tsx
<CommandPalette label="Commands">
  <CommandGroup label="Pages">
    <CommandItem
      value="/components/button"
      icon="lucide-square"
      keywords="button solid outline"
      onSelect={(href) => navigate(href)}
    >
      Button
    </CommandItem>
  </CommandGroup>
  <CommandGroup label="Actions">
    <CommandItem value="theme:dark" shortcut="⌘B" onSelect={setDark}>
      Switch to dark
    </CommandItem>
  </CommandGroup>
</CommandPalette>
```

Items **self-register**, which is what lets a consumer write groups and items as
plain JSX at any nesting while the keyboard walks one flat, filtered list across
all of them.

## Props

| part | prop | notes |
| --- | --- | --- |
| `CommandPalette` | `open` / `defaultOpen` / `onOpenChange` | controlled or not |
| | `shortcut` | bind ⌘K / Ctrl+K; default `true` |
| | `placeholder`, `label`, `empty`, `size` | `label` names both the dialog and the list |
| `CommandGroup` | `label` | the group's accessible name; hidden while filtering |
| `CommandItem` | `value` | identity, and what `onSelect` reports |
| | `keywords` | extra search text for words not in the label |
| | `icon`, `shortcut`, `description`, `disabled`, `onSelect` | |

## Behavior

- **The dialog is Zag's machine** (focus trap, Escape, backdrop, scroll lock).
  **The list is not a listbox machine**: a listbox collection is built once from
  a static set of items, and a palette is rebuilt on every keystroke — items come
  and go as the query narrows. So the highlight is ours, expressed with
  `aria-activedescendant`, which is what keeps focus in the field while the
  arrows move down the list.
- **The first usable item is highlighted**, so a palette can be opened and
  confirmed without looking: ⌘K, Enter.
- **Disabled items are visible but skipped.** They are in the list to explain why
  they cannot be used, not to be landed on — the arrows step over them and Enter
  does nothing.
- **Matching covers the label and the keywords**, and ranks a label that *starts
  with* the query above one that merely contains it. Group headings disappear
  while a query is active: they aid browsing, and once you are searching for one
  thing the order is relevance.
- **A fresh search each time it opens**; ⌘K only ever opens, never toggles.

## Accessibility

The field is a `combobox` with `aria-expanded`, `aria-controls` and
`aria-activedescendant`; the list is a `listbox` of `option`s with
`aria-selected`, grouped by `role="group"` with a label. An item that does not
match is hidden with the `hidden` attribute rather than unmounted — unmounting
would unregister it, and the registry is how the palette tells "nothing has
mounted yet" from "nothing matches".

## Not yet

No nested pages, no recent-commands memory, no fuzzy matching beyond
substring + prefix ranking. All three are additions to `score`, not to the
structure.

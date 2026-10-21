---
'@newui/atoms': minor
'@newui/molecules': minor
---

`CommandPalette`, and a sidebar that folds.

**`CommandPalette`** — ⌘K, a query, and a list of things you can do: pages,
components, actions, with a shortcut hint per row. Items self-register, so
groups and items are plain JSX at any nesting while the keyboard walks one flat,
filtered list across all of them. The dialog is Zag's machine (focus trap,
Escape, backdrop, scroll lock); the list is *not* a listbox machine — a listbox
collection is built once from a static set of items and a palette is rebuilt on
every keystroke, so the highlight is ours, expressed with
`aria-activedescendant`, which is what keeps focus in the field while the arrows
move. The first usable item is highlighted (open and press Enter), disabled items
are visible but stepped over, matching covers hidden keywords and ranks a prefix
above a substring, and group headings drop away while you search.

**`Sidebar`** grows three parts:

- **`SidebarSearch`** — the filter above the groups. It hides itself while the
  sidebar is a rail: there is nowhere to type into 3rem.
- **`SidebarTrigger`** — the compact fold control, with ⌘B / Ctrl+B bound by the
  sidebar itself (`shortcut={false}` opts out).
- **`SidebarItem`** now shows a real tooltip while collapsed instead of a `title`
  attribute. A rail of bare icons is unusable without one, and `title` takes a
  second to appear and cannot be styled.

The site adopts all of it: the sidebar folds to a rail (remembered, and by ⌘B)
with section icons, and ⌘K opens the palette over every page, component and
action. The sidebar itself stays markup — the shell renders on every route, so
the parts it uses are paid for by the home page (`routes.test.ts` pins that),
which is why the two share a design rather than an implementation.

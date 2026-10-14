# Specs

Per-component API contracts. Source-of-truth order:

1. `spec/*.md` — current contracts.
2. [`adr/`](./adr/README.md) — decision history.
3. `../CONTEXT.md` — vocabulary.
4. `../PHILOSOPHY.md` — design rules.

A contract accepted later supersedes older text. Shipped code is evidence of
what a contract says, never the contract itself.

## Foundations

- `foundations.md` — typography, focus, radius, color (pending).

## Components

- `inputs.md` — the shared labelling contract and the input family.
- `form.md` — FormControl, FormLabel, ErrorMessage (the public form primitives).
- `password.md` — Password (TextInput + reveal toggle).
- `combobox.md` — Combobox (searchable single select).
- `dropdown.md` — Dropdown (options-based action menu).
- `multiselect.md` — MultiSelect (searchable multi-valued select).
- `datepicker.md` — DatePicker (single date).
- `date-range-picker.md` — DateRangePicker (date range).
- `datetime-picker.md` — DateTimePicker (date + time).
- `duration.md` — Duration (number + unit value control).
- `bottom-sheet.md` — BottomSheet (bottom-anchored modal sheet).
- `context-menu.md` — ContextMenu (right-click menu).
- `breadcrumbs.md` — Breadcrumbs (navigation trail).
- `item-list-row.md` — ItemListRow (selectable list row).
- `keyboard-shortcut.md` — KeyboardShortcut + KeyboardShortcutsDialog.
- `sidebar.md` — Sidebar, rail, sections, cards.
- `timepicker.md` — TimePicker (time list).
- `dialog.md` — Dialog parts, `dismissible`, imperative `dialog.*` (pending).
- `dialog-imperative.md` — `dialog.confirm` / `dialog.danger` / `dialog.prompt` + `DialogHost`.
- `selection.md` — Select (pending).
- `switch.md` — Switch (Zag-backed).
- `button.md` — Button variants, sizes, icon form.

## Packaging decisions

- `Radio` is an alias of `RadioGroup` (frappe-ui's naming); `Dropdown` is an
  options-based component, not the `Menu` alias it used to be.
- `List` stays at the package root: it does not meet P15's three bars (cost
  isolation, extensible registry, name collision), so no `@newui/list` subpath.
- See [`adr/`](./adr/README.md) for the full decision record (packaging,
  no-`v-model`, in-house `tv`, pruned `tw-merge`, contrast shifts, …).

## Parity with frappe-ui

- `design-deltas-inputs.md`, `design-deltas-display.md`,
  `design-deltas-overlays.md` — per-component visual deltas against frappe-ui,
  classified `match` / `intentional` / `unintended`. Intentional deltas are the
  WCAG-AA colour shifts (ADR-0005).
- `migrations.md` — breaking changes and how to move off them.

Specs are added as components land.

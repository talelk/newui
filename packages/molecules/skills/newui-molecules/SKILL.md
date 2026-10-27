---
name: newui-molecules
description: >
  Use when composing compound interactions with @talelk/newui-molecules — forms
  (FormControl, Select, Combobox, MultiSelect, NumberInput, PinInput, TagInput),
  dates and times (DatePicker, DateRangePicker, TimePicker, TimeRangePicker,
  Calendar), overlays (Dialog, Popover, Menu, Dropdown, Toast), lists and tables
  (List, Table, ScrollTable, TagInput), or picking and transferring values
  (TransferList), or display rows (FileCard, MessageListItem, ThreadRow,
  NotificationItem). Use when the user mentions these components or asks for
  form rows, pickers, menus, toasts, or list rows for files, mail, threads or
  notifications in newui.
metadata:
  type: core
  domain: ui
  library: '@talelk/newui-molecules'
  library_version: '2.2.1'
sources:
  - talelk/newui:packages/molecules/src/molecules/Dialog/Dialog.tsx
  - talelk/newui:packages/molecules/src/molecules/FormControl/FormControl.tsx
  - talelk/newui:packages/molecules/src/molecules/Select/Select.tsx
  - talelk/newui:packages/molecules/src/molecules/DateRangePicker/DateRangePicker.tsx
  - talelk/newui:packages/molecules/src/molecules/TimeRangePicker/TimeRangePicker.tsx
  - talelk/newui:packages/molecules/src/molecules/List/List.tsx
  - talelk/newui:packages/molecules/src/molecules/MessageListItem/MessageListItem.tsx
  - talelk/newui:spec/form.md
  - talelk/newui:spec/inputs.md
---

# newui molecules

Compose the compound interactions on top of `@talelk/newui-atoms`. Read the
`newui` skill first for the token vocabulary and the shared labelling
contract — every molecule field speaks it.

## Setup

```tsx no-check
import { Button } from '@talelk/newui-atoms'
import { Dialog, FormControl, Select } from '@talelk/newui-molecules'
import { createSignal } from 'solid-js'

const [status, setStatus] = createSignal<string>()

export function FilterRow() {
  return (
    <FormControl
      label="Status"
      forSelect
      options={['Open', 'Done'].map((value) => ({ label: value, value }))}
      value={status()}
      onValueChange={(value) => setStatus(value ?? undefined)}
    />
  )
}
```

`FormControl` is the form-row shortcut: it renders the right control for the
props you pass (`forSelect`, `forCheckbox`, …) with the P5 labelling contract
wired. Drop to the individual components (`Select`, `Combobox`, …) when you
need their full prop surface.

## Core patterns

**Compound overlays use namespace parts, not props.** A dialog is
`Dialog.Root`/`Dialog.Header`/`Dialog.Content`/`Dialog.Footer` with
`open`/`onOpenChange` on the Root (P1/P2). A closed trigger shows nothing —
check the `Open` state story before assuming a rendering bug.

**Date and time ranges report tuples.** `DateRangePicker` reports
`[from, to]` of `YYYY-MM-DD` or `[]`; `TimeRangePicker` reports `[from, to]`
of `HH:mm` or `[]`. Picking the start holds a half-open range internally —
`onValueChange` fires only when the range is complete. A range that ends
before it starts is reported as-is (night shifts are real).

**A bare control has no label.** Passing neither `label` nor `aria-label`
leaves the control unnamed (axe `label` violation). The `label` prop renders
the visible label; `aria-label` names it invisibly.

**Table roles belong to the caller in the `List` family.** Wrap with
`role="table"`, mark rows `role="row"`, cells `role="cell"`, and give
`ListHeaderCellSort` `role="columnheader"` — which also legalises its
`aria-sort`. `ListRow`, `ListCell` and `ListHeaderCellSort` forward rest
props for exactly this.

## Common mistakes

**`null` clears, `undefined` is ignored.** Field-style values use `null` as
"no value" (`TimePicker`, `DatePicker`). Passing `undefined` leaves the
control uncontrolled.

**List rows carry their state in text, not colour alone.** `MessageListItem`
and `ThreadRow` mark unread with heavier text plus a dot, and `selected` sets
`aria-current` — never a colour-only state. `FileCard` keeps the open action
and the actions apart: a button card must not carry `suffix` (interactive
content cannot nest in a button); put the card's controls in siblings beside
it, or use the `div` root and pass them through `suffix`.

**Don't render a molecule's parts outside the molecule.** Carousel controls
(`Carousel.Next`), `Toaster` regions and pickers read their family's context;
outside the family root they throw or render nothing.

**Toasts need their provider.** `toast(...)` calls route through a
`createToaster()` + `Toaster` host — calling the helper without mounting the
region silently drops the message.

## Completion

`pnpm verify:affected` after composing; the a11y suites in each molecule's
directory show the expected accessible shape of every component.

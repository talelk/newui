# Migrations

Known breaking changes and how to move off them. Codemods are only written when
a **v1-equivalent freeze** is declared (frappe-ui's `v1-release/` model); until
then each change is documented here and, where the transform is mechanical, a
`scripts/migrate.ts` will be added alongside it.

## `Dropdown` is options-based (pre-1.0)

`Dropdown` used to be an alias of the compound `Menu`
(`<Dropdown.Root>/<Dropdown.Item>`). It is now options-based.

Before:

```tsx
<Dropdown.Root onSelect={onSelect}>
  <Dropdown.Trigger>Actions</Dropdown.Trigger>
  <Dropdown.Content>
    <Dropdown.Item value="edit">Edit</Dropdown.Item>
  </Dropdown.Content>
</Dropdown.Root>
```

After:

```tsx
<Dropdown
  options={[{ label: 'Edit', value: 'edit' }]}
  onSelect={onSelect}
>
  Actions
</Dropdown>
```

The compound API is unchanged — it is `Menu` (`Menu.Root`, `Menu.Item`, …). A
codemod would rewrite `Dropdown.Root` → `Menu.Root` and `Dropdown.Item` →
`Menu.Item`; it is deferred (see ADR-0006).

## No `v-model` (from frappe-ui)

Not a version change but the first thing a frappe-ui consumer hits: overlays use
`open` + `onOpenChange`, inputs use `value` + `onValueChange` (ADR-0001).

## Colour shifts (from frappe-ui)

Colours intentionally differ from frappe-ui where WCAG AA required it
(ADR-0005). Not a code migration — a visual one; see `spec/design-deltas*.md`.

## Migrating from frappe-ui

Not automated. The component names line up almost one-for-one (`RadioGroup`
aliases `Radio`, `UIProvider` is `FrappeUIProvider`, `AppShell` is
`DesktopShell`); the state model (no `v-model`) and the packaging model
(workspace packages, ADR-0004) are the real differences.

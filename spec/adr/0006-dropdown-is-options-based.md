# `Dropdown` is options-based

**Status**: accepted

## Context

`Dropdown` started as an alias of the compound `Menu`
(`export const Dropdown = { ...Menu }`). The common case is **options-based**:
pass `options` and a trigger, get a menu.

## Decision

`Dropdown` takes `options: DropdownOption[]` + trigger `children` +
`onSelect`, and is a thin composition over `Menu`. `Menu` remains the compound
escape hatch for custom triggers/rows.

## Rationale

A list of actions is the common case; the options-based API is shorter and
matches the library's vocabulary (P8: a different value shape is a different
component, not a flag). Keeping `Menu` compound means the alias removal costs
nothing for callers who need full control.

## Consequences

- `Dropdown` no longer has `Menu`'s compound parts; `Menu` does.
- This is the one real breaking change from the alias; a migration codemod is
  planned only if a v1-equivalent freeze is declared.

# `List` stays at the package root

**Status**: accepted

## Context

frappe-ui exposes `frappe-ui/list` as a subpath (with its own structural
`style.css`). This library has no `@newui/ui/list`; `List` and its parts are
exported from the root barrel.

## Decision

Keep `List` at the root. Do not add a `@newui/ui/list` subpath.

## Rationale

P15: a subpath must be **earned** by cost isolation, an extensible registry, or a
name collision. `List` is a small presentational family with no unique
dependencies and no collision; its structural CSS is already part of the single
`@newui/tailwind/style.css`. A subpath would add a second entry point and a
second `publint` surface for no measured benefit.

## Consequences

- Importing `List` pulls the same `@newui/ui` chunk as everything else. If a
  consumer needs isolation, the answer is the package split (ADR-0004), not a
  subpath.
- Revisit only if `List` grows a dependency the rest of the library should not
  carry.

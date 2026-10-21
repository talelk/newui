# `List` stays at the package root

**Status**: accepted

## Context

`List` and its parts are exported from the `@newui/molecules` root barrel. A
component-specific subpath would add a second entry point without a separate
dependency graph.

## Decision

Keep `List` at the `@newui/molecules` root. Do not add a component subpath.

## Rationale

P15: a subpath must be **earned** by cost isolation, an extensible registry, or a
name collision. `List` is a small presentational family with no unique
dependencies and no collision; its structural CSS is already part of the single
`@newui/tailwind/style.css`. A subpath would add a second entry point and a
second `publint` surface for no measured benefit.

## Consequences

- Importing `List` pulls the molecules package; isolation is provided by the
  atomic package boundary (ADR-0013), not a per-component subpath.
- Revisit only if `List` grows a dependency the rest of the library should not
  carry.

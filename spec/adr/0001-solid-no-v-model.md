# No `v-model`

**Status**: accepted

## Context

frappe-ui is Vue and binds two-way state with `v-model`. Solid has no equivalent:
a component receives a value and a change callback, and reactivity flows through
signals/accessors.

## Decision

No `v-model` anywhere. Two-way state is a **value + a change callback**:

- overlays: `open` + `onOpenChange` (via `createDisclosure`),
- inputs: `value` + `onValueChange` (or `checked` + `onCheckedChange`),
- uncontrolled use: a `default*` prop.

`createControllableSignal` implements the controlled/uncontrolled contract once.

## Rationale

Solid's fine-grained reactivity has no "mutate the prop" path; a `v-model`
translation would either be a hidden signal (breaking controlled use) or a
callback with a different name. Naming it after the **fact** (`onValueChange`)
rather than a trigger keeps the API honest and matches P1/P2.

## Consequences

- Every stateful control has `value`/`onValueChange` (or `open`/`onOpenChange`)
  and an optional `default*`.
- Consumers wire one handler; there is no implicit write-back.
- The vocabulary is stable across components and documented in `CONTEXT.md`.

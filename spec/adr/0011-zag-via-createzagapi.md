# Zag primitives only via `createZagApi` / `createZagContext`

**Status**: accepted

## Context

Every interactive component wraps a `@zag-js/*` machine. Zag's adapter API
(`useMachine` + `connect` + `normalizeProps`) is verbose and easy to get subtly
wrong (the connected API must be a memo, props must be an accessor).

## Decision

No component calls `useMachine` directly. `lib/zag.ts` provides:

- `createZagApi(machine, connect, props)` → `{ service, api }`, where `api` is a
  memo so `api().open` re-runs on machine state change and `props` is an accessor
  so the machine sees reactive values.
- `createZagContext(name)` → a provider + `useApi` pair for compound families,
  with an error naming the family.

## Rationale

One place to encode "the API must be a memo" and "props must be an accessor"
means the whole library cannot regress on either. The context helper gives every
compound family the same "used outside its Root" error.

## Consequences

- Every Zag-backed component imports from `lib/zag`, not `@zag-js/solid`.
- `normalizeProps`/`mergeProps` are re-exported through the same shim.
- A new machine is wired the same way; there is no second pattern to review.

# In-house `tv`/`cn`/`cx` instead of `tailwind-variants`

**Status**: accepted

## Context

`tailwind-variants` provides `tv()` (variants + compound variants) and its own
`tailwind-merge` integration. This library used only `base`, `variants`,
`compoundVariants` and `defaultVariants`, but paid for the whole package — it
bundled its own merge integration on **every** component.

## Decision

Reimplement those four features in `packages/ui/src/lib/tv.ts`, typed, over the
`tailwind-merge` engine we do need. `tv`, `cn`, `cx` and `VariantProps` are
in-house.

## Rationale

`Button` alone went **34.3 → 16.3 kB** gzip. The resolver is small, and its type
shape (`VariantProps<typeof recipe>` recovering the axis unions) is pinned by
`lib/tv.test.ts`. Removing the dependency also removed a second merge config we
did not control.

## Consequences

- One merge engine (`lib/tw-merge.config.ts`), not two.
- Recipes are `tv()` definitions; `VariantProps` is the public type helper.
- `lib/tv.test.ts` guards the resolver; the recipe tests guard each component.

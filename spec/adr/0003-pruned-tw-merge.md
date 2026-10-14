# Pruned `tw-merge` config, proven by an all-pairs sweep

**Status**: accepted

## Context

`tailwind-merge`'s default config ships every Tailwind group on every component
(~14 kB gzip). `createTailwindMerge` takes a **full** config, not a partial one,
so a smaller config means re-declaring the families the library emits.

## Decision

`lib/tw-merge.config.ts` declares only the families this library emits, and
`lib/tw-merge.test.ts` proves it agrees with the **extended default** for
**every ordered pair** of utilities found in the source (~210k cases), plus an
axis-independence invariant (`p-2`+`px-4` must both survive).

## Rationale

`cn()` went 14.1 → 6.5 kB and `Button` 16.3 → 8.6 kB. The all-pairs sweep is the
trust mechanism: a missing group or a wrong conflict edge fails in CI instead of
a class silently failing to override at runtime. The sweep found real bugs
(`p` vs `px`; `font-size → leading` in the wrong conflict map; `min/max-*`
missing `none`).

## Consequences

- Adding a utility family means adding it to the config **and** to the sweep's
  reference; the sweep will fail otherwise.
- The config is not a strict subset of the default: it also fixes latent cases
  (numeric `rounded-<n>`, named `shadow-<step>`).
- The sweep is heavy (~210k cases); it has an explicit 60 s timeout.

# Tailwind v4, not v3

**Status**: accepted

## Context

frappe-ui is Tailwind **v3** and ships a v3 preset. This library targets v4.

## Decision

Tailwind v4. The token layer is a **generated** `@theme` (`theme.css`) plus
`:root`/`[data-theme=dark]` custom properties (`tokens.css`), produced from
`@newui/tokens` by `packages/tailwind/scripts/build-css.ts`.

## Rationale

v4's CSS-first config (`@theme`, `@utility`, `@plugin`, `@source`) removes the
hand-maintained JS preset and the token list. Colour utilities resolve runtime
`var(--surface-*)`/`var(--ink-*)`/`var(--outline-*)`, so dark mode flips with no
`dark:` variant — the whole reason the runtime-token layer exists.

## Consequences

- The `lucide-*` icon plugin is ported from `matchComponents` to
  `matchUtilities`.
- `pnpm css` regenerates the CSS after token changes; `css:check` fails if a
  referenced utility is not emitted.
- Consumers must be on Tailwind v4.

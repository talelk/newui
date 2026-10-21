# Atomic packages and the integrated application shell

**Status**: accepted

## Context

The first kit ladder added `@talelk/newui-blocks` and `@talelk/newui-layouts`, while atoms,
molecules and several page frames remained together in `@talelk/newui-ui`. The app
shell also separated a navigation sidebar from a desktop rail and distinct
desktop/mobile shell APIs. That structure made the published packages disagree
with the atomic levels the reference site was teaching, and made every app
compose responsive navigation from parallel surfaces.

The original decision in [ADR-0012](./0012-kit-ladder.md) is superseded where
these package and shell boundaries differ. The headless data layer remains
separate; charts, code editor and rich-text editor remain optional domain
packages.

## Decision

1. **Make the core package names match the atomic ladder.** The supported visual
   packages are `@talelk/newui-atoms`, `@talelk/newui-molecules`, `@talelk/newui-organisms` and
   `@talelk/newui-templates`. `@talelk/newui-data` remains headless. The former
   `@talelk/newui-ui`, `@talelk/newui-blocks` and `@talelk/newui-layouts` packages are removed without
   compatibility aliases or deprecated entrypoints.
2. **Keep rendered surfaces in the visual ladder.** `DataTable` and
   `VirtualList` are organisms; `ScrollTable` is a molecule. Data owns logic,
   formatting, selection, downloads, Query and Form behavior, not rendered
   table/list components.
3. **Support exactly three templates:** `AppShell`, `PaneLayout` and
   `AuthLayout`. `AppShell` is the only application shell and owns one
   responsive sidebar. Its single navigation model contains app identity,
   tenant selection, grouped destinations, collapse-to-icons, and pinned
   settings/account controls. Desktop presents the docked collapsible sidebar;
   mobile presents that same expanded sidebar as a modal drawer. There is no
   separate rail, desktop/mobile shell pair, or compatibility frame.
4. **Remove old public URLs rather than redirecting them.** The site, registry,
   stories, examples and tests use the atomic reference routes only.
5. **Classify every registry entry explicitly.** `scripts/atomic.ts` is the
   exhaustive map from public component name to level. Generation and tests
   fail on either missing or extra classifications.

## Rationale

- Physical packages make dependency direction and install cost visible and
  enforceable; one generic barrel obscured both.
- The organization of the docs, stories and public imports now tells the same
  atomic-design story.
- A single responsive sidebar avoids duplicated navigation state and preserves
  the same tenant, destinations and footer actions across desktop and mobile.
- Moving rendered table/list surfaces out of data restores the data package's
  headless contract while retaining optional heavy engines at their owning
  layer.
- A clean break avoids maintaining two competing APIs and routes for the same
  responsibilities.

## Consequences

- Package consumers must migrate imports to the new atomic package names; no
  compatibility package or redirects are published.
- Every package boundary is pinned by manifests, exports tests, dependency
  rules, type checks, budgets and CI routing.
- `@talelk/newui-templates` exports only the three supported templates.
- `AppShell` and the starter are acceptance surfaces for desktop collapse,
  mobile drawer behavior, tenant/menu interaction, keyboard/focus behavior and
  absence of a rail/sidebar duplicate.
- The reference registry and Storybook use the same explicit atomic level for
  each shipped entry.

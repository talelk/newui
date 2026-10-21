# The kit ladder — layouts, logic and the surface

**Status**: superseded by [ADR-0013](./0013-atomic-packages-and-app-shell.md)

## Context

The library is strong up to the block level (64 components, 7 blocks, real
browser gates) and undefined above it. Nothing owns the page: `ExampleFrame` is
playground-local, each example re-declares its headers and frames, the blocks
demonstrably cannot absorb those compositions, and the async/form/table logic is
per-page craft (TanStack appears in four files, documented as application
dependencies). The templates level of the atomic-design ladder does not exist,
and `/play` is a demo surface, not a state surface.

Four decisions were put to the maintainer and ratified on 2026-10-19:

| Decision | Value |
| --- | --- |
| Logic layer | `@talelk/newui-data` — newui conventions over TanStack Query/Form/Table/Virtual, plus promoted `DataTable`/`VirtualList`/helpers. Supersedes `spec/tanstack-integration.md` when it lands. |
| Router | `@solidjs/router` stays the kit's router; the starter encodes its conventions. |
| Layouts | A new `@talelk/newui-layouts` package owns page templates; shell frames stay in `@talelk/newui-ui`. |
| Starter | A buildable `apps/starter`, gated (typecheck, smoke e2e, budget), rendered at `/pages/starter`. A CLI may follow, later. |

## Decision

One ladder, five levels above tokens, with one home each:

| Level | Answers | Home |
| --- | --- | --- |
| Components | what is this control | `@talelk/newui-ui` (incl. shell frames) |
| Blocks | what is this section | `@talelk/newui-blocks` |
| Layouts | how does a page open | `@talelk/newui-layouts` |
| Logic | how does it behave | `@talelk/newui-data` |
| App | what do I copy | `apps/starter` + the examples |

with three rules:

1. **Downward-only imports.** `ui ← blocks ← layouts ← apps`; `@talelk/newui-data`
   imports nothing from ui/blocks/layouts except the promoted surfaces it owns;
   charts/editor/code-editor attach at the block/layout level; nothing imports
   an app. Enforced in `.dependency-cruiser.cjs`.
2. **Promote or reuse.** A pattern that appears twice in an example moves a
   level down (into layouts/data) or is reused from a level above. The examples
   are recipes, not a second library.
3. **The same done-checklist per unit**: implementation, recipe/types, tests +
   a11y, spec, a story with states, a site page, a budget entry, an exports pin.

The surface is Storybook (hosted in `apps/playground`): it replaces `/play`,
absorbing the demos as story files with per-component state coverage, and the
browser harness sweeps every story.

## Rationale

- The block level already proved the pattern: composed pieces with a spec,
  a demo and a budget. Layouts and logic are the same method one level up.
- New packages keep the ladder physical and enforceable (ADR-0004), and keep
  `@talelk/newui-ui`'s barrel from absorbing async/table costs it does not own.
- TanStack behind newui conventions gives one way to do data without owning a
  query engine; the wrappers are the contract, the engine is replaceable.
- Keeping `@solidjs/router` avoids a second ecosystem and a migration of the
  site and 13 examples for no consumer-visible gain.
- The starter is the acceptance test for the whole kit: if a new app cannot be
  assembled from public surfaces, the kit is not done.

## Consequences

- `spec/kit.md` is the scope contract; per-component specs stay in their files.
- New packages ship with package.json `exports`, publint/knip coverage, a size
  budget, an exports test and a changeset (where they change existing surface).
- Additive only to shipped APIs (P13); layouts compose `PageToolbar`,
  `DetailHeader` and `AppSidebar`, so those gain optional props rather than
  being re-implemented in the playground.
- `spec/tanstack-integration.md` is superseded when `@talelk/newui-data` lands; the
  examples migrate and their local copies (`Notice`, `undo`, `format`,
  `CreateDialog`, `DataTable`) are deleted.
- Storybook becomes a required surface: `pnpm stories:check` fails when
  `index.json` drifts from the story sources, and the sweep specs drive story
  URLs instead of `/play`.

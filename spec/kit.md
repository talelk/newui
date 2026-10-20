# The construction kit — plan of record

Status: accepted 2026-10-19 (ratified; see
[ADR-0012](./adr/0012-kit-ladder.md) for the decision record). This file is the
scope contract for the kit work: the Storybook surface, `@newui/layouts`,
`@newui/data` and the starter. Where it and an older spec disagree about the
kit's shape, this file wins; per-component contracts stay in their own specs.

## Why

The library is finished up to the block level and undefined above it:

- **Layout** — the frames exist (`AppShell`, `ResponsiveShell`, `Sidebar`,
  `MobileNav`) but nothing owns the page. `ExampleFrame` is playground-local,
  nine pages depend on it, and each page hand-rolls its header/toolbar/body.
  `spec/examples-refresh.md` documents that `PageToolbar`, `DetailHeader` and
  `AppSidebar` cannot absorb those compositions.
- **Logic** — no one way to do anything. TanStack appears in four files
  (`DataTable`, `ActivityList`, Tasks, Authentication) and
  `spec/tanstack-integration.md` calls it an application dependency; everyone
  else hand-rolls signals and local repositories. `Notice` is copied 11 times,
  `createUndo` 3, `format` 4, `CreateDialog` 7.
- **Atomic design** — tokens → ui → blocks → examples exists implicitly; the
  templates level is missing and the logic level has no home, so nothing tells
  a consumer which frame to pick or where a repeated pattern graduates to.
- **Surface** — `/play` is demo-shaped, not state-shaped: no stories, no
  states, no index a machine can sweep.
- **Composition** — learned by reading playground source; no starter, no guide.

The plan is not a redo. It adds the two missing levels, the surface and the
copyable app to the parts that already exist.

## The ladder

| Level | Answers | Home | Today |
| --- | --- | --- | --- |
| Tokens | what does it look like | `@newui/tokens` + `@newui/tailwind` | shipped |
| Components (atoms/molecules) | what is this control | `@newui/ui` (+ shell frames) | shipped |
| Blocks (organisms) | what is this section | `@newui/blocks` | shipped |
| Layouts (templates) | how does a page open | `@newui/layouts` | shipped (W2, `AppLayout`; page templates next) |
| Logic | how does it behave | `@newui/data` | shipped (helpers, `/query`, `/form`, `/table`, `/virtual`) |
| App | what do I copy | `apps/starter` + examples | missing |
| Surface | how do I see any of it | Storybook | shipped (W1) |

Rules (ADR-0012):

1. **Downward-only imports** — `ui ← blocks ← layouts ← apps`; `@newui/data`
   is headless except its own promoted surfaces; nothing imports an app.
2. **Promote or reuse** — a pattern that appears twice in an example moves a
   level down or is reused from a level above.
3. **One done-checklist per unit** — implementation, recipe/types, tests +
   a11y, spec, a story with states, a site page, a budget entry, an exports
   pin.

## W1 — Storybook, the surface

Hosted in `apps/playground` (`.storybook/`, `storybook@10.6.2` +
`storybook-solidjs-vite@10.7.2`, `@storybook/addon-a11y`). The 91 demo files in
`src/demos/` (plus two shared helpers) are absorbed as
`src/stories/*.stories.tsx`; each file keeps a non-story `Demo` export for the
site's inline embeds and exposes its states as stories. The generated
`src/generated/stories.ts` replaces `demos.tsx`; `/play` is deleted.

- **Taxonomy** — `Components/<group>/<Name>`, `Blocks/<Name>`, `Charts/<Name>`,
  `Editors/<Name>`, `Compositions/<Name>`.
- **States** — every input-like component shows its disabled/invalid/loading
  states; every overlay shows open/closed; data surfaces show
  loading/empty/error. The contract is `spec/states.md`; the coverage is
  checked by `pnpm stories:check` plus the browser sweep.
- **Sweep** — every story in `index.json` is a unit (a `no-sweep` tag is the
  rare escape hatch) for the design-contract, coherence, a11y and memory specs;
  screenshots drive story URLs. Storybook serves on its own origin (6006 dev,
  6007 static) so embeds and the harness do not share the site's route space.
- **Acceptance** — `/play` gone; docs embeds read stories; `stories:check`
  green in CI; sweeps pass at max coverage within budget.

**Status (2026-10-19).** Landed. The 91 demos are absorbed into 91 story files;
the generated index holds 182 stories (91 `Default` plus 89 state stories), and
`spec/states.md` + `scripts/story-states.ts` are enforced by
`pnpm stories`/`stories:check`. `/play` is deleted; the site's reference pages,
`pnpm shots`, `docs:build` and the browser harness all read story URLs.
Design-contract (one load per story, measured narrow-first), coherence, a11y,
stress and the memory tripwires drive every story; `no-sweep` is the escape
hatch. The per-state axe sweep found real defects — legend labels, the
palette's empty listbox and group contrast, the combobox loading rows, the
file-uploader label, a focusable scroll viewport, and the sidebar's card/clipped
section header in the rail — fixed in this slice with tests. W2 (`layouts`)
is next.

## W2 — `@newui/layouts`, the template level

Extracts `ExampleFrame` into `AppLayout` (rail · sidebar · folding column ·
title block · mobile bar, `ResponsiveShell` underneath), then ships the page
templates the examples justify:

| Layout | Justified by | Status |
| --- | --- | --- |
| `AppLayout` | the nine framed examples | **shipped** — the frame moved, and the visual suite changed no snapshot |
| `ListPage` — header, actions, filters slot, content, bulk footer | Deals, Tickets, Files, Mail, Tasks | **waiting on a consumer** |
| `DetailPage` — record header, tabs, body, side panel | Tickets, Deals, Files | **waiting on a consumer** |
| `SettingsPage` — grouped nav + panels | Settings, Discussions | not started |
| `AuthPage` — centered `AuthCard` frame | Authentication | not started |
| `DashboardPage` — stat grid + chart grid | Analytics, Accounting | not started |
| `PaneLayout` — a list pane beside a record, divider included | Mail (Files and Discussions preview in dialogs) | **shipped** — Mail's hand-rolled grid, CSS variable and toolbar slider are gone |

**Why `ListPage` and `DetailPage` wait.** Their slots would duplicate controls
that already own them: `FilterBar` owns the count and the clear-all, `DataTable`
owns the row-selection bulk bar, and our record views are dialogs rather than
pages — so a `ListPage` today would be a template with nothing to template.
`PaneLayout` shipped once Mail's split was compared with the others: Files
previews in a dialog and Discussions is a list plus dialogs, so the honest API is
two panes and a divider — not the three-pane workspace the plan imagined.

The remaining templates (`SettingsPage`, `AuthPage`, `DashboardPage`) are
arrangement over blocks that already exist, and `spec/examples-refresh.md` says
why `PageToolbar`, `DetailHeader` and `AppSidebar` could not absorb those
compositions. They wait for the same reason the first two did: a template with
nothing to template is worse than none.

The block friction this exposes is fixed additively: `PageToolbar` gains
description/multi-action, `DetailHeader` richer actions, `AppSidebar`
group/action slots — so templates compose blocks instead of re-implementing
them. Acceptance: no example hand-rolls a frame or header, `ExampleFrame` is
deleted, and every layout has a story, a spec, a site page and a budget entry,
with example behaviour unchanged (e2e green).

## W3 — `@newui/data`, the logic layer

One headless package that says how apps behave:

- **Async state** — query-client bootstrap, a repository contract
  (`list/get/create/update/remove`), and `createListQuery` / mutation wrappers
  over TanStack Query with optimistic updates, rollback, notice and undo.
- **Forms** — a bridge from TanStack Form to the P5 `Field` contract and a
  submit lifecycle tied to mutations.
- **Promoted surfaces** — `DataTable` and `VirtualList`, plus the pure helpers
  (`format`, `download`, `select`, `undo`, `Notice`) currently copied per page.

Acceptance: exactly one way to do data/forms/tables/lists in the repo; the
examples adopt it and their local copies are deleted; `spec/data.md` replaces
`spec/tanstack-integration.md`.

**Status.** The helpers, the query surface and the form surface have shipped:
`DataProvider`, `createDataClient`, the `Repository` contract and
`createCollection` (one list query with optimistic, reversible mutations); then
`createAppForm`, `Form` and `fieldError` over TanStack Form. Tasks and
Authentication adopt them — neither imports TanStack Query or Form, creates a
client, or maps a field's error list by hand. The promoted
`DataTable` shipped at `@newui/data/table` and `VirtualList` at
`@newui/data/virtual`; the playground depends on no TanStack package directly.

## W4 — Composition: starter and guides

`apps/starter` is a buildable, gated skeleton — app frame, list page, detail
page, settings, auth, data wired — assembled only from public kit surfaces,
with a smoke e2e, typecheck and budget entry. `/examples/starter` renders it
and explains the copy path. The docs gain a Kit section (*The ladder*,
*Compose a page*, *Wire data*, *Start an app*), and Storybook gains composed
recipes that fill layouts with real blocks. A `create-newui` CLI is explicitly
parked; the starter comes first.

## W5 — Hardening

Dependency rules per level in `.dependency-cruiser.cjs`, exports/manifest pins,
size and route budgets per new package, knip, nav/site updates, changesets and
spec contracts. Every phase lands through the existing gates; nothing gets a
bypass.

## Sequence

| Phase | Work | Gate |
| --- | --- | --- |
| 0 | ADR-0012 + this file + dependency rules drafted | `pnpm specs:check`, `refs:check` |
| 1 | W1 Storybook: spike → foundation → absorb → states → max coverage | spike numbers reported before bulk conversion; sweeps green at max coverage |
| 2 | W2 layouts: `AppLayout` extraction → templates → block fixes → migrate examples | e2e green, budgets unchanged, stories/specs/site pages present |
| 3 | W3 data: bootstrap → repository/mutation → form bridge → promote surfaces → adopt | one-way check (grep-level) + examples migrated |
| 4 | W4 starter + guides | starter typecheck + smoke e2e + budget; docs build |
| 5 | W5 rules, budgets, docs | `pnpm verify` |

Phases 2 and 3 are independent and may overlap; both touch the examples, so
the merge points are the list-content slot and the table.

## Constraints

- **Additive only** to shipped packages (P13); shells stay in `@newui/ui`.
- **Everything opt-in** — new packages are tree-shakable with size budgets;
  importing a layout must not pull every template.
- **Not an app framework** — no Frappe API client, no auth backend, no HTTP
  stack in this pass; the kit stays local-first and apps bring their data.
- No token or component redesign; no router change (ADR-0012).
- New demos may surface peer-role drift in the coherence sweep: fix it or
  baseline it deliberately, never silently.

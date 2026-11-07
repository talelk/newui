# newui skill spec

A SolidJS component library built on Zag, typed variant recipes and Tailwind
CSS v4. The skills ship beside the packages they describe so an agent can load
the visual guidance, the data guidance, or both, at the installed version.

## Domains

| Domain | Description | Skills |
| --- | --- | --- |
| UI composition | The visual ladder, semantic tokens, labels and overlays. | `newui` |
| Data and forms | Collections, cache, mutations, form lifecycles, URL state, config storage and transforms. | `newui-data` |

## Skill Inventory

| Skill | Type | Domain | What it covers | Failure modes |
| --- | --- | --- | --- | --- |
| `newui` | core | UI composition | Atoms, molecules, organisms, templates, semantic tokens, the shared Field contract and overlay state. | 6 non-negotiables in `SKILL.md` |
| `newui-data` | core | Data and forms | `createCollection`, `DataProvider`, optimistic mutations, `createAppForm` (field map, `when(scope, values)`, pruning, `document`), `createAutoSave` and drafts, `Form` and `fieldError`, `createUrlState`, `createConfigStore`, `aggregate`/`timeBucket`/`rollup`, `connectRealtime` and `refetchInterval`. | 4 contracts + config-form rules in `SKILL.md` |
| `newui-molecules` | core | UI composition | FormControl, pickers, ranges, Dialog (incl. `position="end"` side sheets), List roles, toasts. | patterns in `SKILL.md` |
| `newui-organisms` | core | UI composition | DataTable (compact density, pinning, editing, in-table empty state), StatGrid strip, AppSidebar `settings` function, DataState. | patterns in `SKILL.md` |
| `newui-templates` | core | UI composition | AppShell (compact header band, `settings` function), PaneLayout, AuthLayout. | patterns in `SKILL.md` |
| `newui-charts` | core | UI composition | Chart accessibility, states, option builders, interaction signals, the `bare` NumberCard KPI strip. | patterns in `SKILL.md` |

## Coverage and decisions

- The UI skill is owned by `@talelk/newui-atoms`, the package every visual page
  installs first. It names the sibling packages to inspect for molecules,
  organisms, templates and tokens instead of duplicating their APIs.
- The data skill is owned by `@talelk/newui-data` and is loaded only when the task
  needs a collection, cache, mutation or form lifecycle.
- Both skills point at installed package source, not repository-only specs.
  The `sources` frontmatter keeps the maintainer trail back to `spec/` and the
  implementations.
- Validation is blocking in CI (`intent validate`). Staleness is advisory:
  `intent stale` reports version drift, source-review signals and workspace
  coverage without claiming that the semantic advice is wrong.

## Remaining gaps

| Skill | Question | Status |
| --- | --- | --- |
| `newui` | Add task-level eval cases for the consumer-facing quick start once a published-package run exists. | open |
| `newui-data` | Add a failure-mode case for a mutation that rejects after an optimistic patch. | open |

- Registered `newui-molecules` in `packages/molecules` (domain `ui`). Task coverage, decisions, and checks still need to be recorded.

- Registered `newui-organisms` in `packages/organisms` (domain `ui`). Task coverage, decisions, and checks still need to be recorded.

- Registered `newui-templates` in `packages/templates` (domain `ui`). Task coverage, decisions, and checks still need to be recorded.

- Registered `newui-charts` in `packages/charts` (domain `ui`). Task coverage, decisions, and checks still need to be recorded.

## Review 2026-11-07 (instrument-panel look, form follow-ups, shell, record sheets)

Reviewed every skill against the changes since `f97ad727`:

- `newui` — no change: the rules and token vocabulary hold (`theme="blue"`
  keeps its name; ADR-0016 retunes values, not names).
- `newui-data` — updated: config-form section (static field map, row-scoped
  `when`, pruning, `document`, autosave of the pruned document, drafts as
  untrusted input).
- `newui-molecules` — updated: open records as `Dialog` side sheets.
- `newui-organisms` — updated: compact default density, in-table empty state
  (tests assert its text), StatGrid strip, `settings` as a function.
- `newui-templates` — updated: `settings` function in the setup and patterns,
  the compact page-header band.
- `newui-charts` — updated: the `bare` NumberCard KPI strip.
- Decision: no new skills — every change extends a task an existing skill owns.
- Fresh-consumer evals remain open (see Remaining gaps); checks recorded are
  `intent validate`, unit tests and the browser harness.

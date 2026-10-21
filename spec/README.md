# Contracts

Per-reference contracts. Source-of-truth order:

1. `spec/*.md` — current API and behavior contracts.
2. [`adr/`](./adr/README.md) — decision history.
3. [`../PHILOSOPHY.md`](../PHILOSOPHY.md) — design rules.
4. [`../CONTEXT.md`](../CONTEXT.md) — shared vocabulary.

## Atomic design

- [`kit.md`](kit.md) — the atomic package graph, the three templates, and the
  site/story contract.
- [`states.md`](states.md) — states every shipped reference story must show.
- [`visual-system.md`](visual-system.md) — typography, control sizing, surfaces,
  states and motion.
- [`reference-examples.md`](reference-examples.md) — page and recipe inventory.
- [`migrations.md`](migrations.md) — breaking API and package moves, including
  the atomic package split.

The site indexes the component contracts by atomic level: `/atoms`,
`/molecules`, `/organisms` and `/templates`. The implementation package is
named in each contract's import example; the atomic level is not inferred from
the package name.

## Organisms and templates

- [`app-sidebar.md`](app-sidebar.md) — the one grouped sidebar organism.
- [`filter-bar.md`](filter-bar.md), [`stat-grid.md`](stat-grid.md),
  [`detail-header.md`](detail-header.md), [`page-toolbar.md`](page-toolbar.md)
  — reusable page regions.
- [`kanban-board.md`](kanban-board.md), [`data-table.md`](data-table.md),
  [`virtual-list.md`](virtual-list.md) — data-heavy organisms.
- [`app-shell.md`](app-shell.md), [`pane-layout.md`](pane-layout.md),
  [`auth-layout.md`](auth-layout.md) — the three templates.
- [`data.md`](data.md) — headless data helpers, query and form logic.

## Atoms and molecules

Each control has a file named by its slug (`button.md`, `dialog.md`,
`date-picker.md`, …). Input controls share the contract in [`inputs.md`](inputs.md)
and [`form.md`](form.md); their concrete per-control behavior stays in the
individual contract. `scroll-table.md` documents the table scroll molecule.

## Decision history

ADRs explain why a decision was made; when a later accepted contract disagrees,
the current `spec/*.md` wins. Design-delta audits and example refresh notes are
historical records, not supported import paths. ADR-0013 supersedes the earlier
package and shell mapping in ADR-0012.

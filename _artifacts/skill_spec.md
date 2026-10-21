# newui skill spec

A SolidJS component library built on Zag, typed variant recipes and Tailwind
CSS v4. The skills ship beside the packages they describe so an agent can load
the visual guidance, the data guidance, or both, at the installed version.

## Domains

| Domain | Description | Skills |
| --- | --- | --- |
| UI composition | The visual ladder, semantic tokens, labels and overlays. | `newui` |
| Data and forms | Collections, cache, mutations and form lifecycles. | `newui-data` |

## Skill Inventory

| Skill | Type | Domain | What it covers | Failure modes |
| --- | --- | --- | --- | --- |
| `newui` | core | UI composition | Atoms, molecules, organisms, templates, semantic tokens, the shared Field contract and overlay state. | 6 non-negotiables in `SKILL.md` |
| `newui-data` | core | Data and forms | `createCollection`, `DataProvider`, optimistic mutations, `createAppForm`, `Form` and `fieldError`. | 4 contracts in `SKILL.md` |

## Coverage and decisions

- The UI skill is owned by `@newui/atoms`, the package every visual page
  installs first. It names the sibling packages to inspect for molecules,
  organisms, templates and tokens instead of duplicating their APIs.
- The data skill is owned by `@newui/data` and is loaded only when the task
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

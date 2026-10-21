# Workspace packages, not subpaths

**Status**: accepted

## Context

frappe-ui is **one package with subpath exports** (`./list`, `./charts`,
`./editor`, `./code-editor`, `./vite`, `./vitepress`, `./style.css`, …). This
library could mirror that or split into workspace packages.

## Decision

Split into workspace packages. The core visual ladder is `@newui/atoms`,
`@newui/molecules`, `@newui/organisms` and `@newui/templates`; foundations,
headless data and optional chart/editor integrations have their own packages.
Each package exports its documented root surface; styling is provided by
`@newui/tailwind/style.css`, not a component-package subpath.

## Rationale

Each entry point has an independent dependency graph and bundle cost (the
charts package pulls echarts; the editor pulls TipTap). Separate packages give
that cost isolation, independent versioning, and a per-package `publint` check.
The dependency-cruiser rules ("tokens is a leaf", "packages never import apps")
are only expressible because the boundaries are real packages.

## Consequences

- Consumers install exactly what they use (`@newui/charts` does not drag the
  atomic component packages into a chart-only app).
- We do **not** mirror `./vitepress` (a docs theme is app code) or
  `./experimental`.
- Deliberate non-mirror: no `./style.css` subpath on a component package; the
  stylesheet is `@newui/tailwind/style.css`.

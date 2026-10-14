# Workspace packages, not subpaths

**Status**: accepted

## Context

frappe-ui is **one package with subpath exports** (`./list`, `./charts`,
`./editor`, `./code-editor`, `./vite`, `./vitepress`, `./style.css`, …). This
library could mirror that or split into workspace packages.

## Decision

Split into workspace packages: `@newui/tokens`, `@newui/tailwind`,
`@newui/icons`, `@newui/ui`, `@newui/charts`, `@newui/editor`,
`@newui/code-editor`, `@newui/vite`. `@newui/ui` exports **only** `.`.

## Rationale

Each entry point has an independent dependency graph and bundle cost (the
charts package pulls echarts; the editor pulls TipTap). Separate packages give
that cost isolation, independent versioning, and a per-package `publint` check.
The dependency-cruiser rules ("tokens is a leaf", "packages never import apps")
are only expressible because the boundaries are real packages.

## Consequences

- Consumers install exactly what they use (`@newui/charts` does not drag
  `@newui/ui`'s Zag machines into a chart-only app).
- We do **not** mirror `./vitepress` (a docs theme is app code) or
  `./experimental`.
- Deliberate non-mirror: no `./style.css` subpath on `@newui/ui`; the stylesheet
  is `@newui/tailwind/style.css`.

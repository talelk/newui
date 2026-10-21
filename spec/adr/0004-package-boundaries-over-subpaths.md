# Workspace packages, not subpaths

**Status**: accepted

## Context

A single package with many subpath exports (`./list`, `./charts`, `./editor`,
`./code-editor`, `./vite`, `./style.css`, …) would couple every dependency graph
to one release. This library splits that surface into workspace packages.

## Decision

Split into workspace packages. The core visual ladder is `@talelk/newui-atoms`,
`@talelk/newui-molecules`, `@talelk/newui-organisms` and `@talelk/newui-templates`; foundations,
headless data and optional chart/editor integrations have their own packages.
Each package exports its documented root surface; styling is provided by
`@talelk/newui-tailwind/style.css`, not a component-package subpath.

## Rationale

Each entry point has an independent dependency graph and bundle cost (the
charts package pulls echarts; the editor pulls TipTap). Separate packages give
that cost isolation, independent versioning, and a per-package `publint` check.
The dependency-cruiser rules ("tokens is a leaf", "packages never import apps")
are only expressible because the boundaries are real packages.

## Consequences

- Consumers install exactly what they use (`@talelk/newui-charts` does not drag the
  atomic component packages into a chart-only app).
- A docs theme and experimental surfaces stay out of the published packages.
- Deliberate non-mirror: no `./style.css` subpath on a component package; the
  stylesheet is `@talelk/newui-tailwind/style.css`.

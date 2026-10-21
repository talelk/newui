# newui

[![Tests](https://github.com/talelk/newui/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/talelk/newui/actions/workflows/tests.yml)
[![SolidJS](https://img.shields.io/badge/SolidJS-1.9-2c4f7c?logo=solid)](https://www.solidjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?logo=tailwindcss)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-f69220?logo=pnpm)](https://pnpm.io/)

A compact analytics UI system built with SolidJS, Zag, semantic tokens and
Tailwind CSS v4. Neutral surfaces, explicit blue primary actions, 28px default
controls and deliberate light/dark themes give business applications a shared
visual language.

## Develop

Use Node.js 24 or later and the pnpm version pinned in `package.json`.

```sh
corepack enable
pnpm install
pnpm dev
```

The playground is the documentation site and visual acceptance surface. Start
with `/foundations`, browse `/atoms` and `/organisms`, or open
`/pages/analytics`. `/pages` contains complete local business workflows;
`/kit/recipes` collects small examples outside the application catalog, while
the 68 solid-ui registry examples link to the atomic component or recipe they
demonstrate. Every page and live demo loads lazily.

```sh
pnpm storybook
```

Storybook is the isolated surface: every component, block, chart and
composition on its own origin, with one story per state
([`spec/states.md`](spec/states.md)). The site embeds the same story modules, so
a demo is written once.

## Packages

| Package | Responsibility |
| --- | --- |
| `@newui/tokens`, `@newui/tailwind` | Framework-neutral tokens and generated CSS |
| `@newui/atoms`, `@newui/molecules` | Single controls/marks and compound interactions |
| `@newui/organisms` | Application regions, sidebar, table and virtual list |
| `@newui/templates` | Exactly three page templates: `AppShell`, `PaneLayout`, `AuthLayout` |
| `@newui/icons` | Frappe glyphs as Solid components |
| `@newui/data` | Headless format/selection/undo/download, query and form logic |
| `@newui/charts` | Theme-aware ECharts SVG wrappers and accessible data fallbacks |
| `@newui/editor`, `@newui/code-editor` | TipTap and CodeMirror integrations |
| `@newui/vite` | Frappe development integration |

TanStack Table and Virtual belong to the organism package; Query and Form belong
to the headless data package. Applications import the atomic layer they use.
Reference checkouts remain read-only and are never shipped as runtime code.

## Contracts and validation

Read [AGENTS.md](AGENTS.md), [PHILOSOPHY.md](PHILOSOPHY.md),
[CONTEXT.md](CONTEXT.md), then the component's contract under `spec/`.
The [construction kit](spec/kit.md), [states](spec/states.md),
[visual system](spec/visual-system.md),
[migration notes](spec/migrations.md),
[reference inventory](spec/reference-examples.md) describe the redesign.

```sh
pnpm verify           # identical local and CI pipeline
pnpm verify:checks   # lint, architecture, types, tests, builds and budgets
pnpm verify:e2e      # real-browser component and application checks
pnpm shots           # review artifacts at 390 / 768 / 1440 in both themes
```

Type checking uses TypeScript 7. ESLint uses Microsoft’s TypeScript 6
compatibility package because its parser still requires the JavaScript compiler
API; both are installed side by side.

After public props change, run `pnpm api` and `pnpm site`, and keep the
`spec/*.md` prop tables in step — `pnpm specs:check` fails when a documented
prop no longer exists. After tokens change, run `pnpm css`. Generated files are
committed and drift is checked. Visual
baselines are updated deliberately and inspected before acceptance.

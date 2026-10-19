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
with `/foundations`, browse `/components` and `/blocks`, or open
`/examples/analytics`. `/examples` contains complete local business workflows;
`/examples/patterns` maps all 68 solid-ui registry examples to their newui
compositions. Every page and live demo loads lazily.

## Packages

| Package | Responsibility |
| --- | --- |
| `@newui/tokens`, `@newui/tailwind` | Framework-neutral tokens and generated CSS |
| `@newui/ui`, `@newui/icons` | Accessible Solid controls and glyphs |
| `@newui/blocks` | Composed application sections, depending only on UI |
| `@newui/charts` | Theme-aware ECharts SVG wrappers and accessible data fallbacks |
| `@newui/editor`, `@newui/code-editor` | TipTap and CodeMirror integrations |
| `@newui/vite` | Frappe development integration |

TanStack Table, Virtual, Query and Form are used in the application examples.
They add no dependencies to the component or blocks packages. Reference checkouts
remain read-only and are never shipped as runtime code.

## Contracts and validation

Read [AGENTS.md](AGENTS.md), [PHILOSOPHY.md](PHILOSOPHY.md),
[CONTEXT.md](CONTEXT.md), then the component's contract under `spec/`.
The [visual system](spec/visual-system.md),
[migration notes](spec/migrations.md),
[reference inventory](spec/reference-examples.md) and
[TanStack integration](spec/tanstack-integration.md) describe the redesign.

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

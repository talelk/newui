# newui

[![Tests](https://github.com/talelk/newui/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/talelk/newui/actions/workflows/tests.yml)
[![SolidJS](https://img.shields.io/badge/SolidJS-1.9-2c4f7c?logo=solid)](https://www.solidjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?logo=tailwindcss)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-f69220?logo=pnpm)](https://pnpm.io/)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

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
the 68 copyable registry examples link to the atomic component or recipe they
demonstrate. Every page and live demo loads lazily.

```sh
pnpm storybook
```

Storybook is the isolated surface: every component, block, chart and
composition on its own origin, with one story per state
([`spec/states.md`](spec/states.md)). The site embeds the same story modules, so
a demo is written once.

## Deploy

Pushes to `main` deploy the playground to GitHub Pages through
[`.github/workflows/pages.yml`](.github/workflows/pages.yml). The workflow
builds with the repository's Pages base path, publishes Storybook under
`/storybook/`, copies `index.html` to `404.html` so deep links boot the router,
and adds `.nojekyll`. The Vite base and the Solid Router base both come from
`VITE_BASE`, so local development stays at `/`.

## Release

Semver is automatic. Every change carries a Changeset; the Changesets workflow
opens or updates a **Version Packages** pull request with the calculated bumps,
the changelog, the skill metadata and the regenerated site data (the changelog
page and masthead version chip). Merging that pull request publishes the new
versions.

Publishing uses npm trusted publishing, not a stored token:
[`.github/workflows/changesets.yml`](.github/workflows/changesets.yml) requests
`id-token: write`, and the npm CLI exchanges GitHub's OIDC identity for a
short-lived credential. Every published package declares a public
`publishConfig` and its `repository`, which npm needs for provenance.

### First publish

A package must exist before npm lets you configure its Trusted Publisher, and a
Trusted Publisher is required before OIDC can publish it. Bootstrap once:

1. Publish the first versions with a one-time npm credential (locally or from a
   temporary trusted workflow). Do not store that credential in this repository.
   The root package is private and versionless, so publish the workspace:

   ```sh
   npm login
   pnpm publish:stage
   ```
2. Configure a **Trusted Publisher** for every package. The script uses npm's
   bulk `trust` command, runs the first 2FA prompt, and then sets the
   `NPM_PUBLISH` repository variable:

   ```sh
   pnpm trust:publishers
   ```

   It configures GitHub Actions, owner `talelk`, repository `newui`, workflow
   `changesets.yml`, with `npm publish` allowed. Use
   `pnpm trust:publishers --no-enable` if you want to inspect the result before
   enabling releases.
3. The release script remains gated while `NPM_PUBLISH` is false, so a Version
   Packages PR never paints `main` red before the external setup is complete.

After that, merging a Version Packages pull request versions and publishes
automatically through OIDC; no `NPM_TOKEN` secret is required or used.

## Packages

| Package | Responsibility |
| --- | --- |
| `@talelk/newui-tokens`, `@talelk/newui-tailwind` | Framework-neutral tokens and generated CSS |
| `@talelk/newui-atoms`, `@talelk/newui-molecules` | Single controls/marks and compound interactions |
| `@talelk/newui-organisms` | Application regions, sidebar, table and virtual list |
| `@talelk/newui-templates` | Exactly three page templates: `AppShell`, `PaneLayout`, `AuthLayout` |
| `@talelk/newui-icons` | The icon set as Solid components |
| `@talelk/newui-data` | Headless format/selection/undo/download, query and form logic; `/resource` is the Frappe DocType client |
| `@talelk/newui-charts` | Theme-aware ECharts SVG wrappers and accessible data fallbacks |
| `@talelk/newui-editor`, `@talelk/newui-code-editor` | TipTap and CodeMirror integrations |
| `@talelk/newui-vite` | Development integration: dev-server proxy, icons and DocType types |

TanStack Table and Virtual belong to the organism package; Query and Form belong
to the headless data package. Applications import the atomic layer they use.
Development reference checkouts remain read-only and are never shipped as
runtime code.

## Contracts and validation

Read [AGENTS.md](AGENTS.md), [PRINCIPLES.md](PRINCIPLES.md),
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

## Sources and inspiration

newui is an independent SolidJS implementation, not an official port. It began
as a SolidJS reworking of [frappe-ui](https://github.com/frappe/frappe-ui) and
its design language, and it borrows composition patterns and registry examples
from several open-source projects. Thank you to the people who built and shared
them:

- **[frappe-ui](https://github.com/frappe/frappe-ui)** — Frappe Technologies and
  contributors. Its component library and design approach are the primary
  reference.
- **[SolidUI](https://www.solid-ui.com/)** — Stefan Karger, Michael Essiet and
  contributors. The 68 registry examples and several application compositions
  are adapted from this SolidJS port of shadcn/ui and Tremor.
- **[shadcn/ui](https://github.com/shadcn-ui/ui)** and
  **[Tremor](https://github.com/tremorlabs/tremor)** — the upstream design and
  composition sources behind SolidUI's registry.
- **[Zag](https://github.com/chakra-ui/zag)** — Chakra UI and contributors. Zag
  supplies the accessible state machines behind our overlays, menus, pickers
  and controls.
- **[TanStack](https://tanstack.com/)** — Query, Form, Table and Virtual power
  the headless data layer and its rendered organisms.
- **[SolidJS](https://www.solidjs.com/)**,
  **[Tailwind CSS](https://tailwindcss.com/)**,
  **[Lucide](https://lucide.dev/)**, **[ECharts](https://echarts.apache.org/)**,
  **[TipTap](https://tiptap.dev/)** and
  **[CodeMirror](https://codemirror.net/)** — the runtime, styling, icon,
  charting and editing foundations.
- **[Inter](https://rsms.me/inter/)** — Rasmus Andersson and the Inter Project
  Authors. The default typeface, shipped under the SIL Open Font License.

These projects are not affiliated with newui and do not endorse it. Their
licenses remain their own; the read-only checkouts under `references/` are
development references, not published package content.

## License

newui is released under the [Apache License 2.0](LICENSE).
Copyright 2026 the newui contributors.

The project includes material derived from MIT-licensed sources. Their
copyright and permission notices are recorded in [NOTICE](NOTICE).

License compatibility is intentional: the shipped dependencies are MIT,
Apache-2.0, BSD (2- or 3-clause), ISC, 0BSD or OFL, all compatible with an
Apache-2.0 distribution. The MPL-2.0 packages in the workspace are development
tools and are not part of the published package runtimes. The Inter font keeps
its own SIL Open Font License, included with the font files.

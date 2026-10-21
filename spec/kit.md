# Atomic design kit

Status: accepted. This is the current package, template and site contract. Older
ADRs and visual audits remain history; they do not describe the supported API.

## The visual ladder

| Level | Question | Package / surface | Current inventory |
| --- | --- | --- | --- |
| Foundations | What does it look like? | `@newui/tokens`, `@newui/tailwind`, `@newui/icons` | tokens and glyphs |
| Atoms | What is this single element? | `@newui/atoms` | 20 references |
| Molecules | What is this interaction? | `@newui/molecules` | 42 references |
| Organisms | What is this page region? | `@newui/organisms` | 24 references |
| Templates | How does the page open? | `@newui/templates` | exactly 3 templates |
| Pages | What does the product do? | applications in `apps/*` | 12 recipes plus starter |

`@newui/charts`, `@newui/editor` and `@newui/code-editor` remain separately
installable domain add-ons. Their entries are classified by composition in the
atomic reference, while their package boundaries keep ECharts, TipTap and
CodeMirror optional. `@newui/data` is the headless logic branch beside the
visual ladder; it owns helpers, Query and Form, not rendered tables or lists.

## Package graph

The source tree and public package names follow the dependency direction:

```text
@newui/tokens / @newui/tailwind / @newui/icons
                 ↓
@newui/atoms → @newui/molecules
                    ↓
               @newui/organisms
                    ↓
               @newui/templates
                    ↓
             apps/playground / apps/starter

@newui/data ─────────────────→ apps/*
```

Core organism exports include `AppSidebar`, `FilterBar`, `StatGrid`,
`KanbanBoard`, `DataTable` and `VirtualList`. The rendered table and virtual
list moved here from `@newui/data`, making data headless again. `ScrollTable` is
a molecule: it is a labelled horizontal scroll wrapper, not a table engine.

The registry has one explicit `atomic` level per entry in
[`scripts/atomic.ts`](../scripts/atomic.ts). It is exhaustive: a public entry
without a classification fails `pnpm site`; extra classification entries fail
the atomic tests. Package ownership and atomic level are related but not
identical—for example, the charts add-on contains both molecule-level chart
parts and organism-level chart widgets.

## The three templates

`@newui/templates` exports exactly:

1. **`AppShell`** — the only application shell. It owns one responsive sidebar:
   brand/logo, tenant slot, multi-section icon navigation, collapse-to-icons,
   settings and user/account slots at the bottom. At desktop it docks and
   collapses to labelled icons; on mobile that same expanded menu is a modal
   drawer. There is no rail/sidebar split and no separate desktop/mobile shell.
2. **`PaneLayout`** — a resizable two-pane content arrangement inside a shell.
   It does not add another app frame.
3. **`AuthLayout`** — a centered public-access frame, with an optional desktop
   context panel. `AuthCard` remains an organism; auth/session behavior remains
   app-owned.

Deals, Tickets, the other workspace recipes, Discussions and the starter use
`AppShell`. Mail composes `PaneLayout` inside it. Sign-in pages use
`AuthLayout`. The old `AppLayout`, `AppShell` primitive, `DesktopShell`,
`MobileShell`, `ResponsiveShell`, rail APIs and old package names are removed;
there are no compatibility wrappers or redirects.

## Pages, docs and stories

The site indexes and Storybook taxonomy use `Atoms`, `Molecules`, `Organisms`
and `Templates`; complete applications are under `Pages`. The separate
`/kit/recipes` guide holds combinations that teach a technique but are not yet
public components. Registry examples with an existing API link to its atomic
reference page instead of gaining a page-level duplicate. `pnpm stories:check`
pins one `Default` story per shipped reference entry and the state contract in
[`states.md`](./states.md).

`/architecture` explains the levels and package graph; `/kit` shows how to
compose them and wire data; `/kit/recipes` holds the non-public recipe gallery;
`apps/starter` is the working copyable composition. Component and template
previews render the same story `Demo` through the bare same-origin
`/preview/<name>` document, so the site's live demo and viewport preview work
without a Storybook process; Storybook remains the isolated review surface and
the explicit “Open in Storybook” destination. The old package routes are
deleted rather than redirected—the docs, command palette, generated registry,
stories and tests link only to the new paths.

## Rules and gates

- Dependencies point down the atomic graph. `@newui/data` imports no visual
  package; charts and editor engines remain optional.
- Every public package has an explicit exports test and manifest check.
- Every reference entry has a contract, isolated story, generated props and a
  measured budget. No generated registry entry can invent a package export.
- `AppShell` has unit/browser coverage for desktop collapse, mobile drawer,
  tenant/menu interaction, fixed footer actions, focus, and no rail/sidebar
  duplication.
- The full `pnpm verify` pipeline remains the acceptance gate; no refactor
  bypasses type, a11y, CSS, bundle, route, Storybook or browser checks.

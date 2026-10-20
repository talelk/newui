# newui

A SolidJS component library — the equivalent of `frappe-ui` rebuilt on
**SolidJS + Zag + typed variant recipes + Tailwind CSS v4**.

The Vue originals are checked out read-only at `references/frappe-ui-main/` and the Zag
source at `references/zag-main/`. Port from them; never edit them.

Ship tier: prod.

## Read order

1. [`AGENTS.md`](./AGENTS.md) — this file.
2. `PHILOSOPHY.md` — API design rules (ported from frappe-ui, P1–P15).
3. `CONTEXT.md` — shared vocabulary (variant/theme, open, dismissible, …).
4. `spec/*.md` — per-component API contracts.

When docs disagree: `spec/*.md` > ADRs > `PHILOSOPHY.md` > `CONTEXT.md`.

## Architecture

| Layer | Package | Notes |
| --- | --- | --- |
| tokens | `@newui/tokens` | framework-neutral token data + CSS-var generator |
| tailwind | `@newui/tailwind` | v4 `@theme`/`@utility`/plugins, `style.css` |
| icons | `@newui/icons` | Frappe's glyphs as Solid components |
| components | `@newui/ui` | Solid compounds over Zag; `tv()` recipes |
| blocks | `@newui/blocks` | composed sections built on `@newui/ui` |
| layouts | `@newui/layouts` | page templates built on the components and blocks |
| data | `@newui/data` | the logic layer: formatting, selection, undo, downloads; `/query` adds the client, repository and collection mutations (headless) |
| code editor | `@newui/code-editor` | CodeMirror 6 Solid component |
| rich text | `@newui/editor` | TipTap 3 Solid editor + toolbar |
| charts | `@newui/charts` | echarts Solid wrappers (SVG renderer) |
| vite | `@newui/vite` | Frappe dev proxy · lucide auto-import · DocType types |
| site | `apps/playground` | the docs site, Storybook's host, and the visual acceptance surface |

The kit's direction is [`spec/kit.md`](./spec/kit.md) (ADR-0012): the ladder
gains layouts (`@newui/layouts`), logic (`@newui/data`), the Storybook surface
and the starter, in that order. Storybook, `@newui/layouts` (`AppLayout`,
`PaneLayout`) and `@newui/data`'s pure helpers have landed; the async/forms
surfaces and the starter have not, so *that* row is still the full architecture
below.

- **Primitives:** raw `@zag-js/*` via `useMachine` + `normalizeProps`
  (`packages/ui/src/lib/zag.ts`). Zag supplies keyboard, ARIA and focus.
- **Styling:** `tv()` recipes replace frappe-ui's hand-written class maps. Only
  two color axes exist — `variant` + `theme` (P4).
- **State:** no `v-model`. Use `open`/`onOpenChange` (overlays) via
  `createDisclosure`, or let the Zag machine own state (`checked` +
  `onCheckedChange`). `createControllableSignal` covers other two-way state.
- **Slots:** no named slots. Use compound subcomponents (`Dialog.Trigger`) and
  `prefix`/`suffix`/`icon` props on atoms.
- **Styling hooks:** `data-slot` / `data-state` attributes, never class props
  (P10). No class-injection props.

## The site (`apps/playground`)

The playground became the documentation site; it keeps every harness route it
had, hosts Storybook, and stays the surface the design work is reviewed on.

Storybook is the isolated surface (`spec/kit.md`, W1): every component, block,
chart and composition has one story file, `src/stories/<name>.stories.tsx`,
with a non-story `Demo` (the site's inline embed) plus `Default` and the states
[`spec/states.md`](./spec/states.md) requires. `pnpm storybook` serves it on
**6006**; the built static output (`pnpm storybook:build`) answers on **6007**
via `pnpm storybook:serve`, which is what the harness, `pnpm shots` and the docs
build embed.

| path | what it is |
| --- | --- |
| `/` `/docs` `/foundations` `/architecture` `/examples/*` | the site, inside `SiteLayout` (masthead · sidebar · content · prev/next). `/architecture` is the ladder written down: five levels, one question each, with counts generated from the registry |
| `/components` · `/components/<name>` | the component reference, inside `ComponentsLayout` — same chrome, but the sidebar is the filterable index |
| `/blocks` · `/blocks/<name>` | the same, for `@newui/blocks` |
| `/layouts` · `/layouts/<name>` | the same, for `@newui/layouts` |
| `/spec` | the deterministic page the browser harness drives — no chrome, no network |
| `/examples/<slug>` · `/examples/<slug>/fullscreen` | one application guide with a persistent responsive preview; a bare application viewport |
| `/charts` · `/editors` | generated chart and editor reference pages |

Storybook is not a site route: it renders the same story modules on its own
origin, and `pnpm stories` writes the index (`generated/stories.json`) that the
harness, the docs embed and the sweep unit share.

Three rules keep it fast, and each has a guardrail:

- **Every route is a lazy chunk.** Pages are reached only through `import()` in
  `routes.tsx`; a static import there would ship that page on every route.
  `dependency-cruiser` (`site-shell-stays-lean`) and `routes.test.ts` enforce it.
- **The shell imports no component.** Masthead, sidebar and layout are plain
  markup over semantic tokens; `createColorScheme` is the one runtime import
  (a singleton in `shell/theme.ts`, so two consumers cannot drift).
- **A route pays for itself, measured.** `pnpm budget` loads the built site per
  route and sums the gzip of every chunk that route fetched. The old playground
  mounted all six sections on `/` and cost 219 kB gzip; the first split reached
  48. Current checkpoint measurements are under Performance below.

### The component reference

`/components/<name>` is assembled, not written: the live demo, the prop tables
and the contract all come from something that already exists, so adding a
component to the library and running `pnpm api` + `pnpm site` produces its page.

- **`pnpm site`** generates `apps/playground/src/generated/` (committed, like
  `theme.css`): the registry from `api.json` — components *and* blocks, told
  apart by the source path — and one prop-table module per entry so a page
  fetches ~1 kB of tables instead of the 111 kB `api.json`. **`pnpm site:check`**
  fails on drift, in CI with the other gates.
- **Specs are not copied.** `lib/specs.ts` reads `spec/*.md` with
  `import.meta.glob(..., '?raw')`, so `spec/` stays the single source of truth
  and each page downloads its own contract. The glob crosses the app root, which
  is why `vite.config.ts` allows exactly that one directory.
- **One story file per component** (`src/stories/<name>.stories.tsx`, lazily
  imported by the generated `src/generated/stories.ts`). The file's non-story
  `Demo` export is the site's inline embed — one demo, two surfaces. The
  generated index is Storybook's own (`pnpm stories`), so the sweep unit and a
  deep link cannot drift from what Storybook serves.
- The shell imports no component; only the reference routes import the index.
  That keeps the home page independent of the component registry and stories.

### Blocks

`@newui/blocks` is the composed layer: a component answers *what is this
control*, a block answers *how does a page open*. Seven so far — `AppSidebar`,
`PageToolbar`, `FilterBar`, `DetailHeader`, `StatGrid`, `AuthCard`,
`KanbanBoard` — each with a story file, a contract in `spec/`, a generated page and a
budget entry (`scripts/size.ts`, "Blocks barrel").

A block may only import `@newui/ui`. If one needs a chart or an editor it belongs
in that package's surface, not here — which is also why `pnpm size` asserts the
blocks entry cannot reach the slider, the toast or the date picker.

`pnpm shots` writes screenshots for every route × theme × width, plus the story
spot-checks on Storybook's origin, into `test-results/shots/` (gitignored,
nothing asserts on them) — it is the loop the design work runs on, not a
regression suite.

### Application and reference examples

`/examples` links every application recipe. All eight Frappe recipe families
share one documentation destination per family and respond to the actual viewport; solid-ui's five application examples and 68
registry examples have explicit destinations. `spec/reference-examples.md`
documents the mapping and acceptance boundaries. `lib/examples.ts` owns the
application catalog; `lib/reference-examples.ts` owns the registry mapping.
Every shipped reference component must have an isolated lazy story.

TanStack Solid Query and Form belong to `@newui/data` (`/query`: the client, the
repository contract and the collection mutations; `/form`: the submit lifecycle
and the field-error bridge). Table and Virtual remain at the page layer until
their promoted surfaces land. Blocks still import only `@newui/ui`; charts and
editors stay at the page layer.

## Guardrails (enforced by tests, not convention)

- **Lint & format** — Biome (`pnpm lint`), plus **ESLint with
  `eslint-plugin-solid` only** (`pnpm lint:solid`) for the Solid rules Biome
  lacks: prop destructuring (kills reactivity), `.map()` where `<For>` belongs,
  early returns in a component body, untracked reactive reads, `innerHTML`, the
  `style` prop. Two linters is a cost; not checking these is worse.
- **Architecture** — `dependency-cruiser` (`pnpm arch`,
  `.dependency-cruiser.cjs`): no cycles, `lib/` must not depend on `components/`,
  `@newui/tokens` is a leaf, packages never import from `apps/`, nothing imports
  from `dist/`.
- **Package correctness** — `publint --strict` (`pnpm packages:check`) validates
  every package's `exports`, `files` and conditions for consumers.
- **Types** — `tsc --noEmit` with `strict`, `noUncheckedIndexedAccess`,
  `noPropertyAccessFromIndexSignature`, `noImplicitOverride`, `noImplicitReturns`
  and `allowUnreachableCode: false`. (`exactOptionalPropertyTypes` is off: it
  fights passing `T | undefined` into `{ x?: T }` for little benefit here.)
- **Merge correctness** (`packages/ui/src/lib/tw-merge.test.ts`): two layers.
  An **axis-independence invariant** — utilities on different CSS properties
  (`p-2`+`px-4`, `border-2`+`border-t-transparent`, `size-4`+`w-8`) must both
  survive, while a same-axis override must not — and an **all-pairs equivalence
  sweep** against the extended default (~128k cases, every ordered pair of
  utilities in the source). The sweep is all-pairs, not same-prefix: the
  padding/margin bug hid precisely in the gap between `p` and `px`.
- **CSS emission** (`pnpm css:check`, after the playground build): every utility
  a component references must exist in the emitted stylesheet. This is the
  general form of the transparent-dialog bug and of any class that never reaches
  the output (typo, unscanned file, over-broad `@source not`). It resolves each
  token through the merge config's validators, so placement values like
  `bottom-end` are not mistaken for classes.
- **Box metrics** (`e2e/interaction.spec.ts`): a rendered Button must keep
  non-zero horizontal padding and its height — the runtime check for a dropped
  axis utility, which a class-name assertion cannot see.
- **Token discipline** (`packages/tailwind/src/tokens.test.ts`): every semantic
  token a component references must exist in the generated `@theme`; raw palette
  colours and hard-coded hex/rgb/hsl values are rejected.
- **Animation integrity** (`packages/tailwind/src/keyframes.test.ts`): every
  `animate-[name_…]` must have a matching `@keyframes name`; reduced motion is
  respected.
- **Theme vocabulary** (`packages/tailwind/src/generated.test.ts`): the tokens
  overlays and shells depend on must be emitted.
- **Public surface** (`packages/ui/src/exports.test.ts`) and **manifest**
  (`package.test.ts`) pin the exported names and `exports` targets.
- **API tables** — `pnpm api` / `pnpm api:check`.
- **Spec contracts** (`pnpm specs:check`, `scripts/check-specs.ts`): every prop
  a `spec/*.md` table documents must exist in `api.json`, and every fenced
  `ts`/`tsx` sample must parse — a renamed prop fails here, not in a reader's code.
- **a11y** — axe in the component tests (`*.a11y.test.tsx`) and, with real CSS,
  in the browser harness.
- **Contrast contract** (`packages/tailwind/src/contrast.test.ts`): every
  foreground/background pairing the recipes ship is asserted against WCAG AA in
  both themes. A failing pair is a legibility bug, not a taste call.
- **Bundle budget & tree-shaking** (`scripts/size.ts`, `pnpm size`): each entry
  has a gzip budget and a tree-shaking assertion (importing `Button` must not
  drag in the Dialog machine).
- **Route budget** (`scripts/budget.ts`, `pnpm budget`): loads the built site per
  route and sums the gzip of every chunk that route actually fetched. A route
  that quietly starts pulling another page's chunk fails here, not in production.
- **Affected routing** (`scripts/affected.ts`, `pnpm verify:affected`): the CI
  gate table doubles as a dirty-path router, so the local loop is "change →
  affected", not "change → twelve minutes of unrelated gates". Unclaimable
  paths (root configs, CI definitions) fall back to the full pipeline, and
  `scripts/affected.test.ts` pins the mapping.
- **The merge sweep is separate from the loop** (`tw-merge.sweep.test.ts`,
  `pnpm test:sweep`): `pnpm test` runs the fast per-family golden pairs; the
  quadratic all-pairs sweep is a CI step that `verify:affected` pulls in only
  when the merge config or the token vocabulary changes.
- **Reference paths** (`pnpm refs:check`, `scripts/check-references.ts`):
  every `references/…` path mentioned in AGENTS/spec/README must exist — the
  guard against moving a checkout under the docs.
- **Story index & state contract** (`pnpm stories:check`, `scripts/stories.ts` +
  `scripts/story-states.ts`): Storybook's own index must match the committed
  `generated/stories.json` and `generated/stories.ts`; every shipped component
  must have a story file with `Default`, and every state
  [`spec/states.md`](./spec/states.md) requires must exist. The spec is the
  policy; `scripts/story-states.ts` is the machine copy.
- **Site structure** (`apps/playground/src/routes.test.ts`): the nav tree and the
  route table must describe the same paths in both directions, and every page
  import in `routes.tsx` must be lazy. A sidebar link with no route and a route
  nobody can reach are both caught.
- **Disposal** (`packages/ui/src/lib/disposal.test.tsx`): mount/unmount 100
  overlays and assert `document.body` is unchanged — no node or listener leak.
- **Browser harness** (`e2e/`, `pnpm test:e2e`, Playwright's pinned Chromium): axe on
  real CSS (colour contrast), keyboard/focus-visible/focus-trap, tabs/select/
  switch/tooltip interaction, responsive overflow at 320/768/1280, RTL, 200%
  text zoom, and perf budgets (LCP, CLS, dialog latency, 2000-row list). The
  computed-style invariants that the screenshots were doing the work of:
  `design-contract.spec.ts` (every story in the generated index mounts, fits
  375px, and keeps its box metrics — one load per story, three measurements), `overlay-stacking.spec.ts` (every overlay panel is
  portal-mounted, hit-tests above its siblings, and closes on Escape),
  `style-tokens.spec.ts` (every colour the browser resolves on `/spec` is a
  semantic token, in both themes), `chrome-scrollbars.spec.ts` (nothing inside
  an app rail is a scroll container — the phantom half-pixel scrollbar class),
  and `no-duplicate-controls.spec.ts` (no
  role+name control appears twice outside row instances). `flake-reporter.ts`
  prints any test that passed only after a retry — a green retry is not an
  excuse for a flake.
- **Coherence sweep** (`e2e/coherence.spec.ts`, engine in `e2e/_lib/coherence.ts`):
  every story in `generated/stories.json` in a real browser must report zero of
  four generic violations — viewport overflow, clipped content, text truncated
  with no escape hatch, and controls whose every sampled hit point lands
  elsewhere (the invisible-overlay bug as a rule). The same pass samples each
  `data-slot` element's computed style into role vectors;
  `peer roles resolve identically` compares semantic peers across *all* stories
  and fails on *new* drift — today's measured drift is pinned in
  `e2e/role-drift.baseline.json` and shrinks via `UPDATE_ROLE_DRIFT=1`.
- **Stress sweeps** (`e2e/stress.spec.ts`): 150% text scale, a sweep of the
  in-between widths the fixed breakpoints miss (360/501/769/1025), and seeded
  full-unicode fuzz (`fast-check`) into every text input — each asserts the
  invariants that must survive, not a particular rendering.
- **Calibration** (`e2e/calibration.spec.ts` + `e2e/fixtures/`): the harness
  tests its own eyes. Every generic detector must flag a deliberately broken
  fixture page, and must stay silent on a clean one — a green sweep that
  cannot see a known-broken page is a quiet sweep, not a working one.
- **Memory & leak tripwires** (`e2e/memory.spec.ts`, probe in
  `e2e/_lib/memory.ts`): heap is measured through CDP (`Runtime.getHeapUsage`)
  with forced GC (`HeapProfiler.collectGarbage`) — a delta measured without a
  collection is noise. Overlay churn (20 open/close cycles per overlay) must
  return both DOM and heap to baseline; `disposal.test.tsx` proves the unit
  level, this proves the page level, where `window` listeners, uncleared timers
  and closed-over machines grow the heap even when the DOM never moves.
  Route navigation gets the same ratchet check, and every surface carries a
  measured-headroom budget.
- **Advisory visual review** (`pnpm review`, `scripts/visual-review.ts`): not
  a gate. Runs the same deterministic sweep on live routes, crops each flagged
  region, and — with `NEWUI_VLM_ENDPOINT` set — asks a vision model for a
  structured verdict. Findings land in `test-results/review/`; `--require`
  makes them blocking for the nightly design loop.

## CI

- **One pipeline, two runners.** `scripts/ci-steps.ts` declares the steps;
  `.github/workflows/tests.yml` runs them as individual labelled steps, and
  `pnpm verify` runs the identical commands locally. `ci.test.ts` fails if the
  workflow and the declaration drift, so "CI runs locally" stays true.
- `pnpm verify` (all) · `pnpm verify:checks` (fast gates) · `pnpm verify:e2e`
  (browser harness) · `pnpm verify:affected` (only the gates the diff can
  dirty — the agent loop: change → affected → full `verify` before pushing)
  · `pnpm verify --only=lint,test` · `pnpm verify --from=size`.
- `pnpm ci` is pnpm's own clean-install command, not ours — use `pnpm verify`.
- Every step runs even after an earlier failure, so one run reports everything.
- Optional: `act` (with Docker) can execute the workflow itself; `pnpm verify`
  is the primary path because it needs no Docker and no image pull.

## Performance

- **Sizes**: `pnpm size` prints gzip per entry and enforces budgets.
- **Lighthouse**: `pnpm lighthouse` runs Lighthouse (throttled mobile) against
  the built playground and enforces budgets — accessibility / best-practices /
  SEO / CLS / console-errors / render-blocking must be perfect, the performance
  *score* only has a floor (it is noisy under throttling). The library's real
  cost is the bundle budget below, not this score.
- **App-level, not library**: the site inlines its single CSS file
  (`inlineCss` in `apps/playground/vite.config.ts`, removing a render-blocking
  round trip) and code-splits every route with dynamic imports. A library must
  not do either — consumers own their asset pipeline.
- **Measured checkpoint** (ladder pass, re-measured with `pnpm size` +
  `pnpm budget`): `cn()` 6.40 kB · `Button` 8.68 kB · `Button + Dialog`
  30.08 kB · full barrel 228.48 kB · blocks barrel 77.67 kB · layouts barrel
  36.35 kB (gzip, `solid-js` external). Site: home (`/`) 56.6 kB, analytics
  fullscreen 338.1 kB, tasks fullscreen 181.4 kB, accounting fullscreen
  332.9 kB — every entry and route within its budget. Treat these as checkpoint
  measurements; `pnpm size` and `pnpm budget` provide current evidence and
  enforce the limits.
- **Removed `tailwind-variants`** (it bundled its own merge integration) in
  favour of an in-house `tv`/`cn`/`cx` in `lib/tv.ts`: `Button` went 34.3 →
  16.3 kB. The resolver is typed (`VariantProps<typeof recipe>` recovers the
  axis unions) and pinned by `lib/tv.test.ts`.
- **Pruned `tailwind-merge`'s config** (`lib/tw-merge.config.ts`): the default
  ships every Tailwind group (~14 kB gzip) on every component.
  `createTailwindMerge` needs a full config, so this one declares only the
  families this library emits, and `lib/tw-merge.test.ts` proves it agrees with
  the (extended) default for **every ordered pair** of utilities in the source. The
  sweep grows with the vocabulary; it now exercises over 540,000 cases. `cn()` 14.1 → 6.5 kB, `Button` 16.3 → 8.6 kB.
  - Note the config is *not* a subset of the default in effect: it also fixes a
    latent bug where numeric `rounded-<n>` and named `shadow-<step>` (our
    vocabulary, unknown to the stock config) did not override each other.
- **Runtime**: `e2e/perf.spec.ts` budgets (LCP < 2.5 s, CLS < 0.1, dialog open,
  2000-row list) plus the disposal test are the runtime guards.

## Where the code is patterned

- **`lib/tv.ts`** — the variant resolver (`tv`, `cn`, `cx`, `VariantProps`).
- **`lib/zag.ts`** — `createZagApi(machine, connect, props)` returns the
  connected-API memo every Zag component needs; `createZagContext(name)` is the
  provider + `useApi` pair for a compound family, with a named error. Every
  Zag-backed component uses them — no component calls `useMachine` directly.
- **`lib/field.tsx`** — the shared labelling contract (P5).
- **`lib/color-scheme.ts`** — the single writer of the light/dark axis.

## Theming

- Light/dark is the `colorScheme` axis, owned by `createColorScheme`
  (`packages/ui/src/lib/color-scheme.ts`): it persists the choice, tracks the OS
  live, flips `data-theme`, sets the CSS `color-scheme` property (so native
  scrollbars/controls match), and suppresses transitions for two frames around a
  swap. Never use `theme` to mean light/dark.
- A branded app retunes the whole system by overriding the runtime custom
  properties (`--surface-*`, `--ink-*`, `--outline-*`) — no component changes.

## Commands

```
pnpm dev            # site (dev server)
pnpm storybook      # Storybook, the isolated surface (6006)
pnpm storybook:build # static Storybook build (storybook-static/)
pnpm storybook:serve # serve the static build (6007; harness, shots, docs)
pnpm stories        # regenerate generated/stories.json + stories.ts from Storybook's index
pnpm stories:check  # fail on stale index or a missing required state (spec/states.md)
pnpm build          # build all packages
pnpm shots          # screenshots: every route × theme × width + story spot-checks
pnpm review /spec   # advisory visual review of live routes (test-results/review)
pnpm site           # regenerate the component registry + per-component API slices
pnpm budget         # per-route gzip budget, measured in a real browser
pnpm test           # vitest (unit + a11y + manifest)
pnpm test:ssr       # Solid SSR smoke tests
pnpm typecheck      # tsc, every package
pnpm lint           # biome check
pnpm lint:fix       # biome check --write
pnpm knip           # dead-code / unused-deps
pnpm verify         # run the whole CI pipeline locally (same steps as CI)
pnpm verify:affected # only the gates the dirty files can break (scripts/affected.ts)
pnpm verify:checks  # the fast gates only
pnpm verify:e2e     # the browser harness only
pnpm api            # regenerate packages/ui/api.json
pnpm api:check      # fail if the API table is stale
pnpm test:sweep     # tw-merge all-pairs equivalence (routed by affected, not by pnpm test)
pnpm refs:check     # every references/… path mentioned in docs exists
pnpm docs:build     # render spec/*.md + api.json into a static docs/ site
pnpm css            # regenerate @theme + tokens CSS   (run after token changes)
pnpm changeset      # add a changeset
```

## Rules

- Semantic tokens only (`surface-*`, `ink-*`, `outline-*`) — never raw colors.
- Every input control reuses the shared labelling contract (`Field`, P5).
- Accessibility is part of done: keyboard, focus, ARIA (P12).
- A component is not done until it has: `Root.tsx`, `recipe.ts`, `types`, a
  `.test.tsx` (logic/ARIA) and, where it renders, a `recipe.test.ts`.
- Public surface changes are listed in `packages/ui/src/exports.test.ts`.

## Do not

- Invent new public API vocabulary without checking `PHILOSOPHY.md`/`spec/`.
- Add class-name or style-injection props.
- Edit the reference checkouts (`references/frappe-ui-main/`, `references/solid-ui-main/`, `references/zag-main/`).

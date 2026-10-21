<!-- intent-maintainer:start -->
## Library Skill Maintenance

Use the repository’s installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement.
Before substantial library source, documentation, examples, tests, or skill work, run `pnpm exec intent meta generate-skill` and follow the packaged maintainer procedure.
Use the current request and repository evidence. For initial skills, propose a useful batch and reuse any scope already agreed with the maintainer.
Before handing off a skill batch or library change, run `pnpm exec intent maintainer review --json`. Follow the maintainer procedure to update affected guidance, run task checks, and record completed review outcomes. Report an evidence-backed no-op or missing evidence explicitly.
Create and incrementally maintain domain_map.yaml, skill_spec.md, and skill_tree.yaml in the established artifact location for every skill batch. Preserve prior tasks, maintainer decisions, and remaining work.
Keep maintainer decisions and changes in the repository; do not require the user to repeat the procedure in later sessions.
Use intent maintainer setup to initialize missing records, maintainer add to register skills, maintainer status to identify work, and maintainer sync to update generated metadata. Finish with intent maintainer check.
<!-- intent-maintainer:end -->

# newui

A SolidJS component library built on **SolidJS + Zag + typed variant recipes +
Tailwind CSS v4**.

The development reference checkouts under `references/` are read-only. Never
edit them.

Ship tier: prod.

## Read order

1. [`AGENTS.md`](./AGENTS.md) — this file.
2. `PRINCIPLES.md` — API design rules (P1–P15).
3. `CONTEXT.md` — shared vocabulary (variant/theme, open, dismissible, …).
4. `spec/*.md` — per-component API contracts.
5. [`skills/README.md`](./skills/README.md) — how versioned Agent Skills ship
   with the packages and how consumers discover them.

When docs disagree: `spec/*.md` > ADRs > `PRINCIPLES.md` > `CONTEXT.md`.

## Architecture

| Layer | Package | Notes |
| --- | --- | --- |
| tokens | `@talelk/newui-tokens` | framework-neutral token data + CSS-var generator |
| tailwind | `@talelk/newui-tailwind` | v4 `@theme`/`@utility`/plugins, `style.css` |
| icons | `@talelk/newui-icons` | the icon set as Solid components |
| atoms | `@talelk/newui-atoms` | single controls/marks and shared runtime foundations |
| molecules | `@talelk/newui-molecules` | compound interactions built from atoms |
| organisms | `@talelk/newui-organisms` | page regions: sidebar, filter bar, board, table, virtual list |
| templates | `@talelk/newui-templates` | `AppShell`, `PaneLayout`, `AuthLayout` |
| data | `@talelk/newui-data` | headless formatting, selection, undo, downloads, query and form logic; `/resource` owns the Frappe DocType client |
| code editor | `@talelk/newui-code-editor` | CodeMirror 6 Solid component |
| rich text | `@talelk/newui-editor` | TipTap 3 Solid editor + toolbar |
| charts | `@talelk/newui-charts` | echarts Solid wrappers (SVG renderer) |
| vite | `@talelk/newui-vite` | dev-server proxy · lucide auto-import · DocType types |
| site | `apps/playground` | the docs site, Storybook's host, and the visual acceptance surface |
| starter | `apps/starter` | the gated application skeleton — the copyable composition of every level |

The kit's direction is [`spec/kit.md`](./spec/kit.md) and
[`ADR-0013`](./spec/adr/0013-atomic-packages-and-app-shell.md): foundations →
atoms → molecules → organisms → templates → pages, with the headless data layer
beside the visual ladder. `@talelk/newui-templates` has exactly three supported
templates; `@talelk/newui-data` owns no rendered table/list surface. `apps/starter` is
the copyable, gated page composition; `/kit` is its guide.

The packages and site read in atomic design's order. Every registry entry has
one explicit `atomic` classification in `scripts/atomic.ts`; missing or extra
names fail generation. The old `@talelk/newui-ui`, `@talelk/newui-blocks` and
`@talelk/newui-layouts` packages and their shell APIs are removed, not re-exported.

- **Primitives:** raw `@zag-js/*` via `useMachine` + `normalizeProps`
  (`packages/atoms/src/lib/zag.ts`). Zag supplies keyboard, ARIA and focus.
- **Styling:** `tv()` recipes replace hand-written class maps. Only
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

Storybook is the isolated surface (`spec/kit.md`): every shipped reference
entry, chart and composition has one story file, `src/stories/<name>.stories.tsx`,
with a non-story `Demo` (the site's inline embed) plus `Default` and the states
[`spec/states.md`](./spec/states.md) requires. `pnpm storybook` serves it on
**6006**; the built static output (`pnpm storybook:build`) answers on **6007**
via `pnpm storybook:serve`, which is what the harness, `pnpm shots` and the docs
build embed.

| path | what it is |
| --- | --- |
| `/` `/docs` `/foundations` `/architecture` `/kit` `/kit/recipes` | the site, inside `SiteLayout` (masthead · sidebar · content · prev/next). `/architecture` is atomic design written down: five levels, one question each, with counts generated from the registry; `/kit/recipes` is the non-public composition gallery |
| `/changelog` | releases and pending changesets, generated from `CHANGELOG.md` + `.changeset/` — the masthead's version chip links here |
| `/atoms` · `/atoms/<name>` | the atoms reference, inside `AtomsLayout` — same chrome, but the sidebar is the filterable index |
| `/molecules` · `/molecules/<name>` | the same, for molecules (fields, pickers, menus, chart parts) |
| `/organisms` · `/organisms/<name>` | the same, for organisms: page regions, chart widgets and editors |
| `/templates` · `/templates/<name>` | the same, for templates (page frames and shells) |
| `/pages` · `/pages/<slug>` | the pages index and one application preview; `/pages/<slug>/fullscreen` is the bare application viewport |
| `/preview/<name>` | a bare same-origin story document used by the component/template preview iframe and fullscreen link; not a site destination |
| `/spec` | the deterministic page the browser harness drives — no chrome, no network |

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

`/atoms/<name>`, `/molecules/<name>`, `/organisms/<name>` and
`/templates/<name>` are assembled, not written: the live demo, the prop tables
and the contract all come from something that already exists, so adding a
component to the library and running `pnpm api` + `pnpm site` produces its page
on the level its `atomic` field names. The classification lives in
`scripts/atomic.ts` — three lists (atoms, organisms, templates; everything else
is a molecule) and the rule above them.

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

### Organisms

`@talelk/newui-organisms` is the composed layer: a component answers *what is this
control*, an organism answers *what is this page region*. The API includes
`AppSidebar`, `FilterBar`, `StatGrid`, `AuthCard`, `KanbanBoard`, `DataTable` and
`VirtualList`; each has a story, a contract and a generated atomic-level page.

Organisms may import atoms and molecules, but never templates. Large chart and
editor engines stay optional in their domain packages and are classified in the
organism level; `pnpm size` budgets those entries separately.

`pnpm shots` writes screenshots for every route × theme × width, plus the story
spot-checks on Storybook's origin, into `test-results/shots/` (gitignored,
nothing asserts on them) — it is the loop the design work runs on, not a
regression suite.

### Application and reference examples

`/pages` links complete application workflows only. All eight application
recipe families share one documentation destination per family and respond to
the actual viewport; the application examples have explicit destinations.
The 68 registry examples link to the atomic page that owns their public API, and
non-component recipes live under `/kit/recipes`. `spec/reference-examples.md`
documents the mapping and acceptance boundaries. `lib/examples.ts` owns the
application catalog; `lib/reference-examples.ts` owns the registry mapping.
Every shipped reference component must have an isolated lazy story.

TanStack Solid Query and Form belong to `@talelk/newui-data` (`/query`: client,
repository and collection mutations; `/form`: submit lifecycle and field-error
bridge), and the Frappe DocType client lives behind `@talelk/newui-data/resource` —
app-specific fetching never ships through `@talelk/newui-atoms`. Rendered tables and
virtual lists belong to `@talelk/newui-organisms`. The playground depends on no
TanStack package directly. Charts and editors remain optional organism-level
packages.

## Guardrails (enforced by tests, not convention)

- **Lint & format** — Biome (`pnpm lint`), plus **ESLint with
  `eslint-plugin-solid` only** (`pnpm lint:solid`) for the Solid rules Biome
  lacks: prop destructuring (kills reactivity), `.map()` where `<For>` belongs,
  early returns in a component body, untracked reactive reads, `innerHTML`, the
  `style` prop. Two linters is a cost; not checking these is worse.
- **Architecture** — `dependency-cruiser` (`pnpm arch`,
  `.dependency-cruiser.cjs`): no cycles, `lib/` must not depend on `components/`,
  `@talelk/newui-tokens` is a leaf, packages never import from `apps/`, nothing imports
  from `dist/`.
- **Package correctness** — `publint --strict` (`pnpm packages:check`) validates
  every package's `exports`, `files` and conditions for consumers, and
  `pnpm packages:smoke` packs every package and asserts the tarball carries its
  exports map — a `files` field that forgets `src/` fails as a consumer would,
  not as a manifest lint.
- **Types** — `tsc --noEmit` with `strict`, `noUncheckedIndexedAccess`,
  `noPropertyAccessFromIndexSignature`, `noImplicitOverride`, `noImplicitReturns`
  and `allowUnreachableCode: false`. (`exactOptionalPropertyTypes` is off: it
  fights passing `T | undefined` into `{ x?: T }` for little benefit here.)
- **Merge correctness** (`packages/atoms/src/lib/tw-merge.test.ts`): two layers.
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
- **Vocabulary conformance** (`scripts/vocabulary.test.ts`): every `theme`/
  `tone`/`variant`/`side`/`align` prop in `api.json` must stay inside the union
  `CONTEXT.md` declares for the term — the rule layer's machine copy, so a new
  color name or a narrowed `side` fails `pnpm test`, not review.
- **Public surface** (`packages/*/src/exports.test.ts`) and **manifest**
  (`package.test.ts`) pin the exported names and `exports` targets.
- **API tables** — `pnpm api` / `pnpm api:check`.
- **Spec contracts** (`pnpm specs:check`, `scripts/check-specs.ts`): every prop
  a `spec/*.md` table documents must exist in `api.json`, and every fenced
  `ts`/`tsx` sample must parse — a renamed prop fails here, not in a reader's code.
- **Agent Skills** (`pnpm skills:check`, `@tanstack/intent`): each package-owned
  `skills/**/SKILL.md` is validated for frontmatter, links, examples and the
  publish allowlist; `intent stale` reports version/source/coverage signals as
  advisory review prompts, never as proof that guidance is wrong. Consumers
  scan static files and apply `intent.skills`/`intent.exclude`; hooks are
  convenience, not a security boundary.
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
- **Disposal** (`packages/molecules/src/disposal.test.tsx`): mount/unmount 100
  overlays and assert `document.body` is unchanged — no node or listener leak.
- **Browser harness** (`e2e/`, `pnpm test:e2e` — the chrome project; Playwright's pinned Chromium): axe on
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

- **Nightly.** `.github/workflows/nightly.yml` runs what a PR pipeline cannot
  afford: the cross-engine harness (`pnpm test:e2e:all` — chrome, webkit,
  firefox and a touch project), the stress sweeps, the memory tripwires,
  `dep-drift` and the advisory visual review, on a 03:00 UTC cron with
  findings uploaded as artifacts.
- **One pipeline, two runners.** `scripts/ci-steps.ts` declares the steps;
  `.github/workflows/tests.yml` runs them as individual labelled steps, and
  `pnpm verify` runs the identical commands locally. `ci.test.ts` fails if the
  workflow and the declaration drift, so "CI runs locally" stays true.
- **npm trusted publishing.** `changesets.yml` requests `id-token: write`;
  every published package declares a public `publishConfig` and its repository.
  Each npm package needs a Trusted Publisher for `talelk/newui` /
  `changesets.yml` with direct `npm publish` allowed. No long-lived
  `NPM_TOKEN` is stored. `scripts/publish.ts` is gated by the repository
  variable `NPM_PUBLISH` until the first publish and the Trusted Publisher
  setup are complete.
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
  *score* only has a floor (it is noisy under throttling). When Lighthouse
  explicitly reports a host CPU below its calibration model, the score floor is
  skipped for that run; the deterministic audits and bundle budgets still run.
  The library's real cost is the bundle budget below, not this score.
- **App-level, not library**: the site inlines its single CSS file
  (`inlineCss` in `apps/playground/vite.config.ts`, removing a render-blocking
  round trip) and code-splits every route with dynamic imports. A library must
  not do either — consumers own their asset pipeline.
- **Measured checkpoint** (`pnpm size`, gzip with `solid-js` external): `cn()`
  6.51 kB · `Button` 8.80 kB · `Button + Dialog` 29.85 kB · atoms 12.72 kB ·
  molecules 73.44 kB · organisms 114.41 kB · templates 43.10 kB · full atomic
  barrel 268.17 kB. Current route measurements (`pnpm budget`): home 57.0 kB,
  analytics fullscreen 381.1 kB, tasks fullscreen 203.2 kB and accounting
  fullscreen 347.2 kB; all are within the measured route budgets. These are
  checkpoints, not substitutes for running `pnpm size` and `pnpm budget`.
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
  (`packages/atoms/src/lib/color-scheme.ts`): it persists the choice, tracks the OS
  live, flips `data-theme`, sets the CSS `color-scheme` property (so native
  scrollbars/controls match), and suppresses transitions for two frames around a
  swap. Never use `theme` to mean light/dark.
- A branded app retunes the whole system by overriding the runtime custom
  properties (`--surface-*`, `--ink-*`, `--outline-*`) — no component changes.

## Commands

```
pnpm dev            # site (dev server)
pnpm dev:starter    # the starter app (4180)
pnpm storybook      # Storybook, the isolated surface (6006)
pnpm storybook:build # static Storybook build (storybook-static/)
pnpm storybook:serve # serve the static build (6007; harness, shots, docs)
pnpm stories        # regenerate generated/stories.json + stories.ts from Storybook's index
pnpm stories:check  # fail on stale index or a missing required state (spec/states.md)
pnpm build          # regenerate the Tailwind theme CSS
pnpm build:starter  # build the starter app
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
pnpm api            # regenerate the root api.json
pnpm api:check      # fail if the API table is stale
pnpm test:sweep     # tw-merge all-pairs equivalence (routed by affected, not by pnpm test)
pnpm refs:check     # every references/… path mentioned in docs exists
pnpm skills:check   # validate Agent Skills, then report conservative staleness
pnpm skills:validate # SKILL.md structure, examples and package publishing entries
pnpm skills:stale   # advisory version/source/coverage signals
pnpm skills:version # set metadata.library_version from each owning package
pnpm docs:build     # render spec/*.md + api.json into a static docs/ site
pnpm css            # regenerate @theme + tokens CSS   (run after token changes)
pnpm changeset      # add a changeset
pnpm gen component  # scaffold a component: source, registrations, spec, story, changeset
pnpm packages:smoke # pack every package; the tarball must carry its exports map
pnpm test:e2e:all   # the e2e harness on chrome, webkit, firefox and touch
```

## Rules

- Semantic tokens only (`surface-*`, `ink-*`, `outline-*`) — never raw colors.
- Every input control reuses the shared labelling contract (`Field`, P5).
- Accessibility is part of done: keyboard, focus, ARIA (P12).
- A component is not done until it has: a single `Name.tsx` (types declared in
  it) with `data-slot`/`data-state` hooks; variants either in the shared
  `control-styles` or a local `recipe.ts` when the matrix belongs to the
  component (`Button`); a `.test.tsx` covering logic and ARIA; a browser story
  with the states [`spec/states.md`](./spec/states.md) requires
  (`pnpm stories:check` enforces it); a `spec/<name>.md` contract; and a
  classification entry in `scripts/atomic.ts` (`pnpm site` fails otherwise).
  Regenerate `pnpm api` and `pnpm site` so the reference page exists.
- Public surface changes are listed in each atomic package's `src/exports.test.ts`.

## Do not

- Invent new public API vocabulary without checking `PRINCIPLES.md`/`spec/`.
- Add class-name or style-injection props.
- Edit the read-only reference checkouts under `references/`.

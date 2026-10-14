# newui

A SolidJS component library — the equivalent of `frappe-ui` rebuilt on
**SolidJS + Zag + tailwind-variants + Tailwind CSS v4**.

The Vue originals are checked out read-only at `frappe-ui-main/` and the Zag
source at `zag-main/`. Port from them; never edit them.

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
| code editor | `@newui/code-editor` | CodeMirror 6 Solid component |
| rich text | `@newui/editor` | TipTap 3 Solid editor + toolbar |
| charts | `@newui/charts` | echarts Solid wrappers (SVG renderer) |
| vite | `@newui/vite` | Frappe dev proxy · lucide auto-import · DocType types |
| site | `apps/playground` | the docs site *and* the visual acceptance surface |

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
had, and stays the surface the design work is reviewed on.

| path | what it is |
| --- | --- |
| `/` `/docs` `/foundations` `/components/*` `/blocks` `/examples/*` | the site, inside `SiteLayout` (masthead · sidebar · content · prev/next) |
| `/spec` | the deterministic page the browser harness drives — no chrome, no network |
| `/play?c=<Name>` | one component's demo; the docs embed it, and it is the screenshot unit |
| `/examples/discussions/mobile` | the full-screen mobile recipe (`MobileShell` is `fixed inset-0`) |

Three rules keep it fast, and each has a guardrail:

- **Every route is a lazy chunk.** Pages are reached only through `import()` in
  `routes.tsx`; a static import there would ship that page on every route.
  `dependency-cruiser` (`site-shell-stays-lean`) and `routes.test.ts` enforce it.
- **The shell imports no component.** Masthead, sidebar and layout are plain
  markup over semantic tokens; `createColorScheme` is the one runtime import
  (a singleton in `shell/theme.ts`, so two consumers cannot drift).
- **A route pays for itself, measured.** `pnpm budget` loads the built site per
  route and sums the gzip of every chunk that route fetched. The old playground
  mounted all six sections on `/` and cost 219 kB gzip; the home page is 48.

`pnpm shots` writes screenshots for every route × theme × width into
`test-results/shots/` (gitignored, nothing asserts on them) — it is the loop the
design work runs on, not a regression suite.

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
- **Site structure** (`apps/playground/src/routes.test.ts`): the nav tree and the
  route table must describe the same paths in both directions, and every page
  import in `routes.tsx` must be lazy. A sidebar link with no route and a route
  nobody can reach are both caught.
- **Disposal** (`packages/ui/src/lib/disposal.test.tsx`): mount/unmount 100
  overlays and assert `document.body` is unchanged — no node or listener leak.
- **Browser harness** (`e2e/`, `pnpm test:e2e`, Chrome via Playwright): axe on
  real CSS (colour contrast), keyboard/focus-visible/focus-trap, tabs/select/
  switch/tooltip interaction, responsive overflow at 320/768/1280, RTL, 200%
  text zoom, and perf budgets (LCP, CLS, dialog latency, 2000-row list).

## CI

- **One pipeline, two runners.** `scripts/ci-steps.ts` declares the steps;
  `.github/workflows/tests.yml` runs them as individual labelled steps, and
  `pnpm verify` runs the identical commands locally. `ci.test.ts` fails if the
  workflow and the declaration drift, so "CI runs locally" stays true.
- `pnpm verify` (all) · `pnpm verify:checks` (fast gates) · `pnpm verify:e2e`
  (browser harness) · `pnpm verify --only=lint,test` · `pnpm verify --from=size`.
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
- **Current**: `cn()` 7.3 kB · `Button` 9.5 kB · `Button + Dialog` 31.7 kB ·
  full barrel 239.4 kB (all gzip, `solid-js` external). Site routes:
  **home 48 kB · docs 48 · foundations 73 · feedback 65 · examples 71 ·
  mobile recipe 78 · desktop recipe 123 · blocks 146 · atoms 196**
  (gzip, every chunk the route fetches — `pnpm budget`).
- **Removed `tailwind-variants`** (it bundled its own merge integration) in
  favour of an in-house `tv`/`cn`/`cx` in `lib/tv.ts`: `Button` went 34.3 →
  16.3 kB. The resolver is typed (`VariantProps<typeof recipe>` recovers the
  axis unions) and pinned by `lib/tv.test.ts`.
- **Pruned `tailwind-merge`'s config** (`lib/tw-merge.config.ts`): the default
  ships every Tailwind group (~14 kB gzip) on every component.
  `createTailwindMerge` needs a full config, so this one declares only the
  families this library emits, and `lib/tw-merge.test.ts` proves it agrees with
  the (extended) default for **every pair** of utilities in the source — 5,276
  cases, 0 mismatches. `cn()` 14.1 → 6.5 kB, `Button` 16.3 → 8.6 kB.
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
pnpm build          # build all packages
pnpm shots          # screenshots: every route × theme × width (test-results/shots)
pnpm budget         # per-route gzip budget, measured in a real browser
pnpm test           # vitest (unit + a11y + manifest)
pnpm test:ssr       # Solid SSR smoke tests
pnpm typecheck      # tsc, every package
pnpm lint           # biome check
pnpm lint:fix       # biome check --write
pnpm knip           # dead-code / unused-deps
pnpm verify         # run the whole CI pipeline locally (same steps as CI)
pnpm verify:checks  # the fast gates only
pnpm verify:e2e     # the browser harness only
pnpm api            # regenerate packages/ui/api.json
pnpm api:check      # fail if the API table is stale
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
- Edit the reference checkouts (`frappe-ui-main/`, `zag-main/`).

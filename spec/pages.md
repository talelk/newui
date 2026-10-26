# Pages

The contract the twelve application examples answer to. `spec/states.md` is
this for components; this file is it for the Pages rung.

## The rung

`/pages/<name>` documents one complete application workflow;
`/pages/<name>/fullscreen` is the bare application at any viewport. The
inventory — which applications exist and which e2e file owns their flow —
lives in `spec/reference-examples.md`. This file owns what it *takes* to
belong there: **a directory entry alone does not establish feature
completeness.**

## Acceptance contract

An application page is complete when every item below holds. Each is checked
by a gate that already runs; none is aspirational.

1. **Responsive.** The fullscreen app is usable at 390, 768 and 1440: no
   horizontal document overflow, navigation reaches its mobile form, primary
   actions are reachable one-handed at 390. Checked by `e2e/design-contract.spec.ts`
   (375 overflow), the coherence sweep, and the responsive suite.
2. **Accessible.** axe serious/critical violations: zero, in both color
   schemes, with real CSS (`e2e/a11y.spec.ts`); every control keyboard-reachable
   with visible focus (`e2e/interaction.spec.ts`).
3. **Coherent.** The page's stories report zero of the four generic violations —
   viewport overflow, clipped content, truncated text with no escape, controls
   whose every sampled hit point lands elsewhere (`e2e/coherence.spec.ts`).
4. **Stateful.** Where the domain has a state the app can enter — loading,
   empty, error, selected — the application demonstrates it. The state
   vocabulary is `spec/states.md`; the application answers it at flow level,
   and its loading/empty/error surfaces come from `DataState`, not ad-hoc
   markup.
5. **Deterministic.** All data is local and deterministic; reload starts a
   fresh session. No network beyond the dev server.
6. **Within budget.** The route's JS (gzip, every chunk it actually fetches)
   sits under its `scripts/budget.ts` entry; LCP and CLS inside
   `e2e/perf.spec.ts`; heap returns to baseline across route navigation
   (`e2e/memory.spec.ts`).
7. **Documented against its evidence.** The application's row in
   `spec/reference-examples.md` names the e2e file that exercises its flow,
   and that file exists and passes.

## What a page is not

- Not a story surrogate: application pages compose public components; a gap in
  a component's contract is fixed at the component, never papered over in the
  page.
- Not a promise: the docs site must not demonstrate behaviour the packages do
  not ship. Where an application reaches for a pattern without a public API,
  the pattern belongs in `/kit/recipes` until it earns promotion through the
  gate in `spec/kit.md`.

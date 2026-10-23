# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

SolidJS product teams building business and analytics applications — both teams
inside this organisation and external developers adopting the published
packages. They are experienced front-end developers working in a pnpm
workspace, comfortable with TypeScript, SolidJS and Tailwind CSS v4.

They arrive at the playground to decide whether newui fits, to find the right
component, to check its contract and states, and to copy a working composition
into their own app. Designers and maintainers review the same site, but product
decisions optimise for the implementing developer.

## Product Purpose

newui is a production-tier SolidJS component library for compact, data-dense
business software: atoms, molecules, organisms and three page templates, built
on Zag state machines, typed variant recipes and semantic tokens over Tailwind
CSS v4. A headless data layer, charts, rich-text and code-editor add-ons, icons
and a Vite integration sit beside the visual ladder.

The playground (`apps/playground`) is the product's public documentation site,
live acceptance surface and reference implementation; Storybook is the isolated
review surface for the same components. Success means a SolidJS team can go from
first look to a correct, accessible, on-brand screen without leaving the
documentation, and can trust that what they see is the shipped library rather
than a mock.

## Positioning

An independent SolidJS implementation with a complete atomic ladder and an
executable contract. Every demo is rendered from the same story module Storybook
serves, every component page is generated from the library's own API and spec,
and every rule the library claims — tokens, variants, states, contrast,
accessibility, bundle size, route cost — is pinned by a gate that can fail.

A neighbouring component library can copy components; it cannot truthfully copy
the claim that its documentation, examples, contracts and tests are the same
artifact.

The library began as a SolidJS reworking of frappe-ui's design language and
adapts composition patterns from SolidUI, shadcn/ui and Tremor. It is not an
official port and has no endorsement from those projects.

## Operating Context

- Maintainers and contributors work in one pnpm monorepo. `pnpm dev` serves the
  site, `pnpm storybook` the isolated surface, `pnpm shots` writes the review
  screenshots, and `pnpm verify` is the acceptance gate.
- Consumers install only the packages a screen needs (`@talelk/newui-atoms`,
  `@talelk/newui-molecules`, `@talelk/newui-tailwind`, and so on), import one
  stylesheet, mount one provider, and compose upward through the atomic levels.
- The documentation reader moves between `/docs` (installation), `/foundations`
  (tokens), `/atoms` `/molecules` `/organisms` `/templates` (reference), `/pages`
  (twelve complete application workflows), `/kit` and `/kit/recipes`
  (composition guidance), `/architecture` and `/changelog`.
- Applications are developed against semantic light and dark themes and reviewed
  at 390, 768 and 1440 widths in both themes.
- The library publishes to npm under the `@talelk/newui-*` scope with Changesets
  and OIDC trusted publishing. The site deploys to GitHub Pages and hosts
  Storybook under `/storybook/`.

## Capabilities and Constraints

**Capabilities.** The atomic ladder is `@talelk/newui-tokens`,
`@talelk/newui-tailwind`, `@talelk/newui-icons`, `@talelk/newui-atoms`,
`@talelk/newui-molecules`, `@talelk/newui-organisms` and
`@talelk/newui-templates`; `@talelk/newui-charts`, `@talelk/newui-editor` and
`@talelk/newui-code-editor` are optional domain add-ons. `@talelk/newui-data`
owns headless formatting, selection, undo, downloads, TanStack Query and Form,
and the Frappe DocType client behind `/resource`. `@talelk/newui-vite` provides
the dev-server proxy, Lucide auto-import and DocType types.

**Constraints.**

- Semantic tokens only (`surface-*`, `ink-*`, `outline-*`); raw palette colours
  and hard-coded hex/rgb/hsl values are rejected. Light and dark are one
  `colorScheme` axis, never `theme`.
- Two colour axes only: `variant` (`solid | subtle | outline | ghost`) and
  `theme` (a subset of `gray | blue | green | amber | red | violet`).
- No `v-model`. Overlays use `open` + `onOpenChange`; inputs use `value` +
  `onValueChange` or `default*`. No class-name or style-injection props —
  customization goes through `data-slot` and `data-state`.
- Zag owns keyboard, focus and ARIA where a machine exists. Components do not
  reimplement them.
- `@talelk/newui-templates` exports exactly three templates: `AppShell`,
  `PaneLayout` and `AuthLayout`. `@talelk/newui-data` owns no rendered table or
  list surface.
- The read-only checkouts under `references/` are development references, never
  shipped runtime code, and are never edited.
- Before 1.0 the library breaks cleanly: removals happen without compatibility
  aliases and are always recorded in `spec/migrations.md`.
- Documentation must not promise unshipped behaviour; anything not yet shipped
  is labelled as such.
- Accessibility, contrast, CSS emission, bundle size and route cost are gates,
  not aspirations.

**Terminology.** The shared vocabulary lives in `CONTEXT.md` — `open`,
`value`, `dismissible`, `variant`, `theme`, `colorScheme`, `route`/`href`,
`action`, `side`, `align`, `bare`, `fluid`, `controllable`, `compound part` and
`machine`.

**Open decision.** The one-year success metric is undecided. Do not invent
adoption targets, revenue, customer counts, benchmarks or partnership claims.

## Brand Commitments

- Name: **newui**. Packages publish under the `@talelk/newui-*` npm scope in the
  `talelk/newui` repository.
- License: Apache-2.0, with third-party notices in `NOTICE`; shipped
  dependencies must stay license-compatible.
- Typeface: Inter, shipped under the SIL Open Font License.
- Voice: direct, concrete and non-promotional. Documentation is written to be
  copy-pasteable and true rather than aspirational; gaps are named instead of
  implied.
- Heritage: an independent SolidJS implementation inspired by frappe-ui and
  several open-source composition libraries, with those debts acknowledged in
  the README. No upstream project endorses newui.

## Evidence on Hand

- The playground itself: live component pages generated from `api.json`,
  per-component spec contracts under `spec/`, and twelve application recipes in
  `apps/playground/src/pages`.
- One story per shipped reference entry in `apps/playground/src/stories/`, with
  the states `spec/states.md` requires; Storybook serves the same modules.
- 68 registry examples and `apps/starter`, a runnable application skeleton built
  only from public surfaces.
- Contracts and rules: `AGENTS.md`, `PRINCIPLES.md`, `CONTEXT.md`, `spec/*.md`,
  the ADRs and `api.json`.
- Review artifacts: `pnpm shots` screenshots, Lighthouse reports and route
  budget measurements.

Absent and not to be fabricated: customer testimonials, case studies,
production adoption figures, performance benchmarks, pricing or partner logos.

## Product Principles

1. **The shipped code is the documentation.** Demos, stories, examples and
   contracts come from the same source; a mock that is not the library is a bug.
2. **Make the rules executable.** If a claim matters, a gate should fail when it
   stops being true.
3. **Accessibility and correctness are part of done.** Keyboard, focus, ARIA,
   contrast and text zoom ship with the component, not after it.
4. **Composition over configuration.** The atomic ladder has explicit
   boundaries; consumers install the level they use and compose upward.
5. **Say what is true, including what is missing.** Pre-1.0 breaks cleanly with
   a migration note; unshipped work is labelled; no invented proof.

## Accessibility & Inclusion

- WCAG AA contrast is asserted for every foreground/background pairing the
  recipes ship, in both themes.
- Keyboard operation and visible keyboard-only focus are required; Zag supplies
  ARIA and focus management where a machine exists.
- Content must survive 200% text zoom and 150% text scale; reduced motion is
  respected.
- Mobile navigation and primary icon actions keep 40–44px touch targets.
- Colour never carries error state alone: invalid fields expose `aria-invalid`
  and a message.

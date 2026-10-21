# Contributing

Thanks for looking at newui. This file gets a human from clone to merged PR;
the repository's own instructions for agents live in
[`AGENTS.md`](./AGENTS.md), which is also the deeper reference for structure
and gates.

## Read order

1. [`PRINCIPLES.md`](./PRINCIPLES.md) — the API rules (P1–P15). A PR that
   breaks one is a reject regardless of taste.
2. [`CONTEXT.md`](./CONTEXT.md) — the shared vocabulary. Reuse these names;
   inventing a second word for `dismissible` is the fastest way to a review
   cycle.
3. `spec/*.md` — the per-component contracts, and the single source of truth
   the docs site reads raw.

## Setup

```sh
pnpm install
pnpm verify:checks   # the fast gates, ~minutes
pnpm dev             # the docs site
pnpm storybook       # the isolated surface (6006)
```

## Making a change

- **A new component:** start with `pnpm gen component <Name> --level
  <atom|molecule|organism> --group <Group>`. It scaffolds the source, the
  registration points, the spec stub and the story, and prints what remains
  by hand.
- **The loop:** `pnpm verify:affected` runs only the gates your diff can
  dirty. Run the full `pnpm verify` once before pushing.
- **Tests are part of done:** a logic/ARIA `.test.tsx` per component, the
  states `spec/states.md` requires as stories, and axe in the a11y suite.
  The harness calibration (`e2e/calibration.spec.ts`) exists because a green
  sweep that cannot see a broken page is a quiet sweep — when you add a
  generic detector, plant a fixture for it.
- **Visual work** runs on `pnpm shots` (screenshots) and `pnpm review /spec`
  (advisory visual review into `test-results/review/`).
- **Public API changes** need a changeset (`pnpm changeset`). Breaking
  changes are documented in `spec/migrations.md` with before/after code.

## Commit style

Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`), one
reviewable concern per commit. The CI pipeline runs locally with `pnpm
verify` — same steps, same order — so "it passed locally" is a claim you can
make truthfully.

## Reporting bugs

Open an issue with: the route or story that shows it, the theme and viewport,
what you expected vs. what rendered. Screenshots from `pnpm shots` are
perfect evidence.

## Licensing

Apache-2.0. By contributing you agree your work is licensed under it.

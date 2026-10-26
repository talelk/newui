# The one-year success questions

**Status**: accepted

## Context

[PRODUCT.md](../../apps/playground/PRODUCT.md) left the one-year success
metric an open decision, and deliberately warns against inventing adoption
targets, revenue, customer counts or benchmarks. A metric nobody can measure
honestly is noise; a target invented before there is any user is fiction. But
leaving the question fully open has its own cost: without agreed *questions*,
the project cannot tell progress from motion, and a year of work cannot be
argued about with evidence instead of taste.

## Decision

The project does not adopt numeric targets. It adopts **four success
questions**, each with a named, inspectable source of evidence, reviewed when
the project turns one year old (October 2027):

1. **Is the contract real?** Every shipped component has its spec, its states,
   and its gates green on the default branch. Evidence: `pnpm verify` output,
   `spec/*.md` coverage in the registry (every shipped entry maps to a
   contract), the coherence and a11y sweeps. A year in, the answer must still
   be *yes without exceptions* — this is the invariant, not a goal.
2. **Can a stranger build with it?** A developer who has never seen the repo
   can go from the docs site to a running app composed from published
   packages. Evidence: the starter (`apps/starter`) builds from the published
   versions, not workspace links; the `/kit` guide's copy-paste wiring works
   against npm tarballs (`pnpm packages:smoke`); Agent Skills produce correct
   code against the published API (`skills/evals/`).
3. **Is anyone else here?** Evidence: npm download counts for the published
   packages, the origin of issues and pull requests in `talelk/newui`
   (maintainer-only versus external), and whether any external composition has
   been shown back to the project. No number is promised; the review records
   what the sources say.
4. **Does the surface still cost what it claims?** Evidence: the bundle and
   route budgets (`pnpm size`, `pnpm budget`), the perf and memory tripwires —
   the measured checkpoints in AGENTS.md must still hold within their budgets
   a year later.

**What stays deliberately out of scope:** revenue, user counts, benchmark
comparisons, partnership claims — until there are real counterparties to
measure against, per PRODUCT.md.

**Consequences:** the one-year review is an ADR amending this one with the
recorded answers, not a new goalpost. The success questions may be replaced by
a future ADR once external usage makes sharper metrics honest.

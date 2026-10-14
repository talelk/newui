# newui skill evals

A prompt-level regression check for `skills/newui/SKILL.md`. It asks two
questions the skill's own text cannot answer:

1. **Does the skill fire?** Scored from what an agent actually did, never from
   self-report.
2. **Does an agent that has only the skill write correct newui code?** Scored
   against the repo's specs and source, never against the skill.

The approach mirrors `frappe-ui-main/skills/frappe-ui/evals/`, restated for
Solid + newui.

## Files

| File | What it is |
|---|---|
| `cases.json` | 26 realistic prompts, each with the `check` a correct answer must do and the `source` file that grounds it |
| `score.ts` | the harness: validates `cases.json` and every `source` path; never calls a model |
| `run.md` | the procedure for running a batch against a model and recording findings |
| `README.md` | this file |

## What the cases cover

Each case names one testable behaviour and the repo file that defines it. The
set is grouped by `area`:

| area | what it pins | cases |
|---|---|---|
| `tokens` | semantic tokens only; light/dark is `colorScheme`, not `theme` | 2 |
| `state` | no `v-model`; `open`/`onOpenChange`, `value`/`onValueChange`, `default*` | 3 |
| `labelling` | the shared `Field` contract (P5); P5 does not apply to buttons | 3 |
| `component-choice` | `Combobox` vs `Select` vs `MultiSelect`; `Dropdown` vs `Menu`; `ContextMenu`; the `Radio` alias | 6 |
| `form-routing` | `FormControl` `type` routing and the value shape each type carries | 4 |
| `styling-hooks` | `data-slot`/`data-state` and root `class` fallthrough, never class props | 2 |
| `packaging` | workspace packages and the root barrel, not subpaths | 3 |
| `zag` | `createZagApi` / `createZagContext`, never raw `useMachine` | 2 |
| `dialogs` | the imperative `dialog.*` helpers + `DialogHost` | 1 |

Every `source` is a real path in this repo (`spec/*.md`, `PHILOSOPHY.md`,
`CONTEXT.md`, `AGENTS.md`, an ADR, or library source). `score.ts` fails if a
source moves.

## How to run

Validate the case file and its sources:

```
pnpm exec tsx skills/newui/evals/score.ts
```

It exits 0 when the file is well-formed and every source exists, 1 otherwise.
Then run the actual batch against a model per [`run.md`](./run.md).

## How scoring works

`score.ts` scores the **harness**, not the answers. For each case a run records
one verdict:

- **pass** — the produced code does what `check` says, verified against
  `source` (and, where the source is code, the implementation).
- **fail** — it does something else; record what it did instead.

Aggregate as `passed / cases` overall and per `area`. Invocation is scored
separately: did the agent load `skills/newui/SKILL.md` before writing code?
A case can invoke correctly and still fail its check — that is the useful signal.

## Honest caveats

- **These are prompt-level evals, not unit tests.** They measure what a model
  produces from a request and the skill. They are stochastic and model-specific;
  a pass rate is a signal, not a proof.
- **The harness is deterministic; the answers are not.** `score.ts` only proves
  the case file is consistent. Nothing here runs an LLM.
- **Two conditions make or break the measurement.** Run builders *source-blind*
  (no reading `packages/` or `spec/`) — otherwise the model grades itself
  against the truth and every case passes regardless of the skill. And
  *neutralise standing instructions* that already say "use newui"; they make
  trigger cases pass for the wrong reason. See `run.md`.
- **Grade against the repo, not the skill.** A grader that reads `skills/`
  can score a wrong instruction as correct. If a `check` is not actually
  supported by its `source`, treat that as a bad case and fix the case, not the
  answer.
- **Coverage is not completeness.** The 26 cases are the behaviours that
  frappe-ui's audit showed agents get wrong (prop-level facts, not component
  choice). They do not cover the whole surface.

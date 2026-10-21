# Running the newui skill evals

A short procedure for taking `cases.json` to a batch of model answers and a
written findings file. It mirrors the intent of frappe-ui's
`evals/run.workflow.js` (one fresh builder per case, then batched graders)
without wiring any CI.

## 0. Validate first

```
pnpm exec tsx skills/evals/score.ts
```

Fix the case file until this exits 0. It guarantees every `prompt`/`check`/
`source` is present and every `source` resolves to a real file.

## 1. Set up the run

Pick a run directory and label, e.g. `/tmp/newui-eval` and `run-1`. For each
case, create `${runDir}/${case.id}/`.

## 2. Build — one fresh agent per case

Run a **new** agent for each case, given only the raw `prompt`. Two conditions
matter, and both come from frappe-ui's experience:

- **Source-blind.** The builder must not read this repo's `packages/`, `spec/`,
  `PHILOSOPHY.md`, `CONTEXT.md`, `AGENTS.md`, or `llms.txt`. The skill is the
  agent's only reference — that is the condition it ships for. If the builder
  can read the specs, it grades itself against the truth and every case passes.
- **Neutralised standing instructions.** If the agent's context already says
  "use newui", trigger cases pass for the wrong reason. Prepend a scope note
  that suspends any such instruction for this task.

Tell the builder to write its files under `${runDir}/${case.id}/` and to touch
nothing else. Do not mention skills, components or rules in the prompt — the
point is to observe what it reaches for.

## 3. Grade — against the repo, never the skill

For each case, a grader reads the produced files and answers one question:
*does the code do what `check` says, judged by `source`?* Record `pass`, the
exact line of evidence, and — on a fail — what it did instead.

Graders must **not** read `skills/`. That directory is the artefact under test;
grading against it lets a wrong instruction score as a pass. If a `check` turns
out not to be supported by its `source`, mark the case **bad** and fix the case,
not the answer.

Also score invocation separately: did the agent load `packages/atoms/skills/newui/SKILL.md`
before writing code? That is a different question from whether the code is
correct, and both are worth recording.

## 4. Reconcile and record

Count only the `check` verdicts for the cases in `cases.json` — one per case.
An ungraded case is a fail. Then write a dated findings file next to this one,
e.g. `findings-YYYY-MM.md`:

```md
# newui skill eval — <date>, <model>

Run: <runDir>  ·  source-blind: yes  ·  cases: 26

| area | passed | of |
|---|---|---|
| tokens | 2 | 2 |
| state | 1 | 3 |
| ... | | |

## Invocation

| case | expect skill | loaded skill | verdict |
|---|---|---|---|

## Failures

| case | check it missed | what it did instead | skill line that should have prevented it |
|---|---|---|---|

## What this means for the skill

- ...
```

Close with the skill change the failures argue for, or "no change" if the run
was clean. Re-run after any edit to `packages/atoms/skills/newui/SKILL.md`.

## Notes

- `cases.json` is the authority, not the grader's output. Drop verdicts for
  cases that are not in the file and count any missing case as a fail.
- Keep the case file append-only in spirit: changing a `check` changes the
  measurement. Note the change in the findings file.
- No CI wiring is needed. This is a manual gate run before and after editing
  the skill.

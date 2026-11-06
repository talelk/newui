---
'@talelk/newui-organisms': minor
---

New `Wizard` organism (issue #31): a multi-step flow over a form.

- **`Wizard`** composes `Stepper` for progress and `ConfigForm`'s renderer for
  the fields, and adds the three things every multi-step page was writing by
  hand: the gate between steps, the review that closes the flow, and the state
  that survives a closed tab. A step is `{ id, label, description?, validate?, content }`,
  where `content` is the step's own JSX or an array of named `FieldConfig`
  entries — so the same `ui` map feeds `createAppForm` and the steps, and a step
  takes the slice it owns by name.
- **The gate is per step.** `validate` runs when the user tries to leave a step
  forward, never while they type and never for a step they have not reached. It
  returns messages for the step, or a map from field path to message that lands
  on that field's own `error` — the wizard never runs the form's own validators,
  because running them would mark every field in the document and arrive at an
  unreached step already red. Back is never gated, and the stepper stays
  `linear`, so the only way forward is through the gate.
- **`review`** appends a generated read-only summary of every declared field,
  grouped by step and skipping anything hidden by `when`.
- **`resume`** remembers `{ step, values }` in a `createConfigStore` document
  under `newui.wizard`, restoring both on the next visit and deleting the
  document when `onSubmit` lands. This is not autosave: `onSubmit` stays the
  save path.
- `currentStep` / `onCurrentStepChange` make the step controllable, and
  `spec/stepper.md` now points here for flows that have a form behind the steps.

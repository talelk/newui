# Wizard

A multi-step flow over a form: `Stepper` for progress and navigation,
`ConfigForm`'s renderer for the fields, and the three things every multi-step
page was writing by hand — the gate between steps, the review that closes the
flow, and the state that survives a closed tab.

Reach for it when a flow has more than one screen of decisions and the screens
have an order. One screen of fields is `ConfigForm`; a flow the user can take in
any order is `Tabs`.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `label` | `string` | — | accessible name for the step navigation (the stepper's landmark) |
| `steps` | `WizardStep<TValues>[]` | — | `{ id, label, description?, validate?, content }`, in order |
| `form` | `WizardFormApi` | — | the TanStack form — pass `appForm.form` |
| `onSubmit` | `(values, { reset }) => void \| Promise<void>` | — | the save path, called once on the last step; omit it to hand the document to `form.handleSubmit()` |
| `currentStep` | `string` | — | the current step's `id` (controlled) |
| `defaultStep` | `string` | first step | the step that opens when nothing is controlled or remembered |
| `onCurrentStepChange` | `(id: string) => void` | — | a step the user moved to |
| `review` | `boolean` | `false` | append the generated read-only summary as the last step |
| `resume` | `{ id: string; store: WizardResumeStore }` | — | remember the step and the values, and come back to them |
| `components` | `Record<string, ConfigFormControlComponent>` | — | custom controls by `type`, joined onto the `FormControl` vocabulary |
| `submitLabel` | `string` | `"Submit"` | the label of the final button |
| `class` | `string` | — | merged into the root |

A step's `content` is either its own JSX or an array of named `FieldConfig`
entries (`WizardStepField`), which the wizard renders through the same
`FormControl` vocabulary `ConfigForm` uses. The same `ui` object feeds
`createAppForm` and the steps; a step takes the slice it owns by name.

## The gate

`validate` runs when the user tries to leave a step forward, never while they
type and never for a step they have not reached. It returns nothing to pass, or:

| return | what happens |
| --- | --- |
| `string` | one message above the step's fields |
| `string[]` | the messages, stacked |
| `Record<path, string \| string[]>` | per field — the message lands on that field's own `error`, through the same contract every other field uses |

A path the step does not own cannot carry a message, so it is reported as a step
message (`email: Enter an address`) rather than blocking silently. Back is never
gated: a step already passed is a step already answered. The stepper stays
`linear`, so a future step is not clickable — the only way forward is through
the gate.

The wizard never runs the form's own validators to gate a step. Running them
would mark every field in the document, including the ones on steps nobody has
seen, and an unreached step would arrive already red.

## Review

With `review` the wizard appends a final step (`id: 'review'`, label `Review`)
that renders every declared field as `label: value`, grouped by step. A field
whose `when` is false is left out — a setting the user never saw is not part of
the document they are reviewing. Steps whose `content` is JSX contribute nothing
the wizard could generate; give those flows their own last step.

## Resume

`resume` writes `{ step, values }` to a `createConfigStore` document under the
`newui.wizard` namespace, so the key is `newui.wizard:<id>`:

```tsx
const store = createConfigStore({ key: 'newui.wizard' })

function Checkout() {
  return (
    <Wizard
      label="Checkout"
      steps={[]}
      form={undefined as never}
      resume={{ id: 'checkout', store }}
    />
  )
}
```

A step change is written at once; typing is debounced, because a keystroke is
not a checkpoint. On the next visit the remembered step opens and the remembered
document is applied with `form.reset(values)`, which makes the draft the
baseline a later reset returns to. A successful `onSubmit` deletes the document;
a failed one keeps it, and the error is the wizard's only message.

This is not autosave. `createAutoSave` persists a live document as it is edited
and is the draft's save path; `resume` only remembers where the flow stopped.
`onSubmit` stays the way anything is saved.

## Behavior and accessibility

`data-slot` hooks: `wizard`, `wizard-progress`, `wizard-content`,
`wizard-field`, `wizard-review`, `wizard-review-group`, `wizard-review-item`,
`wizard-review-value`, `wizard-error`, `wizard-footer`, `wizard-back`,
`wizard-next`, `wizard-submit`.

The step list is the `Stepper`'s navigation landmark, named by `label`; the
current marker carries `aria-current="step"`. The panel is a `role="region"`
named by the current step's label, so a screen reader says which step you are
on without the step list being re-read. The step message is a `role="alert"`
region; field errors are the fields' own.

The footer's buttons are `type="button"` — the document is saved by `onSubmit`,
never by the browser's form submission. Keyboard navigation is the stepper's
(arrow-free by design: the markers are buttons in a list) plus the footer.

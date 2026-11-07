# ConfigForm

The config-form organism: a schema-driven `<form>` that renders every field
from its field-map entry — the `FormControl` vocabulary for plain fields,
`Repeater` for arrays, and the `when` predicates for visibility — all bound to
the live form state.

The engine's half (pruning hidden values, schema validation that drops issues
under hidden paths, `dependsOn` revalidation, autosave) lives in
`@talelk/newui-data/form`; this is the rendered face. The layering rule that
visual packages never import the data layer means the field shape is mirrored
here as `ConfigFormField` — structurally identical to `FieldConfig`, and the
same object is passed to `createAppForm`'s `ui` and to `ConfigForm`'s `fields`.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `form` | `ConfigFormApi` | — | the TanStack form — pass `appForm.form` |
| `fields` | `Record<string, ConfigFormField<TValues>>` | — | the field map, keyed by path; renders in key order |
| `components` | `Record<string, ConfigFormControlComponent>` | — | custom controls by `type`, joined onto the `FormControl` vocabulary |
| `autosave` | `{ saving: Accessor<boolean>; saved: Accessor<boolean> }` | — | renders "Saving…/Saved" where the form chrome sits |
| `class` | `string` | — | merged into the form stack |
| `children` | `JSX.Element` | — | extra chrome after the fields — usually the submit button |

## The field map

`fields` is the field map, keyed by static field path (never an array
position — a repeater's row fields go under its `fields`). Each entry decides
what renders:

| key | meaning |
| --- | --- |
| `type` | the `FormControl` vocabulary (`text`, `textarea`, `select`, `combobox`, `multiselect`, `checkbox`, `date`, `time`, `datetime-local`, …) plus `repeater`; defaults to `text` |
| `label` / `description` / `placeholder` / `required` / `disabled` | the P5 labelling contract, passed to the resolved control |
| `options` | `{ value; label? }[]` for the choice types |
| `props` | extra props passed through to the resolved control |
| `component` | rendered instead of the `type` mapping — where an app's own pickers join the vocabulary without forking the renderer |
| `dependsOn` | read by the engine only (revalidation); the renderer ignores it |
| `when` | `(scope, values) => boolean`; returning `false` hides the field. `scope` is the form's values for a top-level entry and the row for a repeater's row field |
| `fields` | for `type: 'repeater'`: the row's fields |
| `maxItems` | for `type: 'repeater'`: the ceiling on rows |

Visibility is conditional JSX over the form's reactive values: `when` is
evaluated against `form.useSelector((state) => state.values)` — and, for a row
field, against the row's own reactive value first — so flipping a sibling
field reveals or hides the field with no wiring.

`ConfigFormField` mirrors `FieldConfig` because visual packages never import
the data layer; `apps/playground/src/lib/config-form-parity.test.ts` pins the
two as structurally identical, so `pnpm typecheck` fails on drift.

```tsx
const ui = {
  mode: {
    type: 'select',
    label: 'Mode',
    options: [
      { label: 'Simple', value: 'simple' },
      { label: 'Advanced', value: 'advanced' },
    ],
  },
  host: {
    type: 'text',
    label: 'Host',
    when: (values) => values.mode === 'advanced',
  },
  items: {
    type: 'repeater',
    maxItems: 10,
    fields: { title: { type: 'text', label: 'Title' } },
  },
}

function Settings() {
  const app = createAppForm({ defaultValues, ui, onSubmit })
  return (
    <ConfigForm form={app.form} fields={ui}>
      <Button type="submit">Save</Button>
    </ConfigForm>
  )
}
```

## Slots & states

`data-slot="config-form"` on the `<form>`, `data-slot="config-form-field"`
around each field, `data-slot="config-form-status"` on the autosave line.
`pnpm stories:check` requires the `Default` and `Hidden` states.

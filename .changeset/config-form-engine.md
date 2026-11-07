---
'@talelk/newui-data': minor
'@talelk/newui-molecules': minor
'@talelk/newui-organisms': minor
---

The config-form engine (issue #30): a schema-driven form that renders itself.

- **`createAppForm` grows a declarative layer** in `@talelk/newui-data/form`.
  A field map (`ui`: `FieldConfig` entries keyed by static field path) and a Standard `schema`
  drive the whole document: the schema validates the *submitted* document, so
  fields hidden by `when` are pruned before validation and issues under hidden
  paths are dropped — a field the user cannot see never blocks the submit.
  `dependsOn` compiles onto a TanStack `onChange` listener that revalidates the
  dependent field with the `dynamic` cause; `pruneHidden` (default `true`) drops
  hidden fields from the document handed to `onSubmit` — including a repeater's
  row fields, whose `when(row, values)` sees the row first. `document(values)`
  exposes that submitted document.
- **`createAutoSave(source, { save, debounce = 800, filter?, id?, storage? })`**
  is debounced backend persistence that validates before writing. Given the
  `createAppForm` result it saves the same pruned document submit sends. With
  `id` it also keeps a local, unpruned draft under `newui.form-draft`, dropped
  after a successful autosave or submit; `hasDraft` is reactive.
- **`Repeater`** (molecules) is a dynamic array over a `mode="array"` field —
  add/remove/copy with `maxItems`/`minItems` bounds and an optional collapse per
  row. Rows iterate with `Index`, so a removal never takes the wrong row's
  values, and structural changes revalidate from the changed index onward.
- **`ConfigForm`** (organisms) is the rendered face: a `<form>` that renders
  every field from its field-map entry — the `FormControl` vocabulary for plain
  fields, `Repeater` for arrays, and `when` predicates for visibility, bound to
  the live form state.
- **`FormControl`** now forwards `onBlur` on the text-like and `textarea` types,
  so a config field can mark itself touched.

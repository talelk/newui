---
'@talelk/newui-data': minor
'@talelk/newui-molecules': minor
'@talelk/newui-organisms': minor
---

The config-form engine (issue #30): a schema-driven form that renders itself.

- **`createAppForm` grows a declarative layer** in `@talelk/newui-data/form`.
  A `ui` sidecar (`FieldConfig`, keyed by field path) and a Standard `schema`
  drive the whole document: the schema validates the *submitted* document, so
  fields hidden by `when` are pruned before validation and issues under hidden
  paths are dropped — a field the user cannot see never blocks the submit.
  `dependsOn` compiles onto a TanStack `onChange` listener that revalidates the
  dependent field with the `dynamic` cause; `pruneHidden` (default `true`) drops
  hidden fields from the document handed to `onSubmit`.
- **`createAutoSave(form, { save, debounce = 800, filter?, id?, storage? })`** is
  isDirty-driven, debounced persistence: it validates before writing, drafts to
  the config store under `newui.form-draft`, and clears the draft after a
  successful save.
- **`Repeater`** (molecules) is a dynamic array over a `mode="array"` field —
  add/remove/copy with `maxItems`/`minItems` bounds and an optional collapse per
  row. Rows iterate with `Index`, so a removal never takes the wrong row's
  values, and structural changes revalidate from the changed index onward.
- **`ConfigForm`** (organisms) is the rendered face: a `<form>` that renders
  every field from its `ui` entry — the `FormControl` vocabulary for plain
  fields, `Repeater` for arrays, and `when` predicates for visibility, bound to
  the live form state.
- **`FormControl`** now forwards `onBlur` on the text-like and `textarea` types,
  so a config field can mark itself touched.

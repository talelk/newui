# Research: what TanStack Form gives us for repeaters, dependencies, schemas

**Ticket:** [#16](https://github.com/talelk/newui/issues/16)
**Question:** what does `@tanstack/solid-form` offer for dynamic field arrays
(repeater semantics), field dependency/visibility reactivity, and adapting
Zod/valibot schemas into field configuration — and what must `@talelk/newui-data/form`
gain so a config-form engine can be built on top?

**Evidence base.** All claims are pinned to either (a) the installed packages in
the main checkout — `@tanstack/solid-form@1.33.5` and
`@tanstack/form-core@1.33.5` (`node_modules/.pnpm/...`, cited below as
`form-core:…` / `solid-form:…`) — or (b) the official docs at
tanstack.com/form (cited by URL). Where the docs describe *latest* and the
installed 1.33.5 differs, that is called out explicitly.

---

## 1. What's built in

### 1.1 Dynamic field arrays (repeater semantics)

The array machinery is real and complete; we do not need to build value
mutation, only presentation.

**Form-level array methods** (`form-core:FormApi.d.ts` L467–490, confirmed
against the [FormApiArrayMethods reference](https://tanstack.com/form/alpha/docs/reference/interfaces/FormApiArrayMethods)):

- `pushFieldValue(name, value)` / `insertFieldValue(name, index, value)` /
  `removeFieldValue(name, index)` / `swapFieldValues(name, i, j)` /
  `moveFieldValues(name, i, j)` / `replaceFieldValue(name, index, value)` /
  `clearFieldValues(name)`.
- Each marks the array field touched+dirty, notifies change listeners, and
  runs change validation by default (`UpdateMetaOptions` overrides).
- `filterFieldValues` exists in the docs' *latest* API surface but **not** in
  the installed 1.33.5 — do not budget on it yet.

**Field-level array methods** (`form-core:FieldApi.d.ts` L218–242): the same
operations live on the field itself — `pushValue`, `insertValue`,
`replaceValue`, `removeValue`, `swapValues`, `moveValue`, `clearValues` — so a
repeater row's `<Field name="items">` block owns its own mutations.

**Array-mode fields.** Solid's `Field`/`createField` accept
[`mode?: 'value' | 'array'`](https://tanstack.com/form/latest/docs/framework/solid/guides/arrays).
The implementation (`solid-form:createField.jsx`, `makeFieldReactive`) shows
what that buys: in `array` mode the reactive subscription tracks only
`state.meta._arrayVersion` (a counter incremented on every push/insert/remove/
swap/move/replace/clear — `form-core:types.d.ts` L223–229) instead of the whole
array value, so structural changes re-render the repeater shell without
re-rendering every row, and row *content* edits do not re-render the shell.
`_arrayVersion` is marked `@private` — adapters may read it, application code
should not.

**The Solid-specific rendering rule** (arrays guide, URL above): iterate with
`Index` from `solid-js`, **not** `For` — `For` re-renders inner components on
every array change and loses sub-field values. Rows are declared by string
path: `<form.Field name={`people[${i}].name`}>`.

**Array validation.** `formApi.validateArrayFieldsStartingFrom(field, index,
cause)` (`form-core:FormApi.d.ts` L406) cascades validation from one index —
the hook for "validate everything from the row the user just edited".
Form-level Standard Schema validators return issues keyed by path, and array
sub-fields (`socials[0].url`) receive errors automatically (validation guide,
§"Setting field-level errors from the form's validators").

### 1.2 Field dependencies and visibility

**There is no declarative visibility API.** Conditional fields are plain
reactive JSX: the [Svelte/Solid examples](https://tanstack.com/form/latest/docs/framework/solid/overview)
show `{#if field.state.value}` wrapping a nested `<form.Field>` — visibility is
just reading store state inside a `Show`/`when`. The store is reactive
(`useSelector`/`form.useSelector`, `solid-form:createForm.d.ts` L9), so a
predicate over `form.state.values` re-renders the toggle. Nothing else is
offered and nothing more is needed for *rendering* — but see §2.3 for what
this leaves undecided (hidden-value semantics).

**Cross-field *validation* dependencies are built in.** `validators.onChangeListenTo`
and `onBlurListenTo` (`form-core:FieldApi.d.ts` L63, L85) take a list of field
names whose changes re-trigger this field's `onChange`/`onBlur` validators —
the canonical confirm-password / total-of-rows pattern, no manual `subscribe`.

**Validation timing is declarative.** `onDynamic` + `revalidateLogic({mode,
modeAfterSubmission})` (`form-core:ValidationLogic.d.ts` L52; [dynamic
validation guide](https://tanstack.com/form/latest/docs/framework/solid/guides/dynamic-validation))
implements "validate on submit until first submit, then on change" — the
default `submit`/`change` split. `ValidationCause` includes
`'change' | 'blur' | 'submit' | 'mount' | 'server' | 'dynamic'`
(`form-core:types.d.ts` L14).

**Side-effect listeners exist at both levels**: field `listeners.onMount/
onChange/onBlur/onSubmit/onUnmount` and form `listeners.onFieldMount/
onFieldUnmount/...` (`form-core:FieldApi.js` L98–104, `FormApi.d.ts` L151).
Async validators support `asyncDebounceMs` per field and per validator.

**What happens when a field unmounts** (`form-core:FieldApi.js` L80–105):
meta resets to defaults *except* `isTouched`/`isBlurred`/`isDirty`, the field
instance is detached, and **the value stays in form state** — values live on
the form, not the field component. A hidden field keeps contributing to
`state.values` and to submission. This is the single most important fact for
§2.3.

### 1.3 Zod / valibot as schema (Standard Schema)

**Native, not an adapter.** form-core implements the
[Standard Schema](https://github.com/standard-schema/standard-schema)
interface directly (`form-core:standardSchemaValidator.d.ts`: `StandardSchemaV1`,
`standardSchemaValidators`, `isStandardSchemaValidator`). Any conforming
library — Zod, Valibot, ArkType — is passed *as the validator*:
`validators.onChange = z.number().gte(13)` (validation guide,
§"Validation through Schema Libraries"). There are no `zodValidator`/
`valibotValidator` wrappers in 1.33.5; the older per-library packages are gone.

**Schema-to-field error routing** is the valuable part: a form-level schema
(or `onSubmitAsync` returning `{form, fields: {...}}`) propagates issues to the
matching field paths, including array indices (`'socials[0].url'`). Issue
paths arrive as `StandardSchemaV1Issue.path` (keys or
`{key}` segments — `standardSchemaValidator.d.ts`), which is exactly what our
`fieldError` consumes today.

**Escape hatch for composition:** `fieldApi.parseValueWithSchema(schema)` /
`parseValueWithSchemaAsync` (`form-core:FieldApi.d.ts` L291–297) runs a schema
inside a callback validator, so schema + imperative rules mix per field.

**Two sharp edges, straight from the docs:** validation does *not* emit
transformed values (a coercing/defaulting Zod schema's output is discarded —
the note under the schema section points at submission-handling); and
form-level vs field-level errors of the same cause can overwrite each other
(the "Too young / Must be odd" caveat).

**What the library does *not* offer: schema → UI.** Everything above is
*validation*. TanStack Form never inspects a schema to decide which control to
render, what options a select has, or whether a field is required. There is no
introspection API to build on — a Zod/valibot-to-field-config layer is entirely
ours (see §2.4).

### 1.4 Autosave primitives

No autosave feature exists — the docs never mention one — but the primitives
are all there:

- `form.state.isDirty` / per-field `meta.isDirty` (`types.d.ts` L198, L244);
- `form.useSelector(selector)` for scoped reactive reads
  (`solid-form:createForm.d.ts` L9; `useStore` is deprecated in favour of it);
- `form.subscribe(cb)` / `form.store` (`@tanstack/store`) for imperative
  change taps, and `listeners.onChange` at form and field level;
- `formApi.reset()` / `resetField()` to reconcile with server state.

`asyncDebounceMs` debounces *validators*, not listeners — an autosave
debounce is ours to write.

### 1.5 Composition machinery (the bridge's intended shape)

`createFormHookContexts` + `createFormHook` (`solid-form:createFormHook.d.ts`;
[form-composition guide](https://tanstack.com/form/latest/docs/framework/solid/guides/form-composition))
is the officially blessed way to bind kit components to fields: register our
controls as `fieldComponents`, and `form.AppField name="x" children={f =>
<f.TextField/>}` gives type-checked names with our UI. `withForm` /
`withFieldGroup` split large forms; `formOptions` makes option objects
reusable. This is a much better fit for the kit than hand-rolling a context.

---

## 2. What our bridge must build

Today `createAppForm` is ~55 lines: `defaultValues` + `onSubmit` + `submitting`
selector + `fieldError` (`packages/data/src/form/form.tsx`). Everything below
is net-new; none of it duplicates TanStack.

### 2.1 Repeater component (`@talelk/newui-organisms` or molecules — decide by surface)

A declarative `<Repeater name="items">` that:

- renders the array field with `mode="array"` + `Index` (the guide's rule is
  correctness-critical, so it belongs inside the component, not in docs);
- exposes bound actions to the row renderer — `push`/`insert`/`remove`/`move`/
  `swap`/`clear` — thin wrappers over `field.pushValue` etc.;
- keys rows stably (the array guide's `key={account.provider}` pattern;
  index keys fight `Index`);
- optionally calls `validateArrayFieldsStartingFrom` on row add/remove so
  shifted rows re-validate.

**API-shape implication:** the row body receives a *path prefix*
(`items[${i}]`) and renders ordinary `form.Field`s against it — the same
config-driven renderer used for flat fields, with `name` composed from the
prefix. A repeater is "one more field type", not a second rendering mode.

### 2.2 Schema wiring in `createAppForm`

Accept `schema?: StandardSchemaV1` (the type form-core exports — zero extra
dependency) and wire it as the form-level `validators.onChange`/`onSubmit`
(or `onDynamic` if we adopt `revalidateLogic` — it is exported from the
installed core, so no version bump needed). The existing `fieldError` already
flattens `meta.errors`; the only addition is mapping
`StandardSchemaV1Issue.path` → field name for form-level issues, which
TanStack already does for us in the common case.

**API-shape implication:** `AppFormOptions` gains `schema`; nothing in the
public surface changes shape. Decide *now* whether the kit validates on change
or with `revalidateLogic` (submit-then-change) — it is a product decision
dressed as a prop, and `onDynamic`'s field-level errors land in a separate
`errorMap.onDynamic` slot that `fieldError` must include.

### 2.3 Visibility: a `when` predicate plus hidden-value semantics

Rendering is solved (§1.2) — `<Show when={predicate(values, form)}>` around
the field. The bridge must add:

1. A config-level `when?: (values) => boolean` (or `Accessor<boolean>`) that
   the renderer turns into `Show` — reactive for free via the store.
2. A decision TanStack deliberately leaves open: **what happens to the value
   of a field that becomes hidden.** Unmounting preserves the value in
   `state.values` (§1.2), so a hidden-but-retained field silently submits.
   The kit needs an explicit `keep`/`clear` (or `prune`) policy — clearing is
   one `form.setFieldValue(name, undefined)` in a `createEffect`, but it must
   be *our* documented semantics, not an accident of unmounting.
3. If we adopt `onDynamic`/`revalidateLogic`, hidden fields must be excluded
   from validation (a schema that requires a hidden field is a config bug the
   engine should surface — strip hidden keys before running the schema, or
   validate `values` after pruning).

### 2.4 Schema-driven rendering — the config-form engine's own layer

TanStack gives validation, not introspection (§1.3). Our engine needs, in
`@talelk/newui-data/form`:

- a **`FieldConfig`** type: `{ name, type: FormControlType, label, description,
  required, options?, when?, array?: { item: FieldConfig[] } }` — vocabulary
  reused verbatim from `spec/form.md` (P1: no invented names);
- a **`toFieldConfig(schema)`** adapter per library. Because Zod/valibot
  expose their own shape trees, this is a per-library traversal producing
  `FieldConfig[]`; keep it *thin and lossy* — anything it can't represent
  (custom refinement, transforms) falls back to `type: 'custom'` + the raw
  validator, so the config is always overridable;
- the **renderer**: config array → `form.Field` + `FormControl` dispatch. The
  `createFormHook` `fieldComponents` map is the binding point: each
  `FormControlType` becomes a registered component reading `useFieldContext`,
  so the config layer composes *with* TanStack's composition story instead of
  bypassing it.

**API-shape implication:** config-driven and hand-written forms must be the
*same* form — the config is a generator for `Field` usages, not a parallel
engine. That is what keeps `fieldError`, `Form`, `submitting` and the P5
labelling contract valid on both paths.

### 2.5 Autosave

Build `createAutoSave(form, { save, debounce = 1000 })` in
`@talelk/newui-data/form`: subscribe via `form.useSelector(s => [s.values,
s.isDirty])` (or `form.subscribe`), debounce, invoke `save(values)` — and
integrate with `@talelk/newui-data/query` (the kit owns mutation lifecycle),
not with TanStack Form, which offers no mutation story. Two rules the docs
give us for free: skip while `isSubmitting` (the submit lifecycle already
exists in `createAppForm`), and `reset()` after a server write so `isDirty`
returns to false. Per-field `meta.isDirty` enables future "only send the
delta" behaviour without changing the API.

---

## 3. Summary answer

TanStack Form 1.33.5 is a sound foundation for all three planning axes and
needs very little *underneath* us: repeaters are a solved problem in the
library itself (seven array methods on `FormApi`, mirrored on `FieldApi`, plus
`mode="array"` with an internal `_arrayVersion` counter, with the Solid rule
`Index`-not-`For`); dependency reactivity is half-built (cross-field validator
triggers, `revalidateLogic`, listeners, reactive store — but visibility is
plain conditional JSX with *retain-value-on-unmount* semantics we must adopt
or override explicitly); and Zod/valibot arrive for free through Standard
Schema with automatic path-based error routing, but only as *validators* —
schema-to-UI introspection does not exist anywhere in the ecosystem's form
library and is the config engine's actual reason to exist. Our bridge grows
four things: a `Repeater` component, a `schema` option on `createAppForm`, a
`FieldConfig` + `toFieldConfig` + renderer layer bound through
`createFormHook`, and `createAutoSave` — none of which fight the library, and
all of which keep the existing `Form`/`fieldError`/`submitting` surface intact.

## Sources

- Installed source (read-only): `node_modules/.pnpm/@tanstack+form-core@1.33.5/.../dist/esm/{FormApi,FieldApi,types,standardSchemaValidator,ValidationLogic}.d.ts`, `@tanstack+solid-form@1.33.5/.../dist/source/{createField.jsx,createField.d.ts,createFormHook.d.ts,types.d.ts}`
- https://tanstack.com/form/latest/docs/framework/solid/guides/arrays (`mode="array"`, `Index` rule, `pushValue`)
- https://tanstack.com/form/latest/docs/framework/solid/guides/validation (Standard Schema, form→field error routing, `canSubmit`, overwrite caveat)
- https://tanstack.com/form/latest/docs/framework/solid/guides/dynamic-validation (`onDynamic`, `revalidateLogic`)
- https://tanstack.com/form/latest/docs/framework/solid/guides/form-composition (`createFormHook`, `withForm`, `withFieldGroup`)
- https://tanstack.com/form/alpha/docs/reference/interfaces/FormApiArrayMethods (array method semantics: touched/dirty/listeners/validation per operation)
- https://tanstack.com/form/latest/docs/framework/solid/overview (Solid API shape: `createForm(() => …)`, `form.Field` children-as-function, `form.Subscribe`, `useSelector`)
- Local: `packages/data/src/form/form.tsx`, `spec/form.md` (the bridge surface being extended)

---
'@newui/data': minor
---

`@newui/data/form` — the submit lifecycle and the field-error bridge.

Tasks and Authentication each repeated the same six lines around every field:
wire `value`, unwrap `meta.errors` into a string, handle submit with
`noValidate` and `preventDefault`, and read `isSubmitting` for the button. The
form surface adds those once, over TanStack Form:

```ts
const { form, submitting } = createAppForm({
  defaultValues: { email: '' },
  onSubmit: async (value, api) => { await save(value); api.reset() },
})
```

- **`createAppForm`** returns `{ form, submitting }`; `submitting()` is true while
  the handler's promise is pending, which is what a submit button's `loading`
  reads.
- **`<Form form={form}>`** is the element, wired: `noValidate` (the kit's field
  messages are the error UI; the native bubble appears first, says less, and
  disappears on the next keystroke) and `preventDefault` (a real submit in a SPA
  navigates).
- **`fieldError(field)`** turns TanStack's error list into the single `error`
  string the P5 contract takes, accepting strings *and* `{ message }` issues.

It deliberately does not render fields: the kit's controls own their markup,
labels and error region. The bridge is the shared call shape, not a second
component tree. Its own entry point keeps the validator engine out of pages that
do not render a form (17.5 kB, budgeted, separate from the 0.77 kB helpers).

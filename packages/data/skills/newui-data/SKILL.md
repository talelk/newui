---
name: newui-data
description: Use the headless newui data layer for SolidJS collections,
  repository queries, optimistic mutations, TanStack Query caching and form
  submit lifecycles. Use when a page needs to load a list, create/update/delete
  records, share a cache, or wire TanStack Form through the kit's Form and
  field-error contract.
metadata:
  type: core
  domain: data
  library: '@talelk/newui-data'
  library_version: '1.0.0'
sources:
  - talelk/newui:spec/data.md
  - talelk/newui:skills/README.md
  - talelk/newui:packages/data/README.md
  - talelk/newui:packages/data/src/query/client.tsx
  - talelk/newui:packages/data/src/query/collection.ts
  - talelk/newui:packages/data/src/query/repository.ts
  - talelk/newui:packages/data/src/form/form.tsx
---

# newui-data

The headless data layer: one query client, one collection abstraction and one
form surface. It renders nothing. Load the `newui` skill as well when the page
needs components.

## Wire the client once

```tsx no-check
import { DataProvider } from '@talelk/newui-data/query'

export function App() {
  return <DataProvider>{/* router and pages */}</DataProvider>
}
```

`DataProvider` owns a `QueryClient` and clears it on unmount. Pass `client` to
share one across panes. The defaults are deliberate: no refetch on window focus,
one retry, and errors are data the page renders rather than exceptions.

## Collections

A repository is the only place that knows where records come from. A collection
turns it into one cached list and four optimistic mutations.

```tsx
import { createCollection } from '@talelk/newui-data/query'

const projects = createCollection<Project, NewProject>(() => ({
  key: ['projects'],
  repository: projectRepository,
  onError: (error) => setNotice(error.message),
}))

projects.query.rows()
projects.query.isPending()
projects.query.isError()
projects.create.mutateAsync(input)
projects.update.mutateAsync({ id, patch })
projects.updateMany.mutate({ ids, patch })
projects.remove.mutateAsync({ ids })
```

- Read `collection.query.rows()`; never reach into the cache from a page.
- `create` is not optimistic because the repository owns the new id and defaults.
- `update`, `updateMany` and `remove` land immediately and roll back on failure.
- Mutations resolve after the list refresh settles, so a page can close its
  dialog in the same `await`.
- Repositories receive an `AbortSignal`; honour it or superseded list requests
  can resurrect stale rows.

## Forms

```tsx no-check
import { createAppForm, fieldError, Form } from '@talelk/newui-data/form'

const { form, submitting } = createAppForm({
  defaultValues: { name: '' },
  onSubmit: async (value) => {
    await projects.create.mutateAsync({ name: value.name })
  },
})

<Form form={form}>
  <form.Field
    name="name"
    validators={{
      onChange: ({ value }) =>
        value.trim().length < 2 ? 'Give the project a name.' : undefined,
    }}
  >
    {(field) => (
      <TextInput
        label="Name"
        required
        value={field().state.value}
        error={fieldError(field())}
        onInput={(event) => field().handleChange(event.currentTarget.value)}
      />
    )}
  </form.Field>
  <Button type="submit" loading={submitting()}>
    Create
  </Button>
</Form>
```

- `createAppForm` owns TanStack Form and exposes `submitting()` for the button.
- `Form` sets `noValidate` and prevents the native submit; field messages are the
  error UI.
- `fieldError` maps TanStack's error list to the single string `Field` takes and
  de-duplicates the same validator message.
- Pass the same message to `onChange` and `onSubmit` when the field should
  validate on both; `fieldError` will not print it twice.

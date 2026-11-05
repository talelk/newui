---
name: newui-data
description: Use the headless newui data layer for SolidJS collections,
  repository queries, optimistic mutations, TanStack Query caching, form submit
  lifecycles, URL-synced state, saved-view/dashboard-config storage and
  aggregation/rollup transforms. Use when a page needs to load a list,
  create/update/delete records, share a cache, sync filters or views to the
  URL, persist saved views, build chart series, or wire TanStack Form through
  the kit's Form and field-error contract.
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
  - talelk/newui:packages/data/src/url-state.ts
  - talelk/newui:packages/data/src/config-store.ts
  - talelk/newui:packages/data/src/aggregate.ts
  - talelk/newui:packages/data/src/resource/connect-realtime.ts
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

## URL state, saved views and transforms

```ts
import { createConfigStore, createUrlState, rollup } from '@talelk/newui-data'

// Link-reproducible state; the app owns the router through `adapter`.
const filters = createUrlState(
  { 'board.view': 'kanban', q: '' },
  { adapter, debounce: ['q'] },
)
filters['board.view']()
filters.set('q', 'invoice') // undefined = absent, never ""

// Saved views and dashboard configs: versioned envelopes, storage-agnostic.
const views = createConfigStore({ key: 'acme.views' })
views.save('week-only', { filters: [] }, { type: 'saved-view' })

// Chart series from a time column — pure, no query, no components.
const series = rollup(rows, { field: 'createdAt', unit: 'day', metric: { field: 'amount', metric: 'sum' } })
```

- `createUrlState` reads the URL once on mount and **replaces** (never pushes);
  without an adapter it is a plain signal, so tests and SSR stay clean.
- `createConfigStore` documents are capped at 64KB with a dev warning; a
  server-backed adapter drops in by passing `storage`, no consumer changes.
- `aggregate`/`rollup` run over rows the app already fetched — past that size
  the answer is server-side, not a client pivot.
- A collection can poll with `refetchInterval`; `connectRealtime` (from
  `@talelk/newui-data/resource`) invalidates query keys from socket events.

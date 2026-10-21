# @newui/data

## 1.0.0

### Major Changes

- 0d87bbb: Clean break to the atomic public API. The `@newui/ui`, `@newui/blocks` and
  `@newui/layouts` packages are removed; consumers import atoms, molecules,
  organisms and templates from the new package names. No compatibility barrels,
  deprecated shell adapters or legacy route redirects are shipped.
  
  `@newui/templates` now exposes exactly `AppShell`, `PaneLayout` and
  `AuthLayout`. `AppShell` owns one responsive sidebar with tenant, grouped
  navigation and pinned settings/account controls; split rail/sidebar composition
  is removed. `DataTable`, `ScrollTable` and `VirtualList` move from the logic
  package into the atomic visual packages, leaving `@newui/data` headless.

### Minor Changes

- c47db72: `@newui/data/form` — the submit lifecycle and the field-error bridge.
  
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
- 1f70e3f: `@newui/data` — the logic layer, starting with the pure helpers.
  
  The examples had already converged on four helpers and then copied each of them
  per page: formatting (four `Intl` USD copies), select plumbing, one-step undo
  (three copies) and downloads (the Blob/anchor/revoke dance in nine files, the
  CSV quoting in two). They are one package now, headless by contract — it imports
  `solid-js` and nothing from the visual packages, and no component may import it.
  
  `format` · `usd`, `usdK`, `count`, `bytes`, `isEmail`
  `select` · `optionsOf`, `first`
  `undo` · `createUndo`
  `download` · `downloadBlob`, `downloadText`, `csvText`, `downloadCsv`
  
  Twenty-five example files now import `@newui/data`; the local modules are
  deleted. The async shapes (repository, queries, forms, promoted table and list)
  are the next slice — `spec/data.md` is the contract for what has shipped and
  says why `Notice` did *not* move here: it renders, so it is a component.
- 3745084: `@newui/data/query` — the async surface: one client, one repository contract,
  one collection.
  
  ```ts
  import { DataProvider, createCollection } from '@newui/data/query'
  ```
  
  - **`DataProvider`** owns the query client and clears it on unmount; pass a
    `client` to share one cache across panes. `createDataClient` states the kit's
    defaults: no refetch on focus, one retry, `throwOnError: false`.
  - **`Repository<T, New>`** is `list / create / update / remove` and nothing else.
    Domain verbs are patches at the call site — a contract that grows a method per
    business action is a database, not a seam.
  - **`createCollection`** returns the list query and four mutations. Updates and
    removals are **optimistic and reversible**: the change is on screen before the
    request, and a failure restores the previous list. Creates wait, because a new
    record's id and defaults are the repository's to decide. Every mutation
    refreshes the list on settle, so a mutation and the Refresh button take the
    same path.
  
  The query surface is its own entry point (15.5 kB gzip, budgeted): importing
  `usd` still costs 0.77 kB and no cache. TanStack Query is the package's
  dependency now; the app no longer depends on it directly, and Tasks — the one
  page that used it — adopts the collection API instead of creating a client and
  writing cache updates by hand.

### Patch Changes

- 7945c81: `fieldError` prints a message once, even when a field declares it for both
  `onChange` and `onSubmit`.
  
  A field that validates as you type *and* on the way out usually uses the same
  sentence for both. TanStack keeps one entry per validator, so the naive join
  rendered it twice ("Use at least 8 characters. Use at least 8 characters.").
  The bridge now de-duplicates the messages, which is what the single `error`
  string the `Field` contract takes was always meant to be.

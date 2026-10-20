# @newui/data

The logic layer: the things every application does the same way, and no two
applications agree on when they each write them from scratch.

```ts
import { createUndo, downloadCsv, optionsOf, usd } from '@newui/data'
```

## The boundary

`@newui/data` is **headless**. It imports `solid-js` for signals and nothing from
`@newui/ui`, `@newui/blocks` or `@newui/layouts`, which is enforced by
dependency-cruiser (`data-is-headless`). The rule in the other direction is just
as strict: no component package may import it (`nothing-below-imports-data`). A
component that needs to format a number takes that from the app — the kit does
not acquire an opinion about money.

What renders stays in the kit. `Notice` is the instructive case: the examples
copied it eleven times, and the plan named it here, but it renders a banner with
buttons — so it is a *component*, and promoting it into a headless package would
have made the layer lie about itself. It stays a UI component (or an app
composition) until it earns its own surface.

## Surfaces

| export | signature | what it owns |
| --- | --- | --- |
| `usd` | `(value: number) => string` | whole-dollar USD: `usd(128430)` → `$128,430` |
| `usdK` | `(value: number) => string` | compact axis form: `usdK(42500)` → `$43k` |
| `count` | `(value: number) => string` | grouped integer: `count(128430)` → `128,430` |
| `bytes` | `(value: number) => string` | `bytes(2048)` → `2.0 KB` |
| `isEmail` | `(value: string) => boolean` | the one address check the forms share |
| `optionsOf` | `(values: readonly string[]) => SelectOption[]` | `['Size']` → `[{ label: 'Size', value: 'Size' }]` |
| `first` | `(value: string[], fallback: string) => string` | the single-select unwrap, with a fallback |
| `createUndo` | `<T>() => Undo<T>` | snapshot, capture, undo-once, clear |
| `downloadBlob` | `(name: string, blob: Blob) => void` | the Blob / anchor / revoke dance |
| `downloadText` | `(name, text, mime?) => void` | text, `text/plain` unless told otherwise |
| `csvText` | `(rows: (string \| number)[][]) => string` | every cell quoted, inner quotes doubled, CRLF |
| `downloadCsv` | `(name: string, rows) => void` | `csvText` plus the download |

## Behavior

- **Formatters are built once.** `Intl.NumberFormat` is constructed at module
  scope; constructing one per cell is the cost that never shows in a profile and
  always shows in a long list.
- **`createUndo` is one step, on purpose.** `capture` replaces the snapshot —
  there is no stack, because a second undo is a history feature and a history
  feature needs labels to be useful. `snapshot()` being `undefined` is what
  "nothing to undo" means, so `T` must not itself include `undefined`.
- **CSV is quoted unconditionally.** Every cell is wrapped and inner quotes are
  doubled, which is the part that is easy to get subtly wrong; `42` becomes
  `"42"` and a spreadsheet reads it as a number anyway.
- **`downloadBlob` revokes after the click.** The URL is released in the same
  turn as the synthetic click, which is what every browser this kit targets
  accepts; a deferred revoke would leak a URL per download.

## Query — `@newui/data/query`

The query surface is a separate entry point, so a page that only formats a
number never pays for a cache.

```ts
import { DataProvider, createCollection } from '@newui/data/query'
```

### `DataProvider` and `createDataClient`

`DataProvider` wraps the page in a `QueryClientProvider`. Pass `client` to share
one cache across panes; omit it and the provider owns a client and **clears it on
unmount**, so a route change leaves no timers or caches behind.

`createDataClient(options)` states the kit's defaults once:

| option | default | why |
| --- | --- | --- |
| `staleTime` | `30_000` | local data does not change under a stale page |
| `retry` | `1` | a transient failure is worth one more try |
| `refetchOnWindowFocus` | `false` | not a dashboard; returning to the tab is not a refresh |
| `throwOnError` | `false` | an error is data the page renders, not an exception that tears the tree down |
| mutations `retry` | `0` | a write is not idempotent by accident |

### The repository

```ts
export interface Repository<T extends { id: string }, New = NewRecord<T>> {
  list(options?: { signal?: AbortSignal }): Promise<T[]>
  create(input: New, options?: { signal?: AbortSignal }): Promise<T>
  update(id: string, patch: Partial<T>, options?: { signal?: AbortSignal }): Promise<T>
  remove(ids: string[], options?: { signal?: AbortSignal }): Promise<void>
}
```

- **`list` is the only read.** A page that needs one record filters the list the
  cache already holds; a remote adapter that wants one request still exposes
  `list` and lets the cache be the collection.
- **Domain verbs are patches.** `complete`, `archive` and `comment` are
  `update(id, { status: 'Done' })` at the call site. A contract that grows a
  method per business action is a database, not a seam.
- **`New` is the create input**, not `Omit<T, 'id'>`: a repository fills the
  defaults it owns, and Tasks creates from `{ title, priority }` alone.

### `createCollection`

```ts
const tasks = createCollection(() => ({
  key: ['example-tasks'],
  repository,
}))

tasks.query.rows()        // T[]
tasks.query.isPending()   // first request in flight
tasks.query.isFetching()  // any request in flight (the Refresh button)
tasks.query.isError()     // the last request failed
tasks.query.error()       // Error | undefined
tasks.query.refetch()     // "Try again"

tasks.create.mutateAsync({ title, priority })
tasks.update.mutate({ id, patch })
tasks.updateMany.mutate({ ids, patch })
tasks.remove.mutate({ ids })
```

- **Updates and removals are optimistic and reversible.** The patch lands on
  screen before the request, and a failure restores the previous list — proven
  in `collection.test.tsx` with a gated promise, not by inspecting the cache.
- **Creates are not optimistic.** A new record's id and defaults are the
  repository's to decide; guessing them would show a row that then changes
  identity. `mutateAsync` resolves after the refresh, which is what lets a
  create dialog close knowing the row is on screen.
- **Every mutation refreshes the list on settle** (`invalidateQueries`), so a
  mutation and the "Refresh" button take the same path and cannot disagree.
- **Errors are normalised** to `Error` (TanStack's is `unknown`) and reported
  once through `onError`, so a page words one notice for every failure.
- **`key` is the cache identity** — two panes reading the same collection share
  one request and one update.

## Not yet

The promoted surfaces — `DataTable` (TanStack Table) and `VirtualList`
(TanStack Virtual) — and the TanStack Form bridge still live in the examples.
They render, so promoting them is a UI decision as much as a data one;
`spec/tanstack-integration.md` records the current ownership until they move.

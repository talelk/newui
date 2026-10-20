# @newui/data

The logic layer: the things every app does the same way and no two agree on
when they write them themselves.

```ts
import { createUndo, downloadCsv, usd, optionsOf } from '@newui/data'
```

The package is **headless** — it imports `solid-js` for signals and nothing from
`@newui/ui`, so a page can use it without paying for a component, and a
component can never reach up into it. What renders stays in the kit; this level
only answers *how it behaves*.

The first four surfaces are the ones the examples had already copied:

| surface | what it owns |
| --- | --- |
| `format` | `usd`, `usdK`, `count`, `bytes`, `isEmail` — one `Intl` formatter each, built once |
| `select` | `optionsOf`, `first` — the `{ label, value }` plumbing and the empty-array unwrap |
| `undo` | `createUndo` — a snapshot, a restore and a clear, without the page's notice copy |
| `download` | `downloadBlob`, `downloadText`, `downloadCsv`, `csvText` — the Blob/anchor/revoke dance and RFC-shaped quoting |

## Query

```tsx
import { DataProvider, createCollection } from '@newui/data/query'

const tasks = createCollection(() => ({
  key: ['tasks'],
  repository,               // list / create / update / remove
}))

tasks.query.rows()
tasks.update.mutate({ id, patch })   // optimistic, reversible
```

The query surface is its own entry point, so importing `usd` never pulls a
cache in. `DataProvider` owns the client (and clears it on unmount);
`createCollection` returns one list query and four mutations, each refreshing
the list on settle so a mutation and the Refresh button cannot disagree.

TanStack Query is a dependency of this package; the app does not depend on it
directly. The promoted `DataTable`/`VirtualList` (TanStack Table/Virtual) and
the Form bridge are still at the page layer — `spec/data.md` is the contract for
what has shipped.

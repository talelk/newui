---
'@newui/data': minor
---

`@newui/data/query` — the async surface: one client, one repository contract,
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

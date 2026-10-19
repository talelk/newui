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

The async shapes (a repository contract over TanStack Query, forms over TanStack
Form, the promoted `DataTable`/`VirtualList`) are the next slice of the ladder;
`spec/data.md` is the contract for what has shipped.

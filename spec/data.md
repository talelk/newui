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

## Not yet

The async shapes are the next slice: a repository contract
(`list/get/create/update/remove`), `createListQuery` over TanStack Query with
optimistic update, rollback, notice and undo, forms over TanStack Form, and the
promoted `DataTable` / `VirtualList` surfaces that currently live in the
examples. `spec/tanstack-integration.md` still describes the application-level
usage those will replace.

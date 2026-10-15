# Pagination

`Pagination` — page navigation for a long list, over Zag's `pagination` machine.
The machine owns which numbers show around the current page, when an ellipsis
stands in for a gap, the `siblingCount` / `boundaryCount` layout rule and the
arrow-key map.

## Parts

| part | notes |
| --- | --- |
| `Pagination.Root` | the machine and the `<nav>` |
| `Pagination.PrevTrigger` / `.NextTrigger` | the arrows; disabled at the ends |
| `Pagination.Pages` | the numbers, with the machine's ellipses between them |
| `Pagination.Range` | "1–20 of 348", read off the machine |

The parts are separate so a table can put the numbers in a toolbar and the range
beside a column header, which is where it usually belongs.

## Props

### `Pagination.Root`

| prop | type | default | notes |
| --- | --- | --- | --- |
| `count` | `number` | — | **rows**, not pages — the page count is derived from this and `pageSize` |
| `pageSize` | `number` | `10` | rows per page |
| `page` | `number` | — | controlled, 1-based |
| `defaultPage` | `number` | `1` | uncontrolled |
| `onPageChange` | `(page: number) => void` | — | |
| `siblingCount` | `number` | `1` | numbers either side of the current one |
| `boundaryCount` | `number` | `1` | numbers pinned at each end |
| `size` | `'sm' \| 'md' \| 'lg'` | `sm` | |
| `disabled` | `boolean` | `false` | |
| `aria-label` | `string` | `'Pagination'` | the `<nav>`'s accessible name |
| `class` | `string` | — | |

`Pagination.Range` takes `class` only.

## Behavior

- `count` is a row count. Naming it after the rows is deliberate: passing a page
  count here is the mistake this API exists to prevent, and `totalPages` is the
  machine's derived value for anything that needs the page count itself.
- The pager counts from 1, like the machine.
- At the first or last page the corresponding arrow is `disabled`.

## Styling hooks

`data-slot` (`pagination` / `-prev` / `-next` / `-page` / `-ellipsis` /
`-range`), Zag's `data-scope`/`data-part` on the machine's own props, and
`data-size` on the root.

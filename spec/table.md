# Table

The semantic table: `Table`, `TableHead`, `TableBody`, `TableRow`,
`TableColumnHeader` and `TableCell` style the native elements directly, for
data that is known and rendered in place. Wrap in `ScrollTable` when the
columns can overflow; reach for `DataTable` when the data needs sorting,
filtering, pagination or selection logic.

The header row carries the kit's one header treatment — the same
`tableHeadClass` `ScrollTable` composes — so the two never drift.

## Parts

| part | renders | notes |
| --- | --- | --- |
| `Table` | `table` | `w-full border-collapse text-interface` |
| `TableHead` | `thead` | shared header treatment |
| `TableBody` | `tbody` | |
| `TableRow` | `tr` | hairline divider, hover surface, `selected` ⇒ `data-selected` |
| `TableColumnHeader` | `th` | `scope="col"` by default, medium weight |
| `TableCell` | `td` | |

## Behavior and accessibility

Real `th`/`td` semantics stay in the consumer's hands: scope, captions and
`aria-describedby` compose natively. Rows are not interactive by themselves —
when a row is selectable, own the selection state and pass `selected`; the
`data-selected` attribute is the styling hook (P10). Numeric columns align
with `text-end` on the cells; 200% text enlargement reflows cells instead of
clipping.

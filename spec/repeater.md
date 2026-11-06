# Repeater

A dynamic array of rows over a `mode="array"` field: add, remove, copy, and
(optionally) a collapse per row, with `maxItems`/`minItems` bounds. It is a
molecule over TanStack Form — the rows are the form's array items, so the
repeater owns no value of its own.

Rows iterate with `Index`, not `For`: a row component must belong to its
position, or removing one silently takes the wrong row's field values with it.
Structural changes (insert, remove, copy) revalidate from the changed index
onward, so the errors that survive a shift stay aligned with their rows.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `form` | `RepeaterFormApi` | — | the TanStack form — pass `appForm.form` |
| `name` | `string` | — | the array field's path, e.g. `items` |
| `maxItems` | `number` | — | the ceiling on rows; the add button disappears at it |
| `minItems` | `number` | `0` | the floor on rows; remove is disabled at it |
| `addLabel` | `string` | `Add` | label for the add button |
| `copyable` | `boolean` | `false` | show a copy button per row |
| `collapsible` | `boolean` | `false` | wrap each row in a collapse, so long arrays stay scannable |
| `rowTitle` | `(index: number) => JSX.Element` | `Item N` | row title drawn in the collapse header |
| `newItem` | `() => unknown` | `{}` | the value a new row starts from |
| `children` | `(row: RepeaterRow) => JSX.Element` | — | rendered per row |
| `class` | `string` | — | merged into the outer stack |

## The row contract

Each row is handed a `RepeaterRow`:

| key | meaning |
| --- | --- |
| `index` | the row's position, reactive because rows shift when one is removed |
| `name` | the row's path in the form, e.g. `items[1]` |
| `Field` | the form's `Field` component — field names are absolute paths, so a row field is `` `${row.name()}.title` `` |
| `value` | the row's value, reactive |
| `remove` | remove this row (disabled below `minItems`) |
| `copy` | insert a deep copy of this row after it |

The row renders its own fields through `row.Field`; `ConfigForm` does this for
every field of a `type: 'repeater'` entry. Bound by hand it looks like this:

```tsx
<Repeater form={app.form} name="items" copyable>
  {(row) => (
    <row.Field name={`${row.name()}.title`}>
      {(field) => (
        <FormControl
          label="Title"
          value={field().state.value as string}
          onInput={(event) =>
            field().handleChange((event.currentTarget as HTMLInputElement).value)
          }
        />
      )}
    </row.Field>
  )}
</Repeater>
```

## Slots & states

`data-slot="repeater"` on the stack, `data-slot="repeater-item"` on each row.
The add control is an `outline` `Button` (its own `data-slot="button"`), and each
row carries a labelled remove (and, when `copyable`, copy) `IconButton`.
`pnpm stories:check` requires the `Default`, `Collapsible` and `Maxed` states.

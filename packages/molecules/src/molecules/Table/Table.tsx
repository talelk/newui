import { cn, tableHeadClass } from '@talelk/newui-atoms/internal'
import type { JSX, ParentComponent } from 'solid-js'

/**
 * The semantic table — `table`/`thead`/`tbody`/`tr`/`th`/`td` as styled
 * compound parts, for when the data is known and rendered directly. Wrap it
 * in `ScrollTable` when it can overflow, and use `DataTable` when the data
 * needs sorting, filtering or selection logic.
 *
 * A plain `Table` renders no interactive affordance of its own: rows are
 * addressable through `data-selected` (set it from your own selection state)
 * and cells align through plain utilities (`text-end` on a numeric column).
 */
export function Table(props: {
  class?: string
  children: JSX.Element
}): JSX.Element {
  return (
    <table
      data-slot="table"
      class={cn(
        'w-full border-collapse text-start text-interface',
        props.class,
      )}
    >
      {props.children}
    </table>
  )
}

/** The shared header treatment, bound to the semantic table. */
export const TableHead: ParentComponent = (props) => (
  <thead data-slot="table-head" class={tableHeadClass}>
    {props.children}
  </thead>
)

/** The table's body. */
export const TableBody: ParentComponent = (props) => (
  <tbody data-slot="table-body">{props.children}</tbody>
)

export interface TableRowProps {
  /** Marks the row as the current selection; rendered via `data-selected`. */
  selected?: boolean
  class?: string
  children: JSX.Element
}

/** A body row: hairline divider, hover surface, optional selection state. */
export function TableRow(props: TableRowProps): JSX.Element {
  return (
    <tr
      data-slot="table-row"
      data-selected={props.selected ? '' : undefined}
      class={cn(
        'border-b border-outline-gray-1 hover:bg-surface-gray-1',
        'data-[selected]:bg-surface-gray-2',
        props.class,
      )}
    >
      {props.children}
    </tr>
  )
}

/** A header cell. `scope="col"` is the accessible default. */
export const TableColumnHeader: ParentComponent<{
  scope?: 'col' | 'row'
  class?: string
}> = (props) => (
  <th
    scope={props.scope ?? 'col'}
    data-slot="table-column-header"
    class={cn('p-3 font-medium', props.class)}
  >
    {props.children}
  </th>
)

/** A body cell. */
export const TableCell: ParentComponent<{ class?: string }> = (props) => (
  <td data-slot="table-cell" class={cn('p-3', props.class)}>
    {props.children}
  </td>
)

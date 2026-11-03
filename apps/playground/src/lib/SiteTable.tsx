import {
  Table,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableRow,
} from '@talelk/newui-molecules'
import { For, type JSX } from 'solid-js'

/**
 * The one documentation table: the molecules `Table` compound behind a
 * head/rows shape, scrollable on narrow viewports. Lazy pages and the
 * markdown renderer use this instead of hand-rolling table chrome.
 */
export function SiteTable(props: {
  head: JSX.Element[]
  rows: JSX.Element[][]
  label: string
}): JSX.Element {
  return (
    <section tabindex="0" aria-label={props.label} class="overflow-x-auto">
      <Table class="min-w-[32rem]">
        <TableHead>
          <TableRow>
            <For each={props.head}>
              {(cell) => <TableColumnHeader>{cell}</TableColumnHeader>}
            </For>
          </TableRow>
        </TableHead>
        <TableBody>
          <For each={props.rows}>
            {(row) => (
              <TableRow>
                <For each={row}>{(cell) => <TableCell>{cell}</TableCell>}</For>
              </TableRow>
            )}
          </For>
        </TableBody>
      </Table>
    </section>
  )
}

import { Badge } from '@newui/atoms'
import {
  ScrollTable,
  Table,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableRow,
} from '@newui/molecules'
import type { JSX } from 'solid-js'
import { For } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

const ROWS = [
  {
    item: 'Consulting',
    category: 'Services',
    amount: '$4,200',
    status: 'Paid',
  },
  {
    item: 'Hosting',
    category: 'Infrastructure',
    amount: '$118',
    status: 'Due',
  },
  { item: 'Design tools', category: 'Software', amount: '$84', status: 'Paid' },
]

export function Demo(): JSX.Element {
  return (
    <ScrollTable label="Invoices table">
      <Table>
        <TableHead>
          <tr>
            <TableColumnHeader>Item</TableColumnHeader>
            <TableColumnHeader>Category</TableColumnHeader>
            <TableColumnHeader class="text-end">Amount</TableColumnHeader>
            <TableColumnHeader>Status</TableColumnHeader>
          </tr>
        </TableHead>
        <TableBody>
          <For each={ROWS}>
            {(row) => (
              <TableRow selected={row.status === 'Due'}>
                <TableCell>{row.item}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell class="text-end tabular-nums">
                  {row.amount}
                </TableCell>
                <TableCell>
                  <Badge theme={row.status === 'Paid' ? 'green' : 'amber'}>
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            )}
          </For>
        </TableBody>
      </Table>
    </ScrollTable>
  )
}

const meta = {
  title: 'Molecules/Data/Table',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

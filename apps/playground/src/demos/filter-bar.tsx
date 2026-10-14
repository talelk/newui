import { FilterBar } from '@newui/blocks'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <FilterBar
      query={{ placeholder: 'Search tickets…', value: '' }}
      selects={[
        {
          label: 'Status',
          value: 'open',
          options: [
            { label: 'Open', value: 'open' },
            { label: 'Pending', value: 'pending' },
            { label: 'Closed', value: 'closed' },
          ],
        },
        {
          label: 'Priority',
          options: [
            { label: 'High', value: 'high' },
            { label: 'Low', value: 'low' },
          ],
        },
      ]}
      tabs={{
        value: 'list',
        options: [
          { label: 'List', value: 'list' },
          { label: 'Board', value: 'board' },
        ],
      }}
    />
  )
}

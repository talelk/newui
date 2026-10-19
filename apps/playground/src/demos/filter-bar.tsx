import { FilterBar } from '@newui/blocks'
import { createMemo, createSignal, type JSX } from 'solid-js'

const TICKETS = [
  { status: 'open', priority: 'high' },
  { status: 'open', priority: 'low' },
  { status: 'pending', priority: 'high' },
  { status: 'closed', priority: 'low' },
]

const LABEL: Record<string, string> = {
  open: 'Open',
  pending: 'Pending',
  closed: 'Closed',
  high: 'High',
  low: 'Low',
}

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  const [query, setQuery] = createSignal('')
  const [status, setStatus] = createSignal('open')
  const [priority, setPriority] = createSignal('')
  const [view, setView] = createSignal('list')

  const results = createMemo(
    () =>
      TICKETS.filter(
        (ticket) =>
          (!status() || ticket.status === status()) &&
          (!priority() || ticket.priority === priority()),
      ).length,
  )

  const clearAll = () => {
    setQuery('')
    setStatus('')
    setPriority('')
  }

  return (
    <FilterBar
      query={{
        placeholder: 'Search tickets…',
        value: query(),
        onInput: setQuery,
      }}
      selects={[
        {
          label: 'Status',
          value: status(),
          onValueChange: setStatus,
          options: [
            { label: 'Open', value: 'open' },
            { label: 'Pending', value: 'pending' },
            { label: 'Closed', value: 'closed' },
          ],
        },
        {
          label: 'Priority',
          value: priority(),
          onValueChange: setPriority,
          options: [
            { label: 'High', value: 'high' },
            { label: 'Low', value: 'low' },
          ],
        },
      ]}
      tabs={{
        value: view(),
        onValueChange: setView,
        options: [
          { label: 'List', value: 'list' },
          { label: 'Board', value: 'board' },
        ],
      }}
      chips={[
        ...(status()
          ? [
              {
                label: `Status: ${LABEL[status()] ?? status()}`,
                onRemove: () => setStatus(''),
              },
            ]
          : []),
        ...(priority()
          ? [
              {
                label: `Priority: ${LABEL[priority()] ?? priority()}`,
                onRemove: () => setPriority(''),
              },
            ]
          : []),
      ]}
      resultCount={results()}
      onClearAll={clearAll}
    />
  )
}

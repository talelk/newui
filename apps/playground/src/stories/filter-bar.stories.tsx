import { FilterBar } from '@talelk/newui-organisms'
import { createMemo, createSignal, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

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

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
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

const meta = {
  title: 'Organisms/FilterBar',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

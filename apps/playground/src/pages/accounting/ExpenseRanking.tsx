import { usd as currency } from '@talelk/newui-data'
import { For, type JSX } from 'solid-js'

/**
 * The expense mix as a ranked list, not a chart.
 *
 * Three categories in a full-height chart card left most of the card empty and
 * ranked the largest category last. A ranked list uses the height, puts the
 * amount on the same baseline as the name, and makes the largest category the
 * visual anchor.
 */
export default function ExpenseRanking(props: {
  data: { name: string; total: number }[]
}): JSX.Element {
  const rows = () => [...props.data].sort((a, b) => b.total - a.total)
  const total = () => rows().reduce((sum, row) => sum + row.total, 0)
  const max = () => rows()[0]?.total ?? 0
  return (
    <section
      aria-label="Expense breakdown by category"
      class="flex h-full flex-col rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad"
    >
      <header class="flex flex-col gap-1">
        <h3 class="text-section text-ink-gray-9">Where your money goes</h3>
        <p class="text-caption text-ink-gray-7">
          Posted expenses in the selected period
        </p>
      </header>
      <ol class="mt-4 flex flex-1 flex-col justify-center gap-4">
        <For each={rows()}>
          {(row, index) => {
            const share = () =>
              total() ? Math.round((row.total / total()) * 100) : 0
            return (
              <li class="flex flex-col gap-1">
                <div class="flex items-baseline justify-between gap-3">
                  <span class="min-w-0 text-interface text-ink-gray-8 [overflow-wrap:anywhere]">
                    {row.name}
                  </span>
                  <span class="shrink-0 text-interface font-medium tabular-nums text-ink-gray-9">
                    {currency(row.total)}
                  </span>
                </div>
                <div
                  class="h-1 overflow-hidden rounded-full bg-surface-gray-2"
                  aria-hidden="true"
                >
                  <div
                    class="h-full rounded-full"
                    classList={{
                      'bg-surface-blue-6': index() === 0,
                      'bg-surface-gray-4': index() !== 0,
                    }}
                    style={{
                      width: `${max() ? (row.total / max()) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span class="text-caption tabular-nums text-ink-gray-7">
                  {share()}% of expenses
                </span>
              </li>
            )
          }}
        </For>
      </ol>
      <div class="mt-4 flex items-baseline justify-between gap-3 border-t border-outline-gray-1 pt-3">
        <span class="text-caption text-ink-gray-7">Total</span>
        <span class="text-interface font-semibold tabular-nums text-ink-gray-9">
          {currency(total())}
        </span>
      </div>
    </section>
  )
}

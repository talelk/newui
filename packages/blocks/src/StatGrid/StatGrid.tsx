import { cn, Icon, type IconProp } from '@newui/ui'
import { For, type JSX, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export interface Stat {
  label: string
  value: JSX.Element
  /** One line of context: the comparison, the period, the owner. */
  hint?: JSX.Element
  /** Signed change, rendered in a tone. `+5.1%` / `-0.4 pts`. */
  delta?: { value: string; direction: 'up' | 'down' | 'flat'; good?: boolean }
  icon?: IconProp
  onClick?: () => void
}

export interface StatGridProps {
  stats: Stat[]
  /** Columns at the widest breakpoint. Defaults to the number of stats, capped. */
  columns?: 2 | 3 | 4
  class?: string
}

/**
 * A row of KPI cards.
 *
 * The delta is deliberately not coloured by direction but by *whether it is
 * good*: churn going down is good, revenue going down is not, and a grid that
 * paints every minus red gets that wrong on half the dashboards it is used on.
 * `good` defaults to the intuitive reading and can be overridden per stat.
 */
/**
 * Literal classes, not a template string: Tailwind scans for whole class names,
 * so `sm:grid-cols-${n}` would compile to nothing and `css:check` would be right
 * to fail it.
 */
const COLUMNS: Record<2 | 3 | 4, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
}

export function StatGrid(props: StatGridProps): JSX.Element {
  const columns = (): 2 | 3 | 4 =>
    props.columns ?? (Math.min(4, Math.max(2, props.stats.length)) as 2 | 3 | 4)

  return (
    <div
      data-slot="stat-grid"
      class={`grid gap-3 ${COLUMNS[columns()]} ${props.class ?? ''}`}
    >
      <For each={props.stats}>
        {(stat) => (
          // A stat that navigates is a button, not a div with a click handler:
          // it has to be reachable by keyboard and announced as interactive.
          <Dynamic
            component={stat.onClick ? 'button' : 'div'}
            {...(stat.onClick ? { type: 'button' as const } : {})}
            data-slot="stat"
            onClick={stat.onClick}
            class={cn(
              'flex flex-col gap-1 rounded-6 border border-outline-gray-1 bg-surface-elevation-1 p-4 text-start',
              stat.onClick &&
                'cursor-pointer transition-colors hover:border-outline-gray-3 hover:bg-surface-gray-1 focus-visible:focus-ring',
            )}
          >
            <div class="flex items-center gap-2">
              <Show when={stat.icon}>
                {(icon) => (
                  <Icon icon={icon()} class="size-4 text-ink-gray-5" />
                )}
              </Show>
              <span class="text-sm text-ink-gray-6">{stat.label}</span>
            </div>
            <span class="text-2xl-semibold text-ink-gray-9">{stat.value}</span>
            <div class="flex items-center gap-2">
              <Show when={stat.delta}>
                {(delta) => (
                  <span
                    class="inline-flex items-center gap-0.5 text-xs-medium"
                    classList={{
                      'text-ink-green-7': isGood(delta()),
                      'text-ink-red-7': !isGood(delta()),
                      'text-ink-gray-5': delta().direction === 'flat',
                    }}
                  >
                    <Icon
                      icon={
                        delta().direction === 'up'
                          ? 'lucide-arrow-up'
                          : delta().direction === 'down'
                            ? 'lucide-arrow-down'
                            : 'lucide-minus'
                      }
                      class="size-3"
                    />
                    {delta().value}
                  </span>
                )}
              </Show>
              <Show when={stat.hint}>
                <span class="truncate text-xs text-ink-gray-5">
                  {stat.hint}
                </span>
              </Show>
            </div>
          </Dynamic>
        )}
      </For>
    </div>
  )
}

/** A flat delta is neutral; otherwise the direction is good unless overridden. */
function isGood(delta: NonNullable<Stat['delta']>): boolean {
  if (delta.good !== undefined) return delta.good
  return delta.direction !== 'down'
}

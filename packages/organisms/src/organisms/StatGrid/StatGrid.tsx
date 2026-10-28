import { cn, Icon, type IconProp, Skeleton } from '@talelk/newui-atoms'
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
  /** Tighter cards without the icon tile; for table-led screens. */
  compact?: boolean
  /** Replaces the cards with the shared skeleton geometry. */
  loading?: boolean
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
  2: 'min-[360px]:grid-cols-2',
  3: 'min-[360px]:grid-cols-2 xl:grid-cols-3',
  4: 'min-[360px]:grid-cols-2 xl:grid-cols-4',
}

/** Compact table-led screens earn a four-up row on tablets. */
const COMPACT_COLUMNS: Record<2 | 3 | 4, string> = {
  2: 'min-[360px]:grid-cols-2',
  3: 'min-[360px]:grid-cols-2 md:grid-cols-3',
  4: 'min-[360px]:grid-cols-2 md:grid-cols-4',
}

export function StatGrid(props: StatGridProps): JSX.Element {
  const columns = (): 2 | 3 | 4 =>
    props.columns ?? (Math.min(4, Math.max(2, props.stats.length)) as 2 | 3 | 4)

  return (
    <Show
      when={!props.loading}
      fallback={
        <div
          data-slot="stat-grid"
          data-loading
          class={`grid gap-card-gap ${props.compact ? COMPACT_COLUMNS[columns()] : COLUMNS[columns()]} ${props.class ?? ''}`}
        >
          <For each={Array.from({ length: columns() })}>
            {() => (
              <div
                data-slot="stat"
                aria-hidden="true"
                class={cn(
                  'flex flex-col rounded-card border border-outline-gray-1 bg-surface-elevation-1',
                  props.compact ? 'gap-1 p-2.5' : 'gap-control-gap p-card-pad',
                )}
              >
                <Skeleton lines={1} class="h-5 w-24" />
                <Skeleton lines={1} class="h-8 w-20" />
                <Skeleton lines={1} class="h-4 w-28" />
              </div>
            )}
          </For>
        </div>
      }
    >
      <div
        data-slot="stat-grid"
        class={`grid gap-card-gap ${props.compact ? COMPACT_COLUMNS[columns()] : COLUMNS[columns()]} ${props.class ?? ''}`}
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
                'flex flex-col rounded-card border border-outline-gray-1 bg-surface-elevation-1 text-start',
                props.compact ? 'gap-1 p-2.5' : 'gap-control-gap p-card-pad',
                stat.onClick &&
                  'cursor-pointer transition-[border-color,box-shadow] hover:border-outline-gray-3 hover:shadow-sm focus-visible:focus-ring motion-reduce:transition-none',
              )}
            >
              <div class="flex flex-wrap items-start gap-2">
                <Show when={props.compact ? undefined : stat.icon}>
                  {(icon) => (
                    <span class="hidden size-8 shrink-0 place-items-center rounded-4 bg-surface-gray-2 sm:grid">
                      <Icon icon={icon()} class="size-4 text-ink-gray-7" />
                    </span>
                  )}
                </Show>
                <span class="min-w-0 flex-1 basis-20 break-words text-sm-medium text-ink-gray-7">
                  {stat.label}
                </span>
                <Show when={stat.delta}>
                  {(delta) => (
                    <span
                      class="ms-auto inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs-medium tabular-nums"
                      classList={{
                        'bg-surface-green-2 text-ink-green-8':
                          delta().direction !== 'flat' && isGood(delta()),
                        'bg-surface-red-2 text-ink-red-8':
                          delta().direction !== 'flat' && !isGood(delta()),
                        'bg-surface-gray-2 text-ink-gray-7':
                          delta().direction === 'flat',
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
              </div>
              <span class="text-metric tabular-nums [overflow-wrap:anywhere] text-ink-gray-9">
                {stat.value}
              </span>
              <Show when={stat.hint}>
                <span class="text-xs [overflow-wrap:anywhere] text-ink-gray-7">
                  {stat.hint}
                </span>
              </Show>
            </Dynamic>
          )}
        </For>
      </div>
    </Show>
  )
}

/** A flat delta is neutral; otherwise the direction is good unless overridden. */
function isGood(delta: NonNullable<Stat['delta']>): boolean {
  if (delta.good !== undefined) return delta.good
  return delta.direction !== 'down'
}

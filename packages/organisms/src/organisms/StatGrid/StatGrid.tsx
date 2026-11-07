import { cn, Icon, type IconProp, Skeleton } from '@talelk/newui-atoms'
import { card } from '@talelk/newui-molecules'
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
 * A row of KPIs, read as one instrument strip: a single sheet whose cells are
 * divided by hairline rules, not a row of separate cards. The rules are the
 * sheet's outline showing through a 1px grid gap, so they stay correct at any
 * column count and wrap.
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
  3: 'min-[360px]:grid-cols-2 lg:grid-cols-3',
  4: 'min-[360px]:grid-cols-2 lg:grid-cols-4',
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
          class={cn(
            STRIP,
            props.compact ? COMPACT_COLUMNS[columns()] : COLUMNS[columns()],
            props.class,
          )}
        >
          <For each={Array.from({ length: columns() })}>
            {() => (
              <div
                data-slot="stat"
                aria-hidden="true"
                class={cn(CELL, props.compact ? 'px-3 py-2' : 'px-4 py-3')}
              >
                <Skeleton lines={1} class="h-4 w-24" />
                <Skeleton lines={1} class="h-7 w-20" />
                <Skeleton lines={1} class="h-3.5 w-28" />
              </div>
            )}
          </For>
        </div>
      }
    >
      <div
        data-slot="stat-grid"
        class={cn(
          STRIP,
          props.compact ? COMPACT_COLUMNS[columns()] : COLUMNS[columns()],
          props.class,
        )}
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
                CELL,
                'text-start',
                props.compact ? 'px-3 py-2' : 'px-4 py-3',
                stat.onClick &&
                  'cursor-pointer transition-colors hover:bg-surface-gray-1 focus-visible:focus-ring focus-visible:-outline-offset-2 motion-reduce:transition-none',
              )}
            >
              <div class="flex flex-wrap items-start gap-2">
                <Show when={props.compact ? undefined : stat.icon}>
                  {(icon) => (
                    <Icon
                      icon={icon()}
                      class="mt-px hidden size-3.5 shrink-0 text-ink-gray-6 sm:block"
                    />
                  )}
                </Show>
                <span class="min-w-0 flex-1 basis-20 break-words text-sm text-ink-gray-7">
                  {stat.label}
                </span>
                <Show when={stat.delta}>
                  {(delta) => (
                    <span
                      class="ms-auto inline-flex shrink-0 items-center gap-0.5 text-xs-medium tabular-nums"
                      classList={{
                        'text-ink-green-8':
                          delta().direction !== 'flat' && isGood(delta()),
                        'text-ink-red-8':
                          delta().direction !== 'flat' && !isGood(delta()),
                        'text-ink-gray-7': delta().direction === 'flat',
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
              <span
                class={cn(
                  'tabular-nums [overflow-wrap:anywhere] text-ink-gray-9',
                  props.compact ? 'text-2xl-semibold' : 'text-metric',
                )}
              >
                {stat.value}
              </span>
              <Show when={stat.hint}>
                <span class="text-xs [overflow-wrap:anywhere] text-ink-gray-6">
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

/**
 * The strip: one sheet; its outline shows through the 1px gap as the rules
 * between cells. `overflow-hidden` clips the cells to the sheet's radius.
 */
const STRIP = cn(
  card({ padding: 'none' }),
  'grid gap-px overflow-hidden bg-outline-gray-1',
)

/** One cell of the strip, painted back onto the sheet colour. */
const CELL = 'flex min-w-0 flex-col gap-0.5 bg-surface-elevation-1'

/** A flat delta is neutral; otherwise the direction is good unless overridden. */
function isGood(delta: NonNullable<Stat['delta']>): boolean {
  if (delta.good !== undefined) return delta.good
  return delta.direction !== 'down'
}

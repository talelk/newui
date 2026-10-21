import { Icon, type IconProp } from '@newui/atoms'
import { cn } from '@newui/atoms/internal'
import { For, type JSX, Show, splitProps } from 'solid-js'

export type TimelineTone = 'gray' | 'blue' | 'green' | 'amber' | 'red'

const TONE: Record<TimelineTone, string> = {
  gray: 'bg-surface-gray-2 text-ink-gray-6',
  blue: 'bg-surface-blue-2 text-ink-blue-8',
  green: 'bg-surface-green-2 text-ink-green-8',
  amber: 'bg-surface-amber-2 text-ink-amber-8',
  red: 'bg-surface-red-2 text-ink-red-8',
}

export interface TimelineItem {
  /** Stable key; falls back to the index. */
  id?: string
  title: JSX.Element
  description?: JSX.Element
  /** Muted, trailing text — a relative time, usually. */
  timestamp?: JSX.Element
  /** A `lucide-*` string or a component (P11). Defaults to a plain dot. */
  icon?: IconProp
  tone?: TimelineTone
}

export interface TimelineProps {
  items: TimelineItem[]
  class?: string
}

/**
 * A vertical run of events, oldest first, with the rail drawn *between* the
 * markers rather than through them.
 *
 * That detail is the whole reason this exists: a single line behind a row of
 * dots looks right only until the markers have different heights, and the first
 * and last markers must not trail a stub above or below. So each row owns the
 * half-lines above and below its marker and hides the ones that would dangle at
 * the ends — no measurement, no `:first-child` arithmetic leaking into callers.
 */
export function Timeline(props: TimelineProps): JSX.Element {
  const [local] = splitProps(props, ['items', 'class'])

  return (
    <ol
      data-slot="timeline"
      class={cn('flex flex-col', local.class)}
      // The list is a sequence of events, so the marker is decoration and the
      // text carries the meaning — `aria-hidden` on every rail segment.
    >
      <For each={local.items}>
        {(item, index) => {
          const tone = () => item.tone ?? 'gray'
          const isFirst = () => index() === 0
          const isLast = () => index() === local.items.length - 1

          return (
            <li
              data-slot="timeline-item"
              class="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3"
            >
              <div class="relative flex justify-center" aria-hidden="true">
                {/* The rail runs in two halves from the marker's centre — 2px
                    of offset plus half of the 24px marker. A single full-height
                    line would trail a stub above the first marker and below the
                    last one. */}
                <Show when={!isFirst()}>
                  <span class="absolute top-0 left-1/2 h-3.5 w-px -translate-x-1/2 bg-outline-gray-2" />
                </Show>
                <Show when={!isLast()}>
                  <span class="absolute top-3.5 bottom-0 left-1/2 w-px -translate-x-1/2 bg-outline-gray-2" />
                </Show>
                <span
                  data-slot="timeline-marker"
                  class={cn(
                    'relative z-raised mt-0.5 grid size-6 shrink-0 place-items-center rounded-full',
                    TONE[tone()],
                  )}
                >
                  <Show
                    when={item.icon}
                    fallback={<span class="size-1.5 rounded-full bg-current" />}
                  >
                    {(icon) => <Icon icon={icon()} class="size-3" />}
                  </Show>
                </span>
              </div>

              <div class={cn('min-w-0', isLast() ? 'pb-0' : 'pb-6')}>
                <div class="flex min-w-0 items-baseline justify-between gap-3">
                  <p class="truncate text-base-medium text-ink-gray-8">
                    {item.title}
                  </p>
                  <Show when={item.timestamp}>
                    <span class="shrink-0 text-xs whitespace-nowrap text-ink-gray-6">
                      {item.timestamp}
                    </span>
                  </Show>
                </div>
                <Show when={item.description}>
                  <p class="mt-0.5 text-base text-ink-gray-6">
                    {item.description}
                  </p>
                </Show>
              </div>
            </li>
          )
        }}
      </For>
    </ol>
  )
}

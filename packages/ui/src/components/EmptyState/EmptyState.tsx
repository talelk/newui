import { type JSX, Show, splitProps } from 'solid-js'
import { cn } from '../../lib/tv'
import { Icon, type IconProp } from '../Icon'

export type EmptyStateSize = 'sm' | 'md' | 'lg'

const SIZE: Record<EmptyStateSize, { box: string; icon: string; pad: string }> =
  {
    sm: { box: 'gap-2 py-6', icon: 'size-5', pad: 'p-3' },
    md: { box: 'gap-3 py-10', icon: 'size-5', pad: 'p-4' },
    lg: { box: 'gap-4 py-16', icon: 'size-6', pad: 'p-5' },
  }

export interface EmptyStateProps {
  /** A `lucide-*` string or a component (P11). */
  icon?: IconProp
  title: JSX.Element
  description?: JSX.Element
  /** The one thing to do from here — a Button, usually. */
  action?: JSX.Element
  /** A second, quieter escape hatch. */
  secondaryAction?: JSX.Element
  size?: EmptyStateSize
  /** Draw a dashed frame, for a drop zone or a blank panel. */
  bordered?: boolean
  class?: string
}

/**
 * What a list, a table or a panel shows when it has nothing to show.
 *
 * Worth a component rather than three divs per screen, because an empty state is
 * where a product actually explains itself: the default pattern (icon, one line
 * of what is missing, one action) is a decision about tone, and every team
 * re-decides it badly. `title` is required and `description` is not, so the
 * common case stays one line.
 *
 * The icon sits in a tinted tile behind the content — it reads as a placeholder
 * slot rather than a broken image.
 */
export function EmptyState(props: EmptyStateProps): JSX.Element {
  const [local] = splitProps(props, [
    'icon',
    'title',
    'description',
    'action',
    'secondaryAction',
    'size',
    'bordered',
    'class',
  ])

  const size = () => SIZE[local.size ?? 'md']

  return (
    <div
      data-slot="empty-state"
      data-size={local.size ?? 'md'}
      class={cn(
        'flex flex-col items-center justify-center px-6 text-center',
        size().box,
        local.bordered &&
          'rounded-6 border border-dashed border-outline-gray-2',
        local.class,
      )}
    >
      <Show when={local.icon}>
        {(icon) => (
          <div
            data-slot="empty-state-icon"
            class={cn(
              'grid place-items-center rounded-5 bg-surface-gray-2 text-ink-gray-6',
              size().pad,
            )}
          >
            <Icon icon={icon()} class={size().icon} />
          </div>
        )}
      </Show>

      <div class="flex max-w-md flex-col gap-1">
        <p class="text-base-medium text-ink-gray-8">{local.title}</p>
        <Show when={local.description}>
          <p class="text-base text-ink-gray-6">{local.description}</p>
        </Show>
      </div>

      <Show when={local.action || local.secondaryAction}>
        <div class="mt-2 flex flex-wrap items-center justify-center gap-2">
          {local.action}
          {local.secondaryAction}
        </div>
      </Show>
    </div>
  )
}

import type { InputSize } from '@talelk/newui-atoms'
import { cn, tv } from '@talelk/newui-atoms/internal'
import { type Component, type JSX, Show, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export type NotificationItemSize = InputSize

export const notificationItem = tv({
  base: 'flex w-full min-w-0 items-start gap-3 rounded-4 border border-transparent p-2 text-start transition-colors',
  variants: {
    size: {
      xs: 'min-h-10',
      sm: 'min-h-12',
      md: 'min-h-14',
      lg: 'min-h-16',
    },
    state: {
      inactive: 'hover:bg-surface-gray-2',
      active: 'border-outline-blue-6 bg-surface-blue-2',
    },
    disabled: {
      true: 'cursor-not-allowed text-ink-gray-6 [&_span]:text-ink-gray-6',
      false: '',
    },
  },
  defaultVariants: { size: 'sm', state: 'inactive', disabled: false },
})

export interface NotificationItemProps
  extends Omit<JSX.HTMLAttributes<HTMLElement>, 'title'> {
  /** Shared row density preset. */
  size?: NotificationItemSize
  /** Element tag or component for the row root. Defaults to `div`. */
  as?: string | Component<Record<string, unknown>>
  /** What happened, in one line; bolded while the notification is unread. */
  title: JSX.Element
  /** The affected record or a short body preview. */
  description?: JSX.Element
  /** Lucide icon name for the event tile (`lucide-bell` by default). */
  icon?: string
  /** When it happened, rendered in tabular figures. */
  time?: JSX.Element
  /** Flags the notification as not yet read: heavier text and an unread dot. */
  unread?: boolean
  /** Marks the row as the current target, e.g. in a split view. */
  selected?: boolean
  /**
   * Mutes the row. It does not stop clicks or set the native `disabled`
   * attribute, so skip the action in your own handler.
   */
  disabled?: boolean
  /** Native `type` when the row renders as a `button` (`as="button"`). */
  type?: string
  /** Destination when the row renders as an anchor (`as="a"`). */
  href?: string
  /** Trailing controls (mark read, snooze); stay visible, never hover-only. */
  suffix?: JSX.Element
  /** Merged into the root. */
  class?: string
}

/**
 * One notification in a feed or menu: an event icon, what happened, the
 * affected record and its time, with the unread state carried by text weight
 * and a dot rather than color alone. A notification menu stacks the rows as
 * plain siblings inside its own popover or panel.
 */
export function NotificationItem(props: NotificationItemProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'as',
    'size',
    'title',
    'description',
    'icon',
    'time',
    'unread',
    'selected',
    'disabled',
    'type',
    'href',
    'suffix',
    'class',
  ])
  return (
    <Dynamic
      component={local.as ?? 'div'}
      type={local.as === 'button' ? (local.type ?? 'button') : undefined}
      href={local.as === 'a' ? local.href : undefined}
      data-slot="notification-item"
      data-state={local.selected ? 'active' : 'inactive'}
      data-size={local.size}
      data-unread={local.unread ? 'true' : undefined}
      data-selected={local.selected ? 'true' : undefined}
      data-disabled={local.disabled ? 'true' : undefined}
      aria-current={local.selected ? 'true' : undefined}
      class={cn(
        notificationItem({
          size: local.size,
          state: local.selected ? 'active' : 'inactive',
          disabled: local.disabled ?? false,
        }),
        local.class,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        class="grid size-8 shrink-0 place-items-center rounded-3 border border-outline-gray-1 bg-surface-gray-2 text-ink-gray-7"
      >
        <span class={`${local.icon ?? 'lucide-bell'} size-4`} />
      </span>
      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          class={cn(
            'truncate text-base text-ink-gray-8',
            local.unread && 'font-semibold text-ink-gray-9',
          )}
          data-slot="notification-item-title"
        >
          {local.title}
        </span>
        <Show when={local.description}>
          <span class="truncate text-caption text-ink-gray-7">
            {local.description}
          </span>
        </Show>
      </span>
      <Show when={local.time || local.suffix || local.unread}>
        <span class="flex min-h-6 shrink-0 items-center gap-1 self-center">
          <Show when={local.time}>
            <span
              class={cn(
                'text-caption tabular-nums text-ink-gray-6',
                local.unread && 'text-ink-gray-8',
              )}
            >
              {local.time}
            </span>
          </Show>
          <Show when={local.unread}>
            <span
              aria-hidden="true"
              class="size-2 rounded-full bg-surface-blue-8"
              title="Unread"
            />
          </Show>
          {local.suffix}
        </span>
      </Show>
    </Dynamic>
  )
}

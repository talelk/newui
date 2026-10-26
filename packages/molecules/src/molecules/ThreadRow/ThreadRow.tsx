import type { InputSize } from '@talelk/newui-atoms'
import { cn, tv } from '@talelk/newui-atoms/internal'
import { type Component, type JSX, Show, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export type ThreadRowSize = InputSize

export const threadRow = tv({
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

export interface ThreadRowProps
  extends Omit<JSX.HTMLAttributes<HTMLElement>, 'title'> {
  /** Shared row density preset. */
  size?: ThreadRowSize
  /** Element tag or component for the row root. Defaults to `div`. */
  as?: string | Component<Record<string, unknown>>
  /** The thread's subject line; bolded while the thread is unread. */
  title: JSX.Element
  /** A one-line preview of the latest reply; the row truncates it. */
  snippet?: JSX.Element
  /** Reply count, participants or age, in one quiet line. */
  meta?: JSX.Element
  /** Received-or-updated time, rendered in tabular figures. */
  time?: JSX.Element
  /** Leading avatar, usually the community or author. */
  avatar?: JSX.Element
  /** Flags the thread as not yet read: heavier text and an unread dot. */
  unread?: boolean
  /** Marks the row as the open thread. */
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
  /** Trailing controls (follow, mark read); stay visible, never hover-only. */
  suffix?: JSX.Element
  /** Merged into the root. */
  class?: string
}

/**
 * One discussion thread in a list: subject, a one-line preview, and its meta
 * — replies and age — with the unread state carried by text weight and a dot
 * rather than color alone. A space's thread list stacks the rows as plain
 * siblings inside its own scroll container.
 */
export function ThreadRow(props: ThreadRowProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'as',
    'size',
    'title',
    'snippet',
    'meta',
    'time',
    'avatar',
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
      data-slot="thread-row"
      data-state={local.selected ? 'active' : 'inactive'}
      data-size={local.size}
      data-unread={local.unread ? 'true' : undefined}
      data-selected={local.selected ? 'true' : undefined}
      data-disabled={local.disabled ? 'true' : undefined}
      aria-current={local.selected ? 'true' : undefined}
      class={cn(
        threadRow({
          size: local.size,
          state: local.selected ? 'active' : 'inactive',
          disabled: local.disabled ?? false,
        }),
        local.class,
      )}
      {...rest}
    >
      <Show when={local.avatar}>
        <span class="mt-0.5 shrink-0">{local.avatar}</span>
      </Show>
      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="flex min-w-0 items-baseline justify-between gap-2">
          <span
            class={cn(
              'min-w-0 truncate text-base text-ink-gray-8',
              local.unread && 'font-semibold text-ink-gray-9',
            )}
            data-slot="thread-row-title"
          >
            {local.title}
          </span>
          <Show when={local.time}>
            <span
              class={cn(
                'shrink-0 text-caption tabular-nums text-ink-gray-6',
                local.unread && 'text-ink-gray-8',
              )}
            >
              {local.time}
            </span>
          </Show>
        </span>
        <Show when={local.snippet}>
          <span class="truncate text-caption text-ink-gray-7">
            {local.snippet}
          </span>
        </Show>
        <Show when={local.meta}>
          <span class="truncate text-caption text-ink-gray-6">
            {local.meta}
          </span>
        </Show>
      </span>
      <Show when={local.suffix || local.unread}>
        <span class="flex min-h-6 shrink-0 items-center gap-1 self-center">
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

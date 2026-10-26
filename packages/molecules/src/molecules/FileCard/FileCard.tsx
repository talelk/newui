import type { InputSize } from '@talelk/newui-atoms'
import { cn, tv } from '@talelk/newui-atoms/internal'
import { type Component, type JSX, Show, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export type FileCardSize = InputSize

export const fileCard = tv({
  base: 'flex w-full min-w-0 items-center gap-3 rounded-card border border-transparent p-2 text-start transition-colors',
  variants: {
    size: {
      xs: 'min-h-10',
      sm: 'min-h-12',
      md: 'min-h-14',
      lg: 'min-h-16',
    },
    state: {
      inactive:
        'border-outline-gray-1 bg-surface-elevation-1 hover:bg-surface-gray-2',
      active: 'border-outline-blue-6 bg-surface-blue-2',
    },
    disabled: {
      true: 'cursor-not-allowed text-ink-gray-6 [&_span]:text-ink-gray-6',
      false: '',
    },
  },
  defaultVariants: { size: 'sm', state: 'inactive', disabled: false },
})

export interface FileCardProps
  extends Omit<JSX.HTMLAttributes<HTMLElement>, 'title'> {
  /** Shared row density preset. */
  size?: FileCardSize
  /** Element tag or component for the card root. Defaults to `div`. */
  as?: string | Component<Record<string, unknown>>
  /** The file's name; the card truncates it to one line. */
  name: JSX.Element
  /** Owner, size and age in one quiet line. */
  meta?: JSX.Element
  /** Lucide icon name for the file type tile (`lucide-file` by default). */
  icon?: string
  /** A badge such as `Shared`, rendered after the meta line. */
  badge?: JSX.Element
  /** Marks the card as the current selection. */
  selected?: boolean
  /**
   * Mutes the card. It does not stop clicks or set the native `disabled`
   * attribute, so skip the action in your own handler.
   */
  disabled?: boolean
  /** Native `type` when the card renders as a `button` (`as="button"`). */
  type?: string
  /** Destination when the card renders as an anchor (`as="a"`). */
  href?: string
  /** App-owned trailing controls (star, delete). Siblings of the open action. */
  suffix?: JSX.Element
  /** Merged into the root. */
  class?: string
}

/**
 * One file as a tile: a type icon, a name, a meta line and room for the app's
 * own actions. A file grid is `<FileCard>` siblings inside a `grid`; the card
 * itself owns no layout, no selection state store and no menus.
 */
export function FileCard(props: FileCardProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'as',
    'size',
    'name',
    'meta',
    'icon',
    'badge',
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
      data-slot="file-card"
      data-state={local.selected ? 'active' : 'inactive'}
      data-size={local.size}
      data-selected={local.selected ? 'true' : undefined}
      data-disabled={local.disabled ? 'true' : undefined}
      aria-current={local.selected ? 'true' : undefined}
      class={cn(
        fileCard({
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
        class="grid size-9 shrink-0 place-items-center rounded-3 border border-outline-gray-1 bg-surface-gray-2 text-ink-gray-7"
      >
        <span class={`${local.icon ?? 'lucide-file'} size-4`} />
      </span>
      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="truncate text-base-medium text-ink-gray-9">
          {local.name}
        </span>
        <Show when={local.meta ?? local.badge}>
          <span class="flex min-w-0 items-center gap-2">
            <Show when={local.meta}>
              <span class="min-w-0 truncate text-caption text-ink-gray-7">
                {local.meta}
              </span>
            </Show>
            {local.badge}
          </span>
        </Show>
      </span>
      <Show when={local.suffix}>
        <span class="flex shrink-0 items-center gap-1">{local.suffix}</span>
      </Show>
    </Dynamic>
  )
}

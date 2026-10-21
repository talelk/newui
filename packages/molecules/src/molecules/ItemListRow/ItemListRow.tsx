import type { InputSize } from '@newui/atoms'
import { cn, tv } from '@newui/atoms/internal'
import { type Component, type JSX, Show, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

/**
 * Row density scale. A selection row has to line up with the input trigger
 * above it, so this is `InputSize` under the row's own name — 24/28/32/40px —
 * and the row implements all four.
 */
export type ItemListSize = InputSize

export const itemListRow = tv({
  base: 'flex w-full items-center gap-2 rounded-4 transition-colors',
  variants: {
    size: {
      xs: 'min-h-6 px-1.5 py-1 text-xs',
      sm: 'min-h-7 px-2 py-1.5 text-base',
      md: 'min-h-8 px-2.5 py-1.5 text-base',
      lg: 'min-h-10 px-3 py-2 text-lg',
    },
    state: {
      inactive: 'text-ink-gray-7',
      active: 'bg-surface-gray-3 text-ink-gray-8',
    },
    disabled: {
      true: 'cursor-not-allowed text-ink-gray-4',
      false: '',
    },
  },
  defaultVariants: { size: 'sm', state: 'inactive', disabled: false },
})

export interface ItemListRowProps
  extends Omit<JSX.HTMLAttributes<HTMLElement>, 'prefix' | 'size'> {
  /** Element tag or component used for the row wrapper. Defaults to `div`. */
  as?: string | Component<Record<string, unknown>>
  /** Shared row density preset. */
  size?: ItemListSize
  /** Native `type` when the row renders as a `button` (`as="button"`). */
  type?: string
  /** Destination when the row renders as an anchor (`as="a"`). */
  href?: string
  /** Highlights the row as the current active target. */
  active?: boolean
  /** Highlights the row as selected. */
  selected?: boolean
  /**
   * Mutes the row. It does not stop clicks or set the native `disabled`
   * attribute, so skip the action in your own handler.
   */
  disabled?: boolean
  /** Leading adornment. */
  prefix?: JSX.Element
  /** Replaces the default content when both are passed (`#label` slot). */
  label?: JSX.Element
  /** Trailing adornment. */
  suffix?: JSX.Element
  /** Merged into the root. */
  class?: string
  /** The default label content. */
  children?: JSX.Element
}

/**
 * A single row of a menu or list: a prefix, a label and a suffix. It is the row
 * `Dropdown`, `Select`, `Combobox` and `MultiSelect` render, so it is the
 * building block for a custom menu that matches them.
 *
 * The row sets no role. Add the roles a menu needs — `role="option"` and
 * `aria-selected` inside a `role="listbox"` container — through the root's
 * attribute fallthrough.
 */
export function ItemListRow(props: ItemListRowProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'as',
    'size',
    'active',
    'selected',
    'disabled',
    'prefix',
    'label',
    'suffix',
    'class',
    'children',
  ])

  const emphasized = () => Boolean(local.active) || Boolean(local.selected)

  return (
    <Dynamic
      component={local.as ?? 'div'}
      {...rest}
      data-slot="item-list-row"
      data-size={local.size ?? 'sm'}
      data-state={emphasized() ? 'active' : 'inactive'}
      data-disabled={local.disabled ? '' : undefined}
      class={cn(
        itemListRow({
          size: local.size,
          state: emphasized() ? 'active' : 'inactive',
          disabled: Boolean(local.disabled),
        }),
        local.class,
      )}
    >
      <Show when={local.prefix}>
        <div
          data-slot="item-prefix"
          class="flex shrink-0 items-center justify-center"
        >
          {local.prefix}
        </div>
      </Show>
      <div data-slot="item-label" class="min-w-0 flex-1 leading-tighter">
        {local.label ?? local.children}
      </div>
      <Show when={local.suffix}>
        <div
          data-slot="item-suffix"
          class="flex shrink-0 items-center justify-center"
        >
          {local.suffix}
        </div>
      </Show>
    </Dynamic>
  )
}

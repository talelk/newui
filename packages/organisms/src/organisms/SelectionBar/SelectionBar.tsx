import { Button, cn, type IconProp } from '@talelk/newui-atoms'
import { type JSX, Show } from 'solid-js'

export interface SelectionPrimaryAction {
  label: string
  onClick: () => void
  icon?: IconProp
  disabled?: boolean
}

export interface SelectionBarProps {
  count: number
  /** Context beside the count, e.g. a total or a scope. */
  summary?: JSX.Element
  primary?: SelectionPrimaryAction
  secondary?: JSX.Element
  onClear?: () => void
  /** `sticky` fixes the bar to the bottom below `sm`. @default 'inline' */
  placement?: 'inline' | 'sticky'
  class?: string
}

/**
 * The one bulk-action surface for a data region.
 *
 * Inline on desktop, fixed above the bottom edge on a phone, so selecting a
 * row far down a card list never requires scrolling back to a toolbar.
 */
export function SelectionBar(props: SelectionBarProps): JSX.Element {
  return (
    <Show when={props.count > 0}>
      <section
        aria-label="Selection actions"
        data-slot="selection-bar"
        data-placement={props.placement ?? 'inline'}
        class={cn(
          'flex flex-wrap items-center justify-between gap-2 rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-2 shadow-sm',
          props.placement === 'sticky' &&
            'max-sm:fixed max-sm:inset-x-4 max-sm:bottom-4 max-sm:z-top max-sm:shadow-lg',
          props.class,
        )}
      >
        <div class="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span class="text-interface font-medium text-ink-gray-9">
            {props.count} selected
          </span>
          <Show when={props.summary}>
            <span class="text-caption tabular-nums text-ink-gray-7">
              {props.summary}
            </span>
          </Show>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          {props.secondary}
          <Show when={props.onClear}>
            <Button variant="ghost" size="sm" onClick={props.onClear}>
              Clear
            </Button>
          </Show>
          <Show when={props.primary}>
            {(primary) => (
              <Button
                variant="solid"
                theme="blue"
                size="sm"
                iconLeft={primary().icon}
                disabled={primary().disabled}
                onClick={primary().onClick}
              >
                {primary().label}
              </Button>
            )}
          </Show>
        </div>
      </section>
    </Show>
  )
}

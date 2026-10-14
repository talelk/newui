import { type JSX, Show, splitProps } from 'solid-js'
import { cn } from '../../lib/tv'
import {
  Button,
  type ButtonSize,
  type ButtonTheme,
  type ButtonVariant,
} from '../Button'

export type DividerOrientation = 'horizontal' | 'vertical'
export type DividerAlign = 'start' | 'center' | 'end'

export interface DividerAction {
  label: string
  onClick?: () => void
  variant?: ButtonVariant
  theme?: ButtonTheme
  size?: ButtonSize
}

export interface DividerProps {
  orientation?: DividerOrientation
  /** Placement of a `label` or `action` along the rule. */
  align?: DividerAlign
  label?: JSX.Element
  /** A button drawn on the rule instead of a bare `<hr>`. */
  action?: DividerAction
  /** Stretch to the parent's cross axis (for use in a flex row). */
  flexItem?: boolean
  class?: string
}

const ACTION_CONTAINER: Record<
  DividerOrientation,
  Record<DividerAlign, string>
> = {
  horizontal: {
    start: 'justify-start ps-4',
    center: 'justify-center',
    end: 'justify-end pe-4',
  },
  vertical: {
    start: 'items-start pt-4',
    center: 'items-center',
    end: 'items-end pb-4',
  },
}

const ACTION_LINE: Record<DividerOrientation, string> = {
  horizontal:
    'absolute start-0 end-0 top-[50%] -translate-y-[50%] border-t border-outline-gray-2',
  vertical:
    'absolute top-0 bottom-0 start-[50%] -translate-x-[50%] border-s border-outline-gray-2',
}

/**
 * A separator. `role="separator"` is left to the native `<hr>` element.
 *
 * A labelled divider is two rules with the label between them, not one rule the
 * label is painted over — so it sits correctly on any surface instead of
 * needing a background that matches whatever it happens to cover.
 *
 * An `action` divider draws a single full-length rule behind a `Button` that
 * sits on top of it, aligned by `align`.
 *
 * The branch checks are `<Show>` rather than early returns: a Solid component
 * body runs once, so `if (props.action) return …` would freeze the choice at
 * mount.
 */
export function Divider(props: DividerProps): JSX.Element {
  const [local] = splitProps(props, [
    'orientation',
    'align',
    'label',
    'action',
    'flexItem',
    'class',
  ])
  const orientation = () => local.orientation ?? 'horizontal'
  const align = () => local.align ?? 'center'
  const isHorizontal = () => orientation() === 'horizontal'

  const rule = (side: 'before' | 'after') => {
    const fixed = side === 'before' ? align() === 'start' : align() === 'end'
    return (
      <hr
        data-slot="divider"
        aria-orientation={orientation()}
        class={cn(
          'm-0 border-0 border-outline-gray-2',
          isHorizontal() ? 'border-t' : 'border-l',
          fixed ? 'w-4 flex-none' : 'flex-1',
        )}
      />
    )
  }

  return (
    <Show
      when={local.action}
      fallback={
        <Show
          when={local.label}
          fallback={
            <hr
              data-slot="divider"
              aria-orientation={orientation()}
              class={cn(
                'm-0 border-0 border-outline-gray-2',
                isHorizontal() ? 'w-full border-t' : 'h-full border-l',
                local.flexItem && 'self-stretch',
                local.class,
              )}
            />
          }
        >
          <div
            data-slot="divider"
            class={cn(
              'flex items-center gap-2',
              isHorizontal() ? 'w-full' : 'h-full flex-col',
              local.flexItem && 'self-stretch',
              local.class,
            )}
          >
            {rule('before')}
            <span class="whitespace-nowrap text-xs text-ink-gray-6">
              {local.label}
            </span>
            {rule('after')}
          </div>
        </Show>
      }
    >
      {(action) => (
        <div
          class={cn(
            'relative flex border-0 border-outline-gray-2 whitespace-nowrap',
            isHorizontal()
              ? 'w-full min-h-7 items-center'
              : cn(
                  'justify-center',
                  local.flexItem ? 'self-stretch' : 'h-full',
                ),
            ACTION_CONTAINER[orientation()][align()],
            local.class,
          )}
        >
          <hr
            aria-orientation={orientation()}
            data-slot="divider-action-line"
            class={ACTION_LINE[orientation()]}
          />
          <Button
            variant={action().variant ?? 'outline'}
            theme={action().theme ?? 'gray'}
            size={action().size ?? 'sm'}
            class="relative z-10"
            onClick={() => action().onClick?.()}
          >
            {action().label}
          </Button>
        </div>
      )}
    </Show>
  )
}

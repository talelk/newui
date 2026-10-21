import * as zag from '@zag-js/tooltip'
import {
  type Component,
  type JSX,
  type ParentComponent,
  Show,
  splitProps,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { createDisclosure } from '../../lib/disclosure'
import { createId } from '../../lib/id'
import { Portal } from '../../lib/portal'
import { cn } from '../../lib/tv'
import { createZagApi, createZagContext } from '../../lib/zag'

export type TooltipPlacement = zag.Placement

type TooltipApi = ReturnType<typeof zag.connect>

const { context: TooltipContext, useApi: useTooltipApi } =
  createZagContext<TooltipApi>('Tooltip')

export interface TooltipRootProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  openDelay?: number
  closeDelay?: number
  placement?: TooltipPlacement
  children: JSX.Element
}

export const TooltipRoot: ParentComponent<TooltipRootProps> = (props) => {
  const [open, setOpen] = createDisclosure({
    value: () => props.open,
    defaultOpen: props.defaultOpen,
    onChange: (value) => props.onOpenChange?.(value),
  })

  const machineId = createId('tooltip')
  const { api } = createZagApi<TooltipApi>(zag.machine, zag.connect, () => ({
    id: machineId,
    open: open(),
    openDelay: props.openDelay ?? 500,
    closeDelay: props.closeDelay ?? 150,
    placement: props.placement,
    onOpenChange: (details: { open: boolean }) => setOpen(details.open),
  }))
  return (
    <TooltipContext.Provider value={api}>
      {props.children}
    </TooltipContext.Provider>
  )
}

export interface TooltipTriggerProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'> {
  /** Element or component to render the trigger as. Defaults to `button`. */
  as?: string | Component<Record<string, unknown>>
  class?: string
  children?: JSX.Element
}

/**
 * The trigger. It IS the interactive element — the ARIA the machine emits
 * (`aria-describedby`, hover/focus handlers) lands on it directly, so a screen
 * reader announces the tooltip when the trigger takes focus.
 */
export function TooltipTrigger(props: TooltipTriggerProps): JSX.Element {
  const api = useTooltipApi()
  const [local, rest] = splitProps(props, ['as', 'class', 'children'])
  return (
    <Dynamic
      component={local.as ?? 'button'}
      {...api().getTriggerProps()}
      {...rest}
      class={cn('inline-flex', local.class)}
    >
      {local.children}
    </Dynamic>
  )
}

export interface TooltipContentProps {
  class?: string
  children?: JSX.Element
}

export function TooltipContent(props: TooltipContentProps): JSX.Element {
  const api = useTooltipApi()
  return (
    <Show when={api().open}>
      <Portal>
        <div
          {...api().getPositionerProps()}
          data-slot="tooltip-positioner"
          class="z-top"
        >
          <div
            {...api().getContentProps()}
            data-slot="tooltip-content"
            class={cn(
              'rounded-4 bg-surface-gray-10 px-2 py-1 text-xs text-ink-base shadow-xl',
              props.class,
            )}
          >
            {props.children}
            <div {...api().getArrowProps()} class="fill-surface-gray-10">
              <div {...api().getArrowTipProps()} />
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  )
}

export interface TooltipProps {
  /** Tooltip content. */
  text?: JSX.Element
  /** Class for the trigger (the visible element). */
  class?: string
  /** The trigger's content. */
  children?: JSX.Element
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  openDelay?: number
  closeDelay?: number
  placement?: TooltipPlacement
}

/**
 * Shorthand for the common case: a button trigger with a text bubble.
 * `children` is the trigger's content, not the trigger element — the component
 * renders the trigger so the ARIA stays on the interactive element (P12).
 * For a non-button trigger use `TooltipRoot` + `TooltipTrigger as="a"`.
 */
export function Tooltip(props: TooltipProps): JSX.Element {
  const [local] = splitProps(props, [
    'text',
    'class',
    'children',
    'open',
    'defaultOpen',
    'onOpenChange',
    'openDelay',
    'closeDelay',
    'placement',
  ])

  return (
    <TooltipRoot
      open={local.open}
      defaultOpen={local.defaultOpen}
      onOpenChange={local.onOpenChange}
      openDelay={local.openDelay}
      closeDelay={local.closeDelay}
      placement={local.placement}
    >
      <TooltipTrigger class={local.class}>{local.children}</TooltipTrigger>
      <TooltipContent>{local.text}</TooltipContent>
    </TooltipRoot>
  )
}

import {
  cn,
  createDisclosure,
  createId,
  createZagApi,
  createZagContext,
  Portal,
} from '@talelk/newui-atoms/internal'
import * as zag from '@zag-js/hover-card'
import { type Component, type JSX, type ParentComponent, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'

type HoverCardApi = ReturnType<typeof zag.connect>

const { context, useApi } = createZagContext<HoverCardApi>('HoverCard')

export interface HoverCardRootProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  openDelay?: number
  closeDelay?: number
  children: JSX.Element
}

const Root: ParentComponent<HoverCardRootProps> = (props) => {
  const [open, setOpen] = createDisclosure({
    value: () => props.open,
    defaultOpen: props.defaultOpen,
    onChange: (value) => props.onOpenChange?.(value),
  })

  const machineId = createId('hover-card')
  const { api } = createZagApi<HoverCardApi>(zag.machine, zag.connect, () => ({
    id: machineId,
    open: open(),
    openDelay: props.openDelay ?? 300,
    closeDelay: props.closeDelay ?? 300,
    onOpenChange: (details: { open: boolean }) => setOpen(details.open),
  }))

  return <context.Provider value={api}>{props.children}</context.Provider>
}

interface PartProps {
  class?: string
  children?: JSX.Element
}

export interface HoverCardTriggerProps {
  as?: string | Component<Record<string, unknown>>
  class?: string
  children?: JSX.Element
}

const Trigger: ParentComponent<HoverCardTriggerProps> = (props) => {
  const api = useApi()
  return (
    <Dynamic
      component={props.as ?? 'span'}
      {...(api().getTriggerProps() as unknown as JSX.HTMLAttributes<HTMLElement>)}
      data-slot="hover-card-trigger"
      class={cn('inline-flex', props.class)}
    >
      {props.children}
    </Dynamic>
  )
}

const Content: ParentComponent<PartProps> = (props) => {
  const api = useApi()
  return (
    <Show when={api().open}>
      <Portal>
        <div
          {...api().getPositionerProps()}
          data-slot="hover-card-positioner"
          class="z-top"
        >
          <div
            {...api().getContentProps()}
            data-slot="hover-card-content"
            class={cn(
              'rounded-overlay bg-surface-elevation-2 text-ink-gray-9 shadow-2xl ring-1 ring-outline-gray-1',
              props.class,
            )}
          >
            {props.children}
          </div>
        </div>
      </Portal>
    </Show>
  )
}

export const HoverCard = { Root, Trigger, Content }

export type { HoverCardRootProps as HoverCardProps }

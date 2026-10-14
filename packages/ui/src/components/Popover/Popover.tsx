import * as zag from '@zag-js/popover'
import { type JSX, type ParentComponent, Show } from 'solid-js'
import { createDisclosure } from '../../lib/disclosure'
import { createId } from '../../lib/id'
import { Portal } from '../../lib/portal'
import { cn } from '../../lib/tv'
import { createZagApi, createZagContext } from '../../lib/zag'

type PopoverApi = ReturnType<typeof zag.connect>

const { context, useApi } = createZagContext<PopoverApi>('Popover')

export interface PopoverRootProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  children: JSX.Element
}

const Root: ParentComponent<PopoverRootProps> = (props) => {
  const [open, setOpen] = createDisclosure({
    value: () => props.open,
    defaultOpen: props.defaultOpen,
    onChange: (value) => props.onOpenChange?.(value),
  })

  const { api } = createZagApi<PopoverApi>(zag.machine, zag.connect, () => ({
    id: createId('popover'),
    open: open(),
    modal: props.modal,
    onOpenChange: (details: { open: boolean }) => setOpen(details.open),
  }))

  return <context.Provider value={api}>{props.children}</context.Provider>
}

interface PartProps {
  class?: string
  children?: JSX.Element
}

const Trigger: ParentComponent<PartProps> = (props) => {
  const api = useApi()
  return (
    <button
      {...api().getTriggerProps()}
      data-slot="popover-trigger"
      class={props.class}
    >
      {props.children}
    </button>
  )
}

const Title: ParentComponent<PartProps> = (props) => {
  const api = useApi()
  return (
    <h3
      {...api().getTitleProps()}
      data-slot="popover-title"
      class={cn('text-base-medium text-ink-gray-9', props.class)}
    >
      {props.children}
    </h3>
  )
}

const Description: ParentComponent<PartProps> = (props) => {
  const api = useApi()
  return (
    <p
      {...api().getDescriptionProps()}
      data-slot="popover-description"
      class={cn('text-sm text-ink-gray-6', props.class)}
    >
      {props.children}
    </p>
  )
}

const Close: ParentComponent<PartProps> = (props) => {
  const api = useApi()
  return (
    <button
      {...api().getCloseTriggerProps()}
      data-slot="popover-close"
      class={props.class}
    >
      {props.children}
    </button>
  )
}

const Content: ParentComponent<PartProps> = (props) => {
  const api = useApi()
  return (
    <Show when={api().open}>
      <Portal>
        <div
          {...api().getPositionerProps()}
          data-slot="popover-positioner"
          class="z-[100]"
        >
          <div
            {...api().getContentProps()}
            data-slot="popover-content"
            class={cn(
              'relative z-50 rounded-6 bg-surface-elevation-2 text-ink-gray-9 shadow-2xl ring-1 ring-outline-gray-1',
              'focus-visible:outline-none',
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

export const Popover = {
  Root,
  Trigger,
  Content,
  Title,
  Description,
  Close,
}

export type { PopoverRootProps as PopoverProps }

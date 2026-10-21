import {
  cn,
  createDisclosure,
  createId,
  createZagApi,
  createZagContext,
  Portal,
} from '@newui/atoms/internal'
import * as zag from '@zag-js/menu'
import { type JSX, type ParentComponent, Show } from 'solid-js'

type ContextMenuApi = ReturnType<typeof zag.connect>

const { context: ContextMenuContext, useApi: useContextMenuApi } =
  createZagContext<ContextMenuApi>('ContextMenu')

export interface ContextMenuRootProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Called with the selected item's value. */
  onSelect?: (value: string) => void
  children: JSX.Element
}

const Root: ParentComponent<ContextMenuRootProps> = (props) => {
  const [open, setOpen] = createDisclosure({
    value: () => props.open,
    defaultOpen: props.defaultOpen,
    onChange: (value) => props.onOpenChange?.(value),
  })

  const machineId = createId('context-menu')
  const { api } = createZagApi<ContextMenuApi>(
    zag.machine,
    zag.connect,
    () => ({
      id: machineId,
      open: open(),
      onOpenChange: (details: { open: boolean }) => setOpen(details.open),
      onSelect: (details: { value: string }) => props.onSelect?.(details.value),
    }),
  )

  return (
    <ContextMenuContext.Provider value={api}>
      {props.children}
    </ContextMenuContext.Provider>
  )
}

interface PartProps {
  class?: string
  children?: JSX.Element
}

/**
 * The right-click area. Zag's `contextTrigger` opens the menu at the pointer,
 * and on touch screens on a long press.
 */
const Trigger: ParentComponent<PartProps> = (props) => {
  const api = useContextMenuApi()
  return (
    <div
      {...api().getContextTriggerProps()}
      data-slot="context-menu-trigger"
      class={props.class}
    >
      {props.children}
    </div>
  )
}

const Content: ParentComponent<PartProps> = (props) => {
  const api = useContextMenuApi()
  return (
    <Show when={api().open}>
      <Portal>
        <div
          {...api().getPositionerProps()}
          data-slot="context-menu-positioner"
          class="z-[100]"
        >
          <div
            {...api().getContentProps()}
            data-slot="context-menu-content"
            class={cn(
              'min-w-40 rounded-overlay bg-surface-elevation-2 p-1.5 text-ink-gray-9 shadow-2xl ring-1 ring-outline-gray-1 focus-visible:outline-none',
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

export interface ContextMenuItemProps {
  value: string
  disabled?: boolean
  valueText?: string
  class?: string
  children?: JSX.Element
}

const Item: ParentComponent<ContextMenuItemProps> = (props) => {
  const api = useContextMenuApi()
  return (
    <div
      {...api().getItemProps({
        value: props.value,
        valueText: props.valueText,
        disabled: props.disabled,
      })}
      data-slot="context-menu-item"
      class={cn(
        'flex cursor-pointer items-center gap-2 rounded-4 px-2 py-1.5 text-base text-ink-gray-8 outline-none transition-colors',
        'data-[highlighted]:bg-surface-alpha-gray-2',
        'data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-gray-4',
        props.class,
      )}
    >
      {props.children}
    </div>
  )
}

const Separator: ParentComponent<PartProps> = (props) => {
  const api = useContextMenuApi()
  return (
    <div
      {...api().getSeparatorProps()}
      data-slot="context-menu-separator"
      class={cn('my-1 h-px bg-outline-elevation-2', props.class)}
    />
  )
}

const ItemGroup: ParentComponent<PartProps> = (props) => {
  const api = useContextMenuApi()
  return (
    <div {...api().getItemGroupProps({ id: createId('context-menu-group') })}>
      {props.children}
    </div>
  )
}

const Label: ParentComponent<PartProps> = (props) => (
  <div
    data-slot="context-menu-group-label"
    class={cn(
      'flex h-7 items-center px-2 text-sm font-medium leading-tighter text-ink-gray-4',
      props.class,
    )}
  >
    {props.children}
  </div>
)

export const ContextMenu = {
  Root,
  Trigger,
  Content,
  Item,
  Separator,
  ItemGroup,
  Label,
}

export type { ContextMenuRootProps as ContextMenuProps }

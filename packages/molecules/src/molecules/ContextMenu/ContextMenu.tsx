import {
  createDisclosure,
  createId,
  createZagApi,
  createZagContext,
} from '@talelk/newui-atoms/internal'
import * as zag from '@zag-js/menu'
import type { JSX, ParentComponent } from 'solid-js'
import { createMenuParts, type MenuItemPartProps } from '../Menu/menu-parts'

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

export type ContextMenuItemProps = MenuItemPartProps

// The panel parts are shared with Menu (../Menu/menu-parts); only the
// root/trigger — the parts that actually differ — live here.
const parts = createMenuParts(useContextMenuApi, 'context-menu')

export const ContextMenu = {
  Root,
  Trigger,
  ...parts,
}

export type { ContextMenuRootProps as ContextMenuProps }

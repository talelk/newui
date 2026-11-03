import {
  createDisclosure,
  createId,
  createZagApi,
  createZagContext,
  mergeProps,
} from '@talelk/newui-atoms/internal'
import * as zag from '@zag-js/menu'
import { type JSX, type ParentComponent, splitProps } from 'solid-js'
import { createMenuParts, type MenuItemPartProps } from './menu-parts'

type MenuApi = ReturnType<typeof zag.connect>

const { context: MenuContext, useApi: useMenuApi } =
  createZagContext<MenuApi>('Menu')

export interface MenuRootProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Called with the selected item's value. */
  onSelect?: (value: string) => void
  children: JSX.Element
}

const Root: ParentComponent<MenuRootProps> = (props) => {
  const [open, setOpen] = createDisclosure({
    value: () => props.open,
    defaultOpen: props.defaultOpen,
    onChange: (value) => props.onOpenChange?.(value),
  })

  const machineId = createId('menu')
  const { api } = createZagApi<MenuApi>(zag.machine, zag.connect, () => ({
    id: machineId,
    open: open(),
    onOpenChange: (details: { open: boolean }) => setOpen(details.open),
    onSelect: (details: { value: string }) => props.onSelect?.(details.value),
  }))
  return (
    <MenuContext.Provider value={api}>{props.children}</MenuContext.Provider>
  )
}

const Trigger: ParentComponent<
  Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'style'>
> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children'])
  const api = useMenuApi()
  return (
    <button
      {...mergeProps(api().getTriggerProps(), rest)}
      data-slot="menu-trigger"
      class={local.class}
    >
      {local.children}
    </button>
  )
}

export type MenuItemProps = MenuItemPartProps

// The panel parts are shared with ContextMenu (./menu-parts); only the
// root/trigger — the parts that actually differ — live here.
const parts = createMenuParts(useMenuApi, 'menu')

export const Menu = {
  Root,
  Trigger,
  ...parts,
}

export type { MenuRootProps as MenuProps }

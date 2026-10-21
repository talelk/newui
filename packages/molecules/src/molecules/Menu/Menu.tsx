import {
  cn,
  createDisclosure,
  createId,
  createZagApi,
  createZagContext,
  mergeProps,
  Portal,
} from '@newui/atoms/internal'
import * as zag from '@zag-js/menu'
import { type JSX, type ParentComponent, Show, splitProps } from 'solid-js'

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

interface PartProps {
  class?: string
  children?: JSX.Element
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

const Content: ParentComponent<PartProps> = (props) => {
  const api = useMenuApi()
  return (
    <Show when={api().open}>
      <Portal>
        <div
          {...api().getPositionerProps()}
          data-slot="menu-positioner"
          class="z-overlay"
        >
          <div
            {...api().getContentProps()}
            data-slot="menu-content"
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

export interface MenuItemProps {
  value: string
  disabled?: boolean
  valueText?: string
  class?: string
  children?: JSX.Element
}

const Item: ParentComponent<MenuItemProps> = (props) => {
  const api = useMenuApi()
  return (
    <div
      {...api().getItemProps({
        value: props.value,
        valueText: props.valueText,
        disabled: props.disabled,
      })}
      data-slot="menu-item"
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
  const api = useMenuApi()
  return (
    <div
      {...api().getSeparatorProps()}
      data-slot="menu-separator"
      class={cn('my-1 h-px bg-outline-elevation-2', props.class)}
    />
  )
}

const ItemGroup: ParentComponent<PartProps> = (props) => {
  const api = useMenuApi()
  return (
    <div {...api().getItemGroupProps({ id: createId('menu-group') })}>
      {props.children}
    </div>
  )
}

const Label: ParentComponent<PartProps> = (props) => (
  <div
    data-slot="menu-group-label"
    class={cn(
      'flex h-7 items-center px-2 text-sm font-medium leading-tighter text-ink-gray-4',
      props.class,
    )}
  >
    {props.children}
  </div>
)

export const Menu = {
  Root,
  Trigger,
  Content,
  Item,
  Separator,
  ItemGroup,
  Label,
}

export type { MenuRootProps as MenuProps }

/**
 * The panel parts shared by `Menu` and `ContextMenu`. Both families run Zag's
 * `menu` machine and differ only in their trigger (button vs context area),
 * so the parts are built once here, parameterized by each family's context
 * accessor and its `data-slot` prefix. Not exported from the package — the
 * public names stay `Menu` / `ContextMenu` (P8).
 *
 * The panel, row, label and separator looks are the shared overlay
 * foundations (`overlayPanel`, `listboxRow`, `listboxLabel`,
 * `overlaySeparator`) from atoms/lib control-styles, so a menu and a select
 * listbox opened side by side are the same surface at the same depth.
 */
import {
  cn,
  createId,
  listboxLabel,
  listboxRow,
  overlayLayers,
  overlayPanel,
  overlaySeparator,
  Portal,
} from '@talelk/newui-atoms/internal'
import type * as zag from '@zag-js/menu'
import { type Accessor, type JSX, type ParentComponent, Show } from 'solid-js'

type MenuApi = ReturnType<typeof zag.connect>

export interface MenuPartProps {
  class?: string
  children?: JSX.Element
}

export interface MenuItemPartProps {
  value: string
  disabled?: boolean
  valueText?: string
  class?: string
  children?: JSX.Element
}

export function createMenuParts(
  useApi: () => Accessor<MenuApi>,
  prefix: string,
) {
  const Content: ParentComponent<MenuPartProps> = (props) => {
    const api = useApi()
    return (
      <Show when={api().open}>
        <Portal>
          <div
            {...api().getPositionerProps()}
            data-slot={`${prefix}-positioner`}
            class={overlayLayers.popup}
          >
            <div
              {...api().getContentProps()}
              data-slot={`${prefix}-content`}
              class={cn(
                overlayPanel({ kind: 'popup' }),
                'min-w-40',
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

  const Item: ParentComponent<MenuItemPartProps> = (props) => {
    const api = useApi()
    return (
      <div
        {...api().getItemProps({
          value: props.value,
          valueText: props.valueText,
          disabled: props.disabled,
        })}
        data-slot={`${prefix}-item`}
        // Menu rows run leading-aligned (icon then label); the shared row's
        // space-between split is the listbox check-mark layout.
        class={cn(listboxRow, 'justify-start', props.class)}
      >
        {props.children}
      </div>
    )
  }

  const Separator: ParentComponent<MenuPartProps> = (props) => {
    const api = useApi()
    return (
      <div
        {...api().getSeparatorProps()}
        data-slot={`${prefix}-separator`}
        class={cn(overlaySeparator, props.class)}
      />
    )
  }

  const ItemGroup: ParentComponent<MenuPartProps> = (props) => {
    const api = useApi()
    return (
      <div {...api().getItemGroupProps({ id: createId(`${prefix}-group`) })}>
        {props.children}
      </div>
    )
  }

  const Label: ParentComponent<MenuPartProps> = (props) => (
    <div
      data-slot={`${prefix}-group-label`}
      class={cn(listboxLabel, props.class)}
    >
      {props.children}
    </div>
  )

  return { Content, Item, Separator, ItemGroup, Label }
}

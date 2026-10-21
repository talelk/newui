import { Icon, type IconProp } from '@talelk/newui-atoms'
import {
  cn,
  createId,
  createZagApi,
  createZagContext,
  tv,
} from '@talelk/newui-atoms/internal'
import * as zag from '@zag-js/toggle-group'
import {
  type Accessor,
  createContext,
  type JSX,
  type ParentComponent,
  Show,
  splitProps,
  useContext,
} from 'solid-js'

type ToggleGroupApi = ReturnType<typeof zag.connect>

const { context, useApi } = createZagContext<ToggleGroupApi>('ToggleGroup')

export type ToggleGroupVariant = 'subtle' | 'outline' | 'ghost'
export type ToggleGroupSize = 'sm' | 'md' | 'lg'

interface ToggleGroupConfig {
  variant: ToggleGroupVariant
  size: ToggleGroupSize
}

/**
 * The group's recipe config, so a cell can style itself without the caller
 * repeating the variant on every item. `ToggleGroup` is one control: setting the
 * variant per cell would let a row render half in one shape and half in another.
 */
const DEFAULT_CONFIG: ToggleGroupConfig = { variant: 'subtle', size: 'sm' }

const ToggleGroupConfigContext = createContext<Accessor<ToggleGroupConfig>>(
  () => DEFAULT_CONFIG,
)

export const toggleGroupTrack = tv({
  base: 'inline-flex shrink-0 items-center',
  variants: {
    variant: {
      // A recessed trough with a raised active cell — the toolbar control.
      subtle: 'gap-0.5 rounded-control bg-surface-gray-2 p-0.5',
      // Bordered cells that share an edge, so the row reads as one segmented
      // box rather than three buttons that happen to be adjacent.
      outline: 'gap-0',
      ghost: 'gap-0.5',
    },
  },
  defaultVariants: { variant: 'subtle' },
})

export const toggleGroupItem = tv({
  base: 'inline-flex select-none items-center justify-center gap-1.5 text-ink-gray-6 outline-none transition-colors focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-ink-gray-4',
  variants: {
    variant: {
      subtle:
        'rounded-3 hover:text-ink-gray-9 data-[state=on]:bg-surface-base data-[state=on]:text-ink-gray-9 data-[state=on]:shadow-sm',
      outline:
        'rounded-none border border-outline-gray-2 not-first:-ms-px hover:bg-surface-gray-2 data-[state=on]:bg-surface-gray-3 data-[state=on]:text-ink-gray-9 first:rounded-s-4 last:rounded-e-4',
      ghost:
        'rounded-3 hover:bg-surface-gray-2 data-[state=on]:bg-surface-gray-3 data-[state=on]:text-ink-gray-9',
    },
    size: {
      sm: 'h-7 min-w-6 px-2 text-base',
      md: 'h-8 min-w-7 px-2.5 text-base',
      lg: 'h-10 min-w-8 px-3 text-base',
    },
  },
  defaultVariants: { variant: 'subtle', size: 'sm' },
})

export interface ToggleGroupProps {
  variant?: ToggleGroupVariant
  /** @default sm */
  size?: ToggleGroupSize
  /** Controlled selection. `multiple` decides whether it is a list or one value. */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Allow more than one cell on at once. */
  multiple?: boolean
  disabled?: boolean
  /** Accessible name for the group — it is a toolbar of related controls. */
  'aria-label'?: string
  class?: string
  children: JSX.Element
}

/**
 * A row of independent on/off cells that read as one control: text alignment, a
 * view switcher, a density picker.
 *
 * Distinct from `TabButtons`, which picks a *view* and slides a pill indicator.
 * A toggle group is a set of pressed states — and may allow several at once —
 * which is what `aria-pressed` (Zag's `data-state`) communicates. The machine
 * owns the grouping semantics and the roving focus, so the row is one tab stop.
 */
export const ToggleGroupRoot: ParentComponent<ToggleGroupProps> = (props) => {
  const [local] = splitProps(props, [
    'variant',
    'size',
    'value',
    'defaultValue',
    'onValueChange',
    'multiple',
    'disabled',
    'aria-label',
    'class',
  ])

  const config = (): ToggleGroupConfig => ({
    variant: local.variant ?? 'subtle',
    size: local.size ?? 'sm',
  })

  const machineId = createId('toggle-group')
  const { api } = createZagApi<ToggleGroupApi>(
    zag.machine,
    zag.connect,
    () => ({
      id: machineId,
      value: local.value,
      defaultValue: local.defaultValue,
      multiple: local.multiple,
      disabled: local.disabled,
      rovingFocus: true,
      onValueChange: (details: { value: string[] }) =>
        local.onValueChange?.(details.value),
    }),
  )

  return (
    <context.Provider value={api}>
      <ToggleGroupConfigContext.Provider value={config}>
        {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: role="group" (or "radiogroup" when single-select) is supplied by Zag's getRootProps spread. */}
        <div
          {...api().getRootProps()}
          aria-label={local['aria-label']}
          data-slot="toggle-group"
          data-variant={config().variant}
          data-size={config().size}
          class={cn(
            toggleGroupTrack({ variant: config().variant }),
            local.class,
          )}
        >
          {props.children}
        </div>
      </ToggleGroupConfigContext.Provider>
    </context.Provider>
  )
}

export interface ToggleGroupItemProps {
  value: string
  disabled?: boolean
  /** A `lucide-*` string or a component (P11). Alone, it makes the cell square. */
  icon?: IconProp
  /** Accessible name when the cell has only an icon. */
  'aria-label'?: string
  class?: string
  children?: JSX.Element
}

export const ToggleGroupItem: ParentComponent<ToggleGroupItemProps> = (
  props,
) => {
  const api = useApi()
  const config = useContext(ToggleGroupConfigContext)
  const [local, rest] = splitProps(props, [
    'value',
    'disabled',
    'icon',
    'class',
    'children',
  ])

  return (
    <button
      {...api().getItemProps({ value: local.value, disabled: local.disabled })}
      {...rest}
      data-slot="toggle-group-item"
      class={cn(
        toggleGroupItem({
          variant: config().variant,
          size: config().size,
        }),
        local.class,
      )}
    >
      <Show when={local.icon}>
        {(icon) => <Icon icon={icon()} class="size-4 shrink-0" />}
      </Show>
      {local.children}
    </button>
  )
}

/**
 * A toggle group: `Root` · `Item`.
 *
 * A cell's pressed state is `data-state="on" | "off"` — style off that
 * (`data-[state=on]:*`), never off a class the caller passes in.
 */
export const ToggleGroup = {
  Root: ToggleGroupRoot,
  Item: ToggleGroupItem,
}

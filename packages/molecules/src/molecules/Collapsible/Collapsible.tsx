import { Icon, type IconProp } from '@newui/atoms'
import {
  cn,
  createId,
  createZagApi,
  createZagContext,
} from '@newui/atoms/internal'
import * as zag from '@zag-js/collapsible'
import { type JSX, type ParentComponent, Show, splitProps } from 'solid-js'

type CollapsibleApi = ReturnType<typeof zag.connect>

const { context, useApi } = createZagContext<CollapsibleApi>('Collapsible')

export interface CollapsibleProps {
  /** Controlled open state. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  class?: string
  children: JSX.Element
}

/**
 * One disclosure: a trigger and a panel it shows or hides.
 *
 * The single-item sibling of `Accordion` — same animation model (the panel
 * clips, the inner box holds the padding, `grid-template-rows` carries the
 * transition), same chrome, but the open state is a plain boolean you can own.
 * Use `Accordion` when the items should coordinate (one open at a time, arrow
 * keys between triggers); use this when it is just a "show more".
 */
export const CollapsibleRoot: ParentComponent<CollapsibleProps> = (props) => {
  const [local] = splitProps(props, [
    'open',
    'defaultOpen',
    'onOpenChange',
    'disabled',
    'class',
  ])

  const machineId = createId('collapsible')
  const { api } = createZagApi<CollapsibleApi>(
    zag.machine,
    zag.connect,
    () => ({
      id: machineId,
      open: local.open,
      defaultOpen: local.defaultOpen,
      disabled: local.disabled,
      onOpenChange: (details: { open: boolean }) =>
        local.onOpenChange?.(details.open),
    }),
  )

  return (
    <context.Provider value={api}>
      <div
        {...api().getRootProps()}
        data-slot="collapsible"
        class={cn('flex w-full flex-col', local.class)}
      >
        {props.children}
      </div>
    </context.Provider>
  )
}

export interface CollapsibleTriggerProps {
  /** A `lucide-*` string or a component, shown before the label (P11). */
  icon?: IconProp
  /** Hide the built-in chevron when the trigger draws its own affordance. */
  hideIndicator?: boolean
  class?: string
  children?: JSX.Element
}

export const CollapsibleTrigger: ParentComponent<CollapsibleTriggerProps> = (
  props,
) => {
  const api = useApi()
  const [local] = splitProps(props, ['icon', 'hideIndicator', 'class'])

  return (
    <button
      {...api().getTriggerProps()}
      data-slot="collapsible-trigger"
      class={cn(
        'group flex cursor-pointer items-center gap-2 rounded-4 px-2 py-1.5 text-start text-base-medium text-ink-gray-8 transition-colors duration-base',
        'hover:bg-surface-gray-2',
        'focus-visible:focus-ring',
        'disabled:cursor-not-allowed disabled:text-ink-gray-4 disabled:hover:bg-transparent',
        local.class,
      )}
    >
      <span class="flex min-w-0 flex-1 items-center gap-2">
        <Show when={local.icon}>
          {(icon) => (
            <Icon icon={icon()} class="size-4 shrink-0 text-ink-gray-6" />
          )}
        </Show>
        <span class="truncate">{props.children}</span>
      </span>
      <Show when={!local.hideIndicator}>
        <span
          class="grid size-4 shrink-0 place-items-center text-ink-gray-5 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-[state=open]:rotate-180 group-hover:text-ink-gray-8 motion-reduce:transition-none"
          aria-hidden="true"
        >
          <Icon icon="lucide-chevron-down" class="size-4" />
        </span>
      </Show>
    </button>
  )
}

export interface CollapsibleContentProps {
  class?: string
  children?: JSX.Element
}

/** See `Accordion` for why the panel drops the machine's `hidden`. */
function contentProps(api: CollapsibleApi): Record<string, unknown> {
  const all = api.getContentProps() as Record<string, unknown> & {
    hidden?: unknown
  }
  const next = { ...all }
  delete next.hidden
  return next
}

export const CollapsibleContent: ParentComponent<CollapsibleContentProps> = (
  props,
) => {
  const api = useApi()
  const [local] = splitProps(props, ['class'])

  return (
    <div
      {...contentProps(api())}
      data-slot="collapsible-content"
      class="disclosure-panel"
    >
      <div class="overflow-hidden">
        <div
          class={cn('px-2 pt-1 pb-2 text-base text-ink-gray-6', local.class)}
        >
          {props.children}
        </div>
      </div>
    </div>
  )
}

export const Collapsible = {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
}

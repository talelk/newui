import { Icon, type IconProp } from '@newui/atoms'
import {
  cn,
  createId,
  createZagApi,
  createZagContext,
} from '@newui/atoms/internal'
import * as zag from '@zag-js/accordion'
import {
  type Accessor,
  createContext,
  type JSX,
  type ParentComponent,
  Show,
  splitProps,
  useContext,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'

type AccordionApi = ReturnType<typeof zag.connect>

const { context, useApi } = createZagContext<AccordionApi>('Accordion')

/**
 * What an item knows about itself.
 *
 * Zag resolves an item's state from the props you hand *each* getter, so a
 * `disabled` set on `Item` alone would leave its own trigger looking enabled —
 * focusable, and reachable by the arrow keys. `Item` therefore owns the value
 * and the disabled flag and hands them to every part, which also removes the
 * chance of a `Trigger` and its `Content` disagreeing about which item they
 * belong to.
 */
interface AccordionItemContextValue {
  value: Accessor<string>
  disabled: Accessor<boolean>
  /** Heading level for the trigger, so the outline stays a valid tree. */
  headingLevel: Accessor<'h2' | 'h3' | 'h4' | 'h5' | 'h6'>
}

const AccordionItemContext = createContext<AccordionItemContextValue>()

function useItem(): AccordionItemContextValue {
  const value = useContext(AccordionItemContext)
  if (!value) {
    throw new Error('Accordion parts must be used within <Accordion.Item>')
  }
  return value
}

export interface AccordionProps {
  /** Allow more than one panel open at a time. */
  multiple?: boolean
  /** With `multiple={false}`, allow closing the open panel. Default `true`. */
  collapsible?: boolean
  /** Controlled open panels. */
  value?: string[]
  /** Initial open panels (uncontrolled). */
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  class?: string
  children: JSX.Element
}

/**
 * A set of collapsible panels — Zag's `accordion` machine, which owns the
 * keyboard map (`Up`/`Down`/`Home`/`End` between the triggers, `Enter`/`Space`
 * to toggle, disabled items skipped) and the `aria-expanded` / `aria-controls`
 * / `role="region"` wiring.
 *
 * The visual is frappe-ui's: a hairline-divided stack rather than a bordered
 * card, so an accordion drops into a `Card` or a settings panel without
 * fighting the container it is already inside.
 */
export const AccordionRoot: ParentComponent<AccordionProps> = (props) => {
  const [local] = splitProps(props, [
    'multiple',
    'collapsible',
    'value',
    'defaultValue',
    'onValueChange',
    'disabled',
    'orientation',
    'class',
  ])

  const machineId = createId('accordion')
  const { api } = createZagApi<AccordionApi>(zag.machine, zag.connect, () => ({
    id: machineId,
    multiple: local.multiple,
    // Zag only honours `collapsible` for a single-select accordion.
    collapsible: local.multiple ? undefined : (local.collapsible ?? true),
    value: local.value,
    defaultValue: local.defaultValue,
    disabled: local.disabled,
    orientation: local.orientation,
    onValueChange: (details: { value: string[] }) =>
      local.onValueChange?.(details.value),
  }))

  return (
    <context.Provider value={api}>
      <div
        {...api().getRootProps()}
        data-slot="accordion"
        class={cn(
          'flex w-full flex-col divide-y divide-outline-gray-1',
          local.class,
        )}
      >
        {props.children}
      </div>
    </context.Provider>
  )
}

export interface AccordionItemProps {
  value: string
  disabled?: boolean
  /** Heading level for the trigger, so the outline stays a valid tree. */
  headingLevel?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  class?: string
  children: JSX.Element
}

export const AccordionItem: ParentComponent<AccordionItemProps> = (props) => {
  const api = useApi()
  const [local] = splitProps(props, [
    'value',
    'disabled',
    'headingLevel',
    'class',
  ])

  const disabled = () => Boolean(local.disabled)
  const headingLevel = () => local.headingLevel ?? 'h3'

  return (
    <AccordionItemContext.Provider
      value={{ value: () => local.value, disabled, headingLevel }}
    >
      <div
        {...api().getItemProps({
          value: local.value,
          disabled: disabled(),
        })}
        data-slot="accordion-item"
        class={cn('flex flex-col', local.class)}
      >
        {props.children}
      </div>
    </AccordionItemContext.Provider>
  )
}

export interface AccordionTriggerProps {
  /** A `lucide-*` string or a component, shown before the label (P11). */
  icon?: IconProp
  class?: string
  children?: JSX.Element
}

/**
 * The heading wraps *only* the trigger — never the panel.
 *
 * Zag expects the trigger to sit inside a heading element so the accordion reads
 * as a list of sections; putting the panel inside that heading too would lay the
 * trigger and the panel out as siblings in the heading's row, side by side.
 * `Item` therefore owns the level and this part renders it, and the heading is a
 * flex row so the button can fill it.
 */
export const AccordionTrigger: ParentComponent<AccordionTriggerProps> = (
  props,
) => {
  const api = useApi()
  const item = useItem()
  const [local] = splitProps(props, ['icon', 'class'])

  const triggerProps = () =>
    api().getItemTriggerProps({
      value: item.value(),
      disabled: item.disabled(),
    })

  return (
    <Dynamic
      component={item.headingLevel()}
      class="m-0 flex"
      data-slot="accordion-heading"
    >
      <button
        {...triggerProps()}
        data-slot="accordion-trigger"
        class={cn(
          'group flex flex-1 cursor-pointer items-center gap-2 rounded-4 px-2 py-3 text-start text-base font-medium text-ink-gray-8 transition-colors duration-base',
          'hover:text-ink-gray-9',
          'focus-visible:focus-ring',
          // Zag marks the trigger with the native `disabled` attribute (not a
          // `data-disabled`), so the disabled look hangs off `:disabled` — and
          // the indicator, which is a child, off `group-disabled:`.
          'disabled:cursor-not-allowed disabled:text-ink-gray-4 disabled:hover:text-ink-gray-4',
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
        <span
          {...api().getItemIndicatorProps({
            value: item.value(),
            disabled: item.disabled(),
          })}
          data-slot="accordion-indicator"
          class="grid size-4 shrink-0 place-items-center text-ink-gray-5 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-disabled:text-ink-gray-4 group-data-[state=open]:rotate-180 group-hover:text-ink-gray-8 motion-reduce:transition-none"
        >
          <Icon icon="lucide-chevron-down" class="size-4" />
        </span>
      </button>
    </Dynamic>
  )
}

/**
 * Zag marks a collapsed panel `hidden`, which is right for assistive tech but
 * leaves nothing to animate: a `display: none` element has no height to
 * transition. The panel therefore drops that one prop and animates the
 * `grid-template-rows: 0fr → 1fr` idiom instead — the wrapper clips, the inner
 * box holds the padding, so a collapsed panel is exactly zero high.
 *
 * `invisible` is what keeps the collapsed panel out of the tab order and the
 * accessibility tree, and it flips only once the collapse transition has
 * finished, so the close is still visible.
 */
function contentProps(
  api: AccordionApi,
  value: string,
  disabled: boolean,
): Record<string, unknown> {
  const all = api.getItemContentProps({ value, disabled }) as Record<
    string,
    unknown
  > & { hidden?: unknown }
  const next = { ...all }
  delete next.hidden
  return next
}

export interface AccordionContentProps {
  class?: string
  children?: JSX.Element
}

export const AccordionContent: ParentComponent<AccordionContentProps> = (
  props,
) => {
  const api = useApi()
  const item = useItem()
  const [local] = splitProps(props, ['class'])

  return (
    <div
      {...contentProps(api(), item.value(), item.disabled())}
      data-slot="accordion-content"
      class="disclosure-panel"
    >
      <div class="overflow-hidden">
        <div class={cn('px-2 pb-3 text-p-base text-ink-gray-6', local.class)}>
          {props.children}
        </div>
      </div>
    </div>
  )
}

/**
 * A compound accordion: `Root` · `Item` · `Trigger` · `Content`.
 *
 * `Item` owns the value and the disabled flag; the trigger and the panel read
 * them from it, so the two can never disagree about which item they belong to
 * and a disabled item disables all three of Zag's getters at once.
 */
export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
}

import { Icon, type IconProp } from '@talelk/newui-atoms'
import {
  type BrowserTabBase,
  browserTabCardClasses,
  cn,
  createControllableSignal,
  createId,
  createTabIndicator,
  createZagApi,
  type TabOrientation,
  type TabsEdge,
  type TabsSize,
  type TabsVariant,
  tabIndicatorClipClasses,
  tabIndicatorMotionClasses,
  tabIndicatorSurfaceClasses,
  tabPillClasses,
  tabRadiusClasses,
  tabShellClasses,
  tabTrackClasses,
} from '@talelk/newui-atoms/internal'
import * as zag from '@zag-js/tabs'
import {
  type Accessor,
  createContext,
  type JSX,
  type ParentComponent,
  Show,
  useContext,
} from 'solid-js'

type TabsApi = ReturnType<typeof zag.connect>

const TabsContext = createContext<Accessor<TabsApi>>()

function useTabsApi() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs parts must be used within <Tabs.Root>')
  return ctx
}

interface TabsConfig {
  orientation: TabOrientation
  variant: TabsVariant
  size: TabsSize
  edge: TabsEdge
}

const DEFAULT_CONFIG: TabsConfig = {
  orientation: 'horizontal',
  variant: 'underline',
  size: 'sm',
  edge: 'start',
}

const TabsConfigContext = createContext<Accessor<TabsConfig>>(
  () => DEFAULT_CONFIG,
)

const TabsListContext = createContext<Accessor<TabsConfig> | undefined>(
  undefined,
)

/** The resolved config for a trigger: the nearest `Tabs.List`, else the root. */
function useTabsListConfig(): Accessor<TabsConfig> {
  const list = useContext(TabsListContext)
  const root = useContext(TabsConfigContext)
  return list ?? root
}

export interface TabsRootProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: TabOrientation
  /** `automatic` activates on focus; `manual` requires Enter/Space. */
  activationMode?: 'automatic' | 'manual'
  /** Default variant for the list; `Tabs.List` can override it. */
  variant?: TabsVariant
  /** Default size for the list. */
  /** @default sm */
  size?: TabsSize
  /** Default browser-tab attach edge. */
  edge?: TabsEdge
  class?: string
  children: JSX.Element
}

const Root: ParentComponent<TabsRootProps> = (props) => {
  const [value, setValue] = createControllableSignal<string>({
    value: () => props.value,
    defaultValue: props.defaultValue,
    onChange: (next) => props.onValueChange?.(next),
  })

  const machineId = createId('tabs')
  const { api } = createZagApi<TabsApi>(zag.machine, zag.connect, () => ({
    id: machineId,
    value: value(),
    orientation: props.orientation ?? 'horizontal',
    activationMode: props.activationMode ?? 'automatic',
    onValueChange: (details: { value: string }) => setValue(details.value),
  }))

  const config = (): TabsConfig => ({
    orientation: props.orientation ?? 'horizontal',
    variant: props.variant ?? 'underline',
    size: props.size ?? 'sm',
    edge: props.edge ?? 'start',
  })

  return (
    <TabsContext.Provider value={api}>
      <TabsConfigContext.Provider value={config}>
        <div
          {...api().getRootProps()}
          data-slot="tabs"
          class={cn(
            'flex flex-col',
            'data-[orientation=vertical]:flex-row data-[orientation=vertical]:gap-4',
            props.class,
          )}
        >
          {props.children}
        </div>
      </TabsConfigContext.Provider>
    </TabsContext.Provider>
  )
}

export interface TabsListProps {
  variant?: TabsVariant
  /** @default sm */
  size?: TabsSize
  /** browser-tab + vertical only: the edge the tabs attach to. */
  edge?: TabsEdge
  class?: string
  children?: JSX.Element
}

const List: ParentComponent<TabsListProps> = (props) => {
  const api = useTabsApi()
  const root = useContext(TabsConfigContext)
  const config = (): TabsConfig => ({
    orientation: root().orientation,
    variant: props.variant ?? root().variant,
    size: props.size ?? root().size,
    edge: props.edge ?? root().edge,
  })

  let trackEl: HTMLDivElement | undefined
  const indicator = createTabIndicator({
    track: () => trackEl,
    variant: () => config().variant,
    orientation: () => config().orientation,
    signal: () => [
      api().value,
      config().variant,
      config().size,
      config().orientation,
      config().edge,
    ],
    activeSelector: '[data-slot="tab-trigger"][data-selected]',
  })

  const isPill = () => {
    const variant = config().variant
    return variant === 'subtle' || variant === 'ghost'
  }
  const isBrowser = () => config().variant === 'browser-tab'
  const browserBase = (): BrowserTabBase => {
    if (config().variant !== 'browser-tab') return 'none'
    return config().orientation === 'vertical' ? config().edge : 'default'
  }

  const listClass = () =>
    cn(
      isPill()
        ? 'relative isolate inline-flex shrink-0 self-start'
        : isBrowser()
          ? 'relative isolate flex'
          : 'relative flex',
      config().orientation === 'vertical' ? 'flex-col' : 'items-center',
      ...tabTrackClasses({
        variant: config().variant,
        size: config().size,
        orientation: config().orientation,
        edge: config().edge,
      }),
      props.class,
    )

  const indicatorClasses = () =>
    cn(
      'absolute motion-reduce:transition-none',
      indicator.animated() &&
        `transition-[width,height,transform] ${tabIndicatorMotionClasses}`,
    )

  return (
    <TabsListContext.Provider value={config}>
      <div
        {...api().getListProps()}
        ref={(el) => {
          trackEl = el
        }}
        data-slot="tabs-list"
        data-variant={config().variant}
        data-size={config().size}
        class={listClass()}
      >
        <Show when={config().variant === 'underline'}>
          <div
            data-slot="tab-indicator"
            aria-hidden="true"
            class={cn(indicatorClasses(), 'bg-outline-gray-8')}
            style={indicator.style()}
          />
        </Show>
        <Show when={isPill()}>
          <div aria-hidden="true" class={cn(...tabIndicatorClipClasses())}>
            <div
              data-slot="tab-indicator"
              aria-hidden="true"
              class={cn(
                'pointer-events-none',
                indicatorClasses(),
                ...tabIndicatorSurfaceClasses(config().variant, config().size),
              )}
              style={indicator.style()}
            />
          </div>
        </Show>
        <Show when={isBrowser()}>
          <div
            data-slot="tab-indicator"
            aria-hidden="true"
            class={cn(
              'pointer-events-none',
              indicatorClasses(),
              tabRadiusClasses('browser-tab', config().size, browserBase()),
              browserTabCardClasses(browserBase()),
            )}
            style={indicator.style()}
          />
        </Show>
        {props.children}
      </div>
    </TabsListContext.Provider>
  )
}

export interface TabsTriggerProps {
  value: string
  disabled?: boolean
  /** A `lucide-*` string or component, rendered before the label. */
  icon?: IconProp
  /** Convenience label; `children` wins when both are set. */
  label?: string
  class?: string
  children?: JSX.Element
}

const Trigger: ParentComponent<TabsTriggerProps> = (props) => {
  const api = useTabsApi()
  const config = useTabsListConfig()
  const selected = () => api().value === props.value
  const hasContent = () =>
    props.children !== undefined || props.label !== undefined

  // browser-tab + vertical: the active tab rounds the attached edge; inactive
  // tabs keep the default shape.
  const pillBrowserBase = (): BrowserTabBase => {
    if (config().variant !== 'browser-tab') return 'none'
    if (config().orientation !== 'vertical') return 'default'
    return selected() ? config().edge : 'default'
  }

  return (
    <button
      {...api().getTriggerProps({
        value: props.value,
        disabled: props.disabled,
      })}
      data-slot="tab-trigger"
      data-state={selected() ? 'active' : 'inactive'}
      class={cn(
        tabShellClasses,
        tabRadiusClasses(config().variant, config().size, pillBrowserBase()),
        config().orientation === 'vertical' && 'w-full',
        'relative',
        props.class,
      )}
    >
      <span
        class={cn(
          tabPillClasses({
            variant: config().variant,
            size: config().size,
            active: selected(),
            orientation: config().orientation,
            iconOnly: !hasContent(),
            browserTabBase: pillBrowserBase(),
          }),
          config().orientation === 'vertical' && 'w-full justify-start',
        )}
      >
        <Show when={props.icon}>
          <Icon icon={props.icon} class="size-4 shrink-0" />
        </Show>
        <span class="min-w-0 truncate">{props.children ?? props.label}</span>
      </span>
    </button>
  )
}

export interface TabsContentProps {
  value: string
  class?: string
  children?: JSX.Element
}

const Content: ParentComponent<TabsContentProps> = (props) => {
  const api = useTabsApi()
  return (
    <div
      {...api().getContentProps({ value: props.value })}
      data-slot="tabs-content"
      class={cn('focus-visible:outline-none', props.class)}
    >
      {props.children}
    </div>
  )
}

export const Tabs = { Root, List, Trigger, Content }

export type { TabsRootProps as TabsProps }

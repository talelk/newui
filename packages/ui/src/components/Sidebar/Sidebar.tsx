import {
  type Accessor,
  type Component,
  createContext,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
  type ParentComponent,
  Show,
  splitProps,
  useContext,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { createControllableSignal } from '../../lib/controllable'
import { createId } from '../../lib/id'
import { createMediaQuery } from '../../lib/media'
import { cn } from '../../lib/tv'
import { Badge } from '../Badge'
import { Icon, type IconProp } from '../Icon'
import { TextInput } from '../TextInput'
import { TooltipContent, TooltipRoot, TooltipTrigger } from '../Tooltip'

/** Width below which an uncontrolled sidebar collapses on its own. */
const COLLAPSE_QUERY = '(max-width: 639px)'

interface SidebarContextValue {
  collapsed: Accessor<boolean>
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: () => false,
  toggle: () => {},
})

/** Collapsed state + toggle, shared with every part inside a `Sidebar`. */
export function useSidebar(): SidebarContextValue {
  return useContext(SidebarContext)
}

export interface SidebarProps {
  /** Allows the sidebar to collapse. Default `true`. */
  collapsible?: boolean
  /** Expanded width as a CSS length. */
  width?: string
  /** Collapsed width as a CSS length. */
  collapsedWidth?: string
  /** Controlled collapsed state. Unset: collapses below the `sm` breakpoint. */
  collapsed?: boolean
  /** Fired on every user toggle, controlled or not. */
  onCollapsedChange?: (collapsed: boolean) => void
  /** Accessible name of the `<nav>` landmark. Default `Main`. */
  ariaLabel?: string
  /**
   * Bind ⌘B / Ctrl+B to the toggle. Default `true` — it is the shortcut every
   * editor-trained user tries first, and the one a collapsed rail is for.
   */
  shortcut?: boolean
  class?: string
  children?: JSX.Element
}

export const Sidebar: ParentComponent<SidebarProps> = (props) => {
  const [local] = splitProps(props, [
    'collapsible',
    'width',
    'collapsedWidth',
    'collapsed',
    'onCollapsedChange',
    'ariaLabel',
    'shortcut',
    'class',
    'children',
  ])
  const isMobile = createMediaQuery(COLLAPSE_QUERY)
  const [internal, setInternal] = createSignal<boolean | null>(null)

  const collapsible = () => local.collapsible ?? true
  const shouldCollapse = () =>
    collapsible() &&
    (local.collapsed !== undefined
      ? local.collapsed
      : (internal() ?? isMobile()))

  const toggle = () => {
    const next = !shouldCollapse()
    if (local.collapsed === undefined) setInternal(next)
    local.onCollapsedChange?.(next)
  }

  onMount(() => {
    if (local.shortcut === false || !collapsible()) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'b') return
      if (!event.metaKey && !event.ctrlKey) return
      event.preventDefault()
      toggle()
    }
    window.addEventListener('keydown', onKey)
    onCleanup(() => window.removeEventListener('keydown', onKey))
  })

  return (
    <SidebarContext.Provider value={{ collapsed: shouldCollapse, toggle }}>
      <nav
        data-slot="sidebar"
        data-state={shouldCollapse() ? 'collapsed' : 'expanded'}
        aria-label={local.ariaLabel ?? 'Main'}
        style={{
          width: shouldCollapse()
            ? (local.collapsedWidth ?? '3rem')
            : (local.width ?? '15rem'),
        }}
        class={cn(
          'flex h-full shrink-0 flex-col overflow-x-hidden bg-surface-sidebar transition-[width] duration-300 ease-in-out',
          local.class,
        )}
      >
        {local.children}
      </nav>
    </SidebarContext.Provider>
  )
}

export interface SidebarHeaderProps {
  title?: JSX.Element
  subtitle?: JSX.Element
  /** Leading logo: an image URL or a component. */
  logo?: IconProp
  /** Render the leading logo/initial box. Default `true`. */
  showLogo?: boolean
  actions?: JSX.Element
  class?: string
}

function initialOf(title: JSX.Element): string {
  return typeof title === 'string' && title.length > 0
    ? title.charAt(0).toUpperCase()
    : ''
}

export const SidebarHeader: ParentComponent<SidebarHeaderProps> = (props) => {
  const [local] = splitProps(props, [
    'title',
    'subtitle',
    'logo',
    'showLogo',
    'actions',
    'class',
  ])
  const { collapsed } = useSidebar()
  const showLogo = () => local.showLogo !== false

  return (
    <div
      data-slot="sidebar-header"
      class={cn(
        'flex h-12 shrink-0 items-center justify-between gap-2 px-1',
        local.class,
      )}
    >
      <div class="flex min-w-0 flex-1 items-center">
        <Show when={showLogo()}>
          <div class="size-7 shrink-0 overflow-hidden rounded-[6px]">
            <Show
              when={local.logo}
              fallback={
                <div class="flex h-full w-full items-center justify-center bg-surface-gray-4 text-ink-gray-7">
                  {initialOf(local.title)}
                </div>
              }
            >
              {(logo) => (
                <Show
                  when={typeof logo() === 'string'}
                  fallback={
                    <Dynamic
                      component={logo() as Component<{ class?: string }>}
                      class="h-full w-full"
                    />
                  }
                >
                  <img
                    src={logo() as string}
                    alt="Logo"
                    class="h-full w-full object-cover"
                  />
                </Show>
              )}
            </Show>
          </div>
        </Show>
        <Show when={!collapsed()}>
          <div class="flex min-w-0 flex-1 flex-col">
            <Show when={local.title}>
              <span class="truncate text-base-semibold leading-tighter text-ink-gray-9">
                {local.title}
              </span>
            </Show>
            <Show when={local.subtitle}>
              <span class="mt-0.5 truncate text-caption leading-tighter text-ink-gray-7">
                {local.subtitle}
              </span>
            </Show>
          </div>
        </Show>
      </div>
      {local.actions}
    </div>
  )
}

export interface SidebarLabelProps {
  /**
   * While collapsed, swap the label for a horizontal divider so groups stay
   * visually separated.
   */
  divider?: boolean
  class?: string
  children?: JSX.Element
}

export const SidebarLabel: ParentComponent<SidebarLabelProps> = (props) => {
  const [local] = splitProps(props, ['divider', 'class', 'children'])
  const { collapsed } = useSidebar()
  return (
    <div
      data-slot="sidebar-label"
      class={cn('relative flex h-7 items-center pl-2', local.class)}
    >
      <div
        class={cn(
          'text-base leading-tighter text-ink-gray-7 transition-all duration-300 ease-in-out',
          collapsed() ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100',
        )}
      >
        {local.children}
      </div>
      <Show when={local.divider && collapsed()}>
        <div aria-hidden="true" class="absolute inset-0 flex items-center">
          <hr class="w-full border-t border-ink-gray-3" />
        </div>
      </Show>
    </div>
  )
}

export interface SidebarItemProps {
  active?: boolean
  /** Accessible name and tooltip while collapsed. Defaults to string children. */
  label?: string
  /** Leading glyph when `prefix` is unset: a `lucide-*` string or a component. */
  icon?: IconProp
  /**
   * In-app destination (CONTEXT: `route` is in-app, `href` is external). Wins
   * over `href`. Renders an anchor with a plain `href`; pair it with `onClick`
   * to intercept the click and navigate with your router.
   */
  route?: string
  /** External URL, opened in a new tab unless `target` says otherwise. */
  href?: string
  target?: string
  class?: string
  prefix?: JSX.Element
  suffix?: JSX.Element
  children?: JSX.Element
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>
}

export const SidebarItem: ParentComponent<SidebarItemProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'active',
    'label',
    'icon',
    'route',
    'href',
    'target',
    'class',
    'prefix',
    'suffix',
    'children',
  ])
  const { collapsed } = useSidebar()
  const labelText = () =>
    local.label ??
    (typeof local.children === 'string' ? local.children : undefined)
  /**
   * The label only has a job while the item is an icon in a rail. Returning the
   * string (rather than a boolean) is what lets `Show` narrow the accessor to
   * `string`, so the trigger can use it as its accessible name.
   */
  const collapsedLabel = () => (collapsed() ? labelText() : undefined)
  const tag = () => ((local.route ?? local.href) ? 'a' : 'button')
  const rootProps = () => {
    if (tag() === 'a') {
      if (local.route) return { href: local.route }
      return {
        href: local.href,
        target: local.target ?? '_blank',
        rel: 'noreferrer noopener',
      }
    }
    return { type: 'button' as const }
  }

  const rowClasses = () =>
    cn(
      'relative flex h-8 w-full items-center rounded-3 text-interface text-ink-gray-6',
      'transition-colors hover:bg-surface-gray-2 motion-reduce:transition-none',
      'data-[active]:bg-surface-blue-1 data-[active]:text-ink-blue-8',
      local.class,
    )
  const innerClasses = () =>
    cn(
      'flex h-full min-w-0 flex-1 items-center gap-2 rounded-3 px-2 text-start',
      'focus-visible:focus-ring-blue',
      collapsed() && 'justify-center px-0',
    )

  const content = () => (
    <>
      <Show when={local.prefix ?? local.icon} fallback={null}>
        <span class="shrink-0">
          {local.prefix ?? <Icon icon={local.icon} class="size-4" />}
        </span>
      </Show>
      <span class={cn('flex-1 truncate', collapsed() && 'sr-only')}>
        {local.children}
      </span>
    </>
  )

  const inner = () => (
    <Show
      when={collapsedLabel()}
      fallback={
        <Dynamic
          component={tag()}
          {...rest}
          {...rootProps()}
          data-active={local.active ? '' : undefined}
          aria-current={local.active ? 'page' : undefined}
          class={innerClasses()}
        >
          {content()}
        </Dynamic>
      }
    >
      {(label) => (
        // The tooltip *is* the item's tooltip: a rail of bare icons is unusable
        // without one, and `title` takes a second to appear and cannot be
        // styled. `TooltipTrigger` renders the element, so there is no wrapper
        // button-in-button.
        <TooltipRoot placement="right" openDelay={300}>
          <TooltipTrigger
            {...rest}
            as={tag()}
            {...rootProps()}
            data-active={local.active ? '' : undefined}
            data-collapsed=""
            aria-current={local.active ? 'page' : undefined}
            aria-label={label()}
            class={innerClasses()}
          >
            {content()}
          </TooltipTrigger>
          <TooltipContent>{label()}</TooltipContent>
        </TooltipRoot>
      )}
    </Show>
  )

  return (
    <div
      data-slot="sidebar-item"
      data-active={local.active ? '' : undefined}
      class={rowClasses()}
    >
      {inner()}
      {/* The suffix sits beside the link, not inside it, so a menu button
          there is valid HTML (the frappe-ui row anatomy). */}
      <Show when={!collapsed() && local.suffix}>
        <span class="flex shrink-0 items-center pe-2">{local.suffix}</span>
      </Show>
    </div>
  )
}

export interface SidebarSearchProps {
  value?: string
  placeholder?: string
  /**
   * Trailing slot inside the field — a `⌘K` hint, usually, so the shortcut is
   * discovered where the search is rather than in a menu.
   */
  hint?: JSX.Element
  onInput?: (value: string) => void
  class?: string
}

/**
 * The filter a sidebar carries above its groups.
 *
 * It hides itself while the sidebar is collapsed: there is nowhere to type into
 * an icon rail, and a field crushed into 3rem is a bug that looks deliberate.
 */
export function SidebarSearch(props: SidebarSearchProps): JSX.Element {
  const { collapsed } = useSidebar()
  return (
    <Show when={!collapsed()}>
      <div data-slot="sidebar-search" class={cn('px-2 pb-1', props.class)}>
        <TextInput
          size="sm"
          type="search"
          value={props.value ?? ''}
          placeholder={props.placeholder ?? 'Search…'}
          aria-label={props.placeholder ?? 'Search'}
          prefix={<Icon icon="lucide-search" class="size-4" />}
          suffix={props.hint}
          onInput={(event) => props.onInput?.(event.currentTarget.value)}
        />
      </div>
    </Show>
  )
}

export interface SidebarTriggerProps {
  /** Tooltip copy. Defaults to Collapse/Expand, per state. */
  label?: string
  class?: string
}

/**
 * The button that folds the sidebar to its rail.
 *
 * A part rather than a prop, because where it goes is a layout decision — in the
 * header, at the end of the rail, in a page toolbar — and every one of those is
 * the same control. `SidebarCollapseToggle` is the frappe-shaped variant (a
 * `SidebarItem` at the bottom of the list); this is the compact one.
 */
export function SidebarTrigger(props: SidebarTriggerProps): JSX.Element {
  const { collapsed, toggle } = useSidebar()
  const text = () =>
    props.label ?? (collapsed() ? 'Expand sidebar' : 'Collapse sidebar')

  return (
    <TooltipRoot placement="bottom" openDelay={300}>
      <TooltipTrigger
        type="button"
        onClick={() => toggle()}
        aria-expanded={!collapsed()}
        class={cn(
          'grid size-8 shrink-0 place-items-center rounded-3 text-ink-gray-6 transition-colors',
          'hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring motion-reduce:transition-none',
          props.class,
        )}
      >
        <span class="sr-only">{text()}</span>
        <Icon
          icon="lucide-panel-left"
          class={cn(
            'size-4 transition-transform motion-reduce:transition-none',
            collapsed() && 'rotate-180',
          )}
        />
      </TooltipTrigger>
      <TooltipContent>{`${text()} · ⌘B`}</TooltipContent>
    </TooltipRoot>
  )
}

export interface SidebarRailProps {
  class?: string
  /** Accessible name of the `<nav>` landmark. Default `Applications`. */
  label?: string
  children?: JSX.Element
}

export const SidebarRail: ParentComponent<SidebarRailProps> = (props) => (
  <nav
    aria-label={props.label ?? 'Applications'}
    data-slot="sidebar-rail"
    class={cn(
      'flex h-full w-[50px] shrink-0 flex-col items-center bg-surface-sidebar px-[11px] pb-3 pt-2.5',
      props.class,
    )}
  >
    {props.children}
  </nav>
)

export type SidebarRailItemVariant = 'subtle' | 'ghost'
export type SidebarRailItemBadgeStyle = 'count' | 'dot'

export interface SidebarRailItemProps {
  active?: boolean
  /** Tooltip text and the base of the accessible label. */
  label?: string
  /** Second tooltip line, e.g. "12 members". */
  description?: string
  /** Icon class or component; ignored when `children` is set. */
  icon?: IconProp
  /** Visual treatment. `subtle` fills the cell; `ghost` is transparent. */
  variant?: SidebarRailItemVariant
  /** Unread count. Drives the badge and folds into the accessible label. */
  badge?: number
  /** How the badge renders: a count pill or a small dot. */
  badgeStyle?: SidebarRailItemBadgeStyle
  /**
   * In-app destination (CONTEXT: `route` is in-app, `href` is external). Wins
   * over `href`. Renders an anchor with a plain `href`; pair it with `onClick`
   * to intercept the click and navigate with your router.
   */
  route?: string
  /** External URL, opened in a new tab unless `target` says otherwise. */
  href?: string
  target?: string
  class?: string
  children?: JSX.Element
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>
}

export const SidebarRailItem: ParentComponent<SidebarRailItemProps> = (
  props,
) => {
  const [local, rest] = splitProps(props, [
    'active',
    'label',
    'description',
    'icon',
    'variant',
    'badge',
    'badgeStyle',
    'route',
    'href',
    'target',
    'class',
    'children',
  ])
  const tag = () => ((local.route ?? local.href) ? 'a' : 'button')
  const rootProps = () => {
    if (tag() === 'a') {
      if (local.route) return { href: local.route }
      return {
        href: local.href,
        target: local.target ?? '_blank',
        rel: 'noreferrer noopener',
      }
    }
    return { type: 'button' as const }
  }
  const variant = () => local.variant ?? 'subtle'
  const badge = () => local.badge ?? 0
  const showIndicator = () => variant() === 'subtle' && Boolean(local.active)

  const ariaLabel = () =>
    badge() > 0 ? `${local.label ?? ''}, ${badge()} unread` : local.label
  const tooltipDescription = () => {
    if (local.description !== undefined) return local.description
    if ((local.badgeStyle ?? 'count') === 'dot' && badge() > 0)
      return `${badge()} unread`
    return undefined
  }
  const formattedCount = () => (badge() > 99 ? '99+' : String(badge()))

  return (
    <TooltipRoot placement="right" openDelay={0}>
      <TooltipTrigger
        {...rest}
        as={tag()}
        {...rootProps()}
        data-slot="sidebar-rail-item"
        data-variant={variant()}
        data-active={local.active ? '' : undefined}
        aria-current={local.active ? 'page' : undefined}
        aria-label={ariaLabel()}
        class={cn(
          'relative grid size-7 shrink-0 place-items-center text-base transition',
          'focus-visible:ring-0 focus-visible:focus-ring',
          variant() === 'subtle'
            ? 'rounded-[7px]'
            : 'rounded-4 text-ink-gray-8',
          variant() === 'subtle'
            ? local.active
              ? 'bg-surface-gray-4 has-[img]:bg-transparent'
              : 'bg-surface-gray-3 has-[img]:bg-transparent'
            : local.active
              ? 'bg-surface-elevation-3 text-ink-gray-8 shadow-sm'
              : 'bg-transparent text-ink-gray-8 hover:bg-surface-gray-3',
          local.class,
        )}
      >
        <Show when={showIndicator()}>
          <span
            data-slot="sidebar-rail-item-indicator"
            aria-hidden="true"
            class="absolute -start-[11px] top-[50%] h-7 w-1 -translate-y-[50%] rounded-e-4 bg-surface-gray-8"
          />
        </Show>
        <Show
          when={local.children}
          fallback={<Icon icon={local.icon} class="size-4" />}
        >
          <span aria-hidden={local.label ? true : undefined} class="contents">
            {local.children}
          </span>
        </Show>
        <Show when={badge() > 0 && (local.badgeStyle ?? 'count') === 'count'}>
          <span class="pointer-events-none absolute -end-0.5 -top-0.5 inline-flex rounded-full border border-surface-base">
            <Badge variant="solid" theme="red" size="sm" aria-hidden="true">
              {formattedCount()}
            </Badge>
          </span>
        </Show>
        <Show when={badge() > 0 && local.badgeStyle === 'dot'}>
          <span
            data-slot="sidebar-rail-item-badge-dot"
            aria-hidden="true"
            class="pointer-events-none absolute -end-0.5 -top-0.5 block size-2 rounded-full border border-surface-base bg-surface-red-6"
          />
        </Show>
      </TooltipTrigger>
      <TooltipContent>
        <div class="leading-relaxed">
          <div>{local.label}</div>
          <Show when={tooltipDescription()}>
            <div class="text-xs text-ink-gray-6">{tooltipDescription()}</div>
          </Show>
        </div>
      </TooltipContent>
    </TooltipRoot>
  )
}

export interface SidebarCollapseToggleProps {
  class?: string
  /** Label while collapsed (default `Expand`). */
  expandLabel?: string
  /** Label while expanded (default `Collapse`). */
  collapseLabel?: string
}

/** A `SidebarItem` that toggles the sidebar's collapsed state. */
export function SidebarCollapseToggle(
  props: SidebarCollapseToggleProps,
): JSX.Element {
  const { collapsed, toggle } = useSidebar()
  const text = () =>
    collapsed()
      ? (props.expandLabel ?? 'Expand')
      : (props.collapseLabel ?? 'Collapse')

  return (
    <SidebarItem
      label={text()}
      class={props.class}
      onClick={toggle}
      prefix={
        <span
          class={cn(
            'lucide-panel-right-open size-4 transition-transform duration-300',
            collapsed() && 'rotate-180',
          )}
          aria-hidden="true"
        />
      }
    >
      {text()}
    </SidebarItem>
  )
}

export interface SidebarSectionProps {
  /** Group heading. Omit for a heading-less group. */
  label?: JSX.Element
  /** Makes the heading a disclosure that collapses the body. */
  collapsible?: boolean
  /** Controlled collapsed state. Unset: the section keeps its own. */
  collapsed?: boolean
  /** Uncontrolled initial collapsed state. */
  defaultCollapsed?: boolean
  /** Fired on every toggle, controlled or not. */
  onCollapsedChange?: (collapsed: boolean) => void
  class?: string
  children?: JSX.Element
}

/**
 * A labelled, optionally collapsible group. It owns the heading + collapse
 * chrome only; compose `SidebarItem`s (or anything else) as children.
 */
export function SidebarSection(props: SidebarSectionProps): JSX.Element {
  const [local] = splitProps(props, [
    'label',
    'collapsible',
    'collapsed',
    'defaultCollapsed',
    'onCollapsedChange',
    'class',
    'children',
  ])
  const [collapsed, setCollapsed] = createControllableSignal<boolean>({
    value: () => local.collapsed,
    defaultValue: local.defaultCollapsed ?? false,
    onChange: (value) => local.onCollapsedChange?.(value),
  })
  const { collapsed: sidebarCollapsed } = useSidebar()
  const headingId = createId('sidebar-section')
  const bodyId = createId('sidebar-section-body')

  return (
    <div
      data-slot="sidebar-section"
      data-state={collapsed() ? 'collapsed' : 'expanded'}
      class={cn('mt-2 flex flex-col', local.class)}
    >
      <Show when={local.label}>
        <div class="relative flex items-center gap-1 px-2 py-1.5">
          <h3
            id={headingId}
            class={cn(
              'text-sm leading-tighter text-ink-gray-6 transition-all duration-300',
              sidebarCollapsed()
                ? 'w-0 overflow-hidden opacity-0'
                : 'w-auto opacity-100',
            )}
          >
            <Show when={local.collapsible} fallback={local.label}>
              <button
                type="button"
                class="flex items-center gap-1 rounded-4 focus-visible:focus-ring"
                aria-expanded={!collapsed()}
                aria-controls={bodyId}
                onClick={() => setCollapsed(!collapsed())}
              >
                {local.label}
                <span
                  class={cn(
                    'lucide-chevron-right size-4 text-ink-gray-6 transition-transform duration-300',
                    !collapsed() && 'rotate-90',
                  )}
                  aria-hidden="true"
                />
              </button>
            </Show>
          </h3>
          <Show when={sidebarCollapsed()}>
            <div aria-hidden="true" class="absolute inset-0 flex items-center">
              <hr class="w-full border-t border-outline-gray-2" />
            </div>
          </Show>
        </div>
      </Show>
      <Show when={!collapsed()}>
        <div id={bodyId} class="flex flex-col">
          {local.children}
        </div>
      </Show>
    </div>
  )
}

export interface SidebarCardAction {
  label: string
  /** `dismiss` removes the card the same way its close button does. */
  onClick?: (context: { dismiss: () => void }) => void
}

export interface SidebarCardProps {
  theme?: 'gray' | 'blue' | 'green' | 'amber' | 'red'
  title?: JSX.Element
  description?: JSX.Element
  /** A `lucide-*` string; falls back to a theme default. */
  icon?: string
  action?: SidebarCardAction
  dismissible?: boolean
  onDismiss?: () => void
  class?: string
  children?: JSX.Element
}

const CARD_ICON: Record<NonNullable<SidebarCardProps['theme']>, string> = {
  gray: 'lucide-info',
  blue: 'lucide-info',
  green: 'lucide-circle-check',
  amber: 'lucide-triangle-alert',
  red: 'lucide-circle-alert',
}

const CARD_ICON_INK: Record<NonNullable<SidebarCardProps['theme']>, string> = {
  gray: 'text-ink-gray-8',
  blue: 'text-ink-blue-7',
  green: 'text-ink-green-7',
  amber: 'text-ink-amber-7',
  red: 'text-ink-red-7',
}

/** A compact status card for the sidebar: icon, copy and an optional action. */
export function SidebarCard(props: SidebarCardProps): JSX.Element {
  const [local] = splitProps(props, [
    'theme',
    'title',
    'description',
    'icon',
    'action',
    'dismissible',
    'onDismiss',
    'class',
    'children',
  ])
  const theme = () => local.theme ?? 'gray'

  return (
    <div
      data-slot="sidebar-card"
      data-theme={theme()}
      class={cn(
        'flex flex-col gap-1 rounded-5 border border-outline-gray-2 bg-surface-base p-3 text-ink-gray-8',
        local.class,
      )}
    >
      <div class="flex items-start gap-2">
        <Icon
          icon={local.icon ?? CARD_ICON[theme()]}
          class={cn('mt-0.5 size-4 shrink-0', CARD_ICON_INK[theme()])}
        />
        <div class="flex flex-1 flex-col gap-0.5">
          <Show when={local.title}>
            <span class="text-sm-medium leading-tighter">{local.title}</span>
          </Show>
          <Show when={local.description}>
            <span class="text-p-sm text-ink-gray-6">{local.description}</span>
          </Show>
          <Show when={local.children}>
            <div class="text-p-sm text-ink-gray-6">{local.children}</div>
          </Show>
        </div>
        <Show when={local.dismissible}>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => local.onDismiss?.()}
            class="-m-1 shrink-0 rounded-3 p-1 text-ink-gray-5 transition-colors hover:text-ink-gray-8"
          >
            <span class="lucide-x size-3.5" aria-hidden="true" />
          </button>
        </Show>
      </div>
      <Show when={local.action}>
        {(action) => (
          <button
            type="button"
            onClick={() =>
              action().onClick?.({ dismiss: () => local.onDismiss?.() })
            }
            class="w-fit rounded-3 px-1.5 py-0.5 text-sm-medium text-ink-blue-6 transition-colors hover:bg-surface-gray-2 focus-visible:focus-ring-blue motion-reduce:transition-none"
          >
            {action().label}
          </button>
        )}
      </Show>
    </div>
  )
}

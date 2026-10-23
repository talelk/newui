import {
  Icon,
  type IconProp,
  TextInput,
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from '@talelk/newui-atoms'
import {
  cn,
  createControllableSignal,
  createId,
  createMediaQuery,
} from '@talelk/newui-atoms/internal'
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

/** Width below which an uncontrolled sidebar collapses on its own. */
const COLLAPSE_QUERY = '(max-width: 639px)'

interface SidebarContextValue {
  collapsed: Accessor<boolean>
  toggle: () => void
  /** Whether `⌘B`/`Ctrl+B` is bound here, so chrome only advertises a real hint. */
  shortcut: Accessor<boolean>
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: () => false,
  toggle: () => {},
  shortcut: () => false,
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
  const shortcut = () => local.shortcut !== false && collapsible()
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
    if (!shortcut()) return
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
    <SidebarContext.Provider
      value={{ collapsed: shouldCollapse, toggle, shortcut }}
    >
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
          'flex h-full shrink-0 flex-col overflow-x-hidden bg-surface-sidebar transition-[width] duration-slow ease-in-out',
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
        'flex h-12 shrink-0 items-center justify-between gap-2 px-2',
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
  /** Trailing control of the group row: sort, filter, add. Hidden in the rail. */
  action?: JSX.Element
  class?: string
  children?: JSX.Element
}

export const SidebarLabel: ParentComponent<SidebarLabelProps> = (props) => {
  const [local] = splitProps(props, ['divider', 'action', 'class', 'children'])
  const { collapsed } = useSidebar()
  return (
    <div
      data-slot="sidebar-label"
      class={cn('relative flex h-8 items-center px-2 pt-2', local.class)}
    >
      <div
        class={cn(
          'text-xs font-medium text-ink-gray-6',
          collapsed() ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100',
        )}
      >
        {local.children}
      </div>
      <Show when={local.action && !collapsed()}>
        <span class="ms-auto flex shrink-0 items-center pe-1">
          {local.action}
        </span>
      </Show>
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
      'group relative flex h-8 w-full items-center rounded-control text-interface text-ink-gray-7',
      'transition-colors hover:bg-surface-gray-2 motion-reduce:transition-none',
      'data-[active]:bg-surface-blue-1 data-[active]:font-medium data-[active]:text-ink-blue-8',
      local.class,
    )
  const innerClasses = () =>
    cn(
      'flex h-full min-w-0 flex-1 items-center gap-2 rounded-control px-2 text-start',
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
 * an icon-only sidebar, and a field crushed into 3rem is a bug that looks deliberate.
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
  /** Tooltip and accessible copy. Defaults to Collapse sidebar/Expand sidebar. */
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
  const { collapsed, toggle, shortcut } = useSidebar()
  const text = () =>
    props.label ?? (collapsed() ? 'Expand sidebar' : 'Collapse sidebar')
  const hint = () => (shortcut() ? `${text()} · ⌘B` : text())

  return (
    <TooltipRoot placement="bottom" openDelay={300}>
      <TooltipTrigger
        type="button"
        onClick={() => toggle()}
        aria-expanded={!collapsed()}
        class={cn(
          'grid size-8 shrink-0 place-items-center rounded-control text-ink-gray-6 transition-colors',
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
      <TooltipContent>{hint()}</TooltipContent>
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
            'lucide-panel-right-open size-4 transition-transform duration-slow',
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
            // In the rail the label is clipped to zero width; `inert` keeps the
            // clipped toggle out of the tab order and the accessibility tree
            // while the fade/slide still animates.
            inert={sidebarCollapsed()}
            class={cn(
              'text-sm leading-tighter text-ink-gray-6 transition-all duration-slow',
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
                    'lucide-chevron-right size-4 text-ink-gray-6 transition-transform duration-slow',
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
      {/* Kept mounted and hidden rather than unmounted: the heading's
          `aria-controls` has to resolve in both states, and a control that
          points at nothing is worse than a hidden region. */}
      <div id={bodyId} hidden={collapsed()} class="flex flex-col">
        {local.children}
      </div>
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
  const { collapsed } = useSidebar()
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

  // A card is copy and an action; there is no rail form of it, so it unmounts
  // with the rest of the expanded content (like `SidebarSearch`).
  return (
    <Show when={!collapsed()}>
      <div
        data-slot="sidebar-card"
        data-theme={theme()}
        class={cn(
          'flex flex-col gap-control-gap rounded-card border border-outline-gray-2 bg-surface-base p-card-pad-compact text-ink-gray-8',
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
              class="w-fit rounded-3 px-1.5 py-0.5 text-sm-medium text-ink-blue-link transition-colors hover:bg-surface-gray-2 focus-visible:focus-ring-blue motion-reduce:transition-none"
            >
              {action().label}
            </button>
          )}
        </Show>
      </div>
    </Show>
  )
}

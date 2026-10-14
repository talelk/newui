import {
  type Accessor,
  createContext,
  createSignal,
  type JSX,
  onMount,
  type ParentComponent,
  Show,
  splitProps,
  useContext,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { createControllableSignal } from '../../lib/controllable'
import { createId } from '../../lib/id'
import { cn } from '../../lib/tv'
import { Dialog } from '../Dialog/Dialog'

/** The selected panel id. A nav item and its panel share one. */
export interface SettingsDialogProps {
  /** Controlled open state (P2). */
  open?: boolean
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Controlled selected panel id. */
  value?: string
  /** Uncontrolled initial selected panel id. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Accessible dialog title, rendered visually hidden. Defaults to `Settings`. */
  title?: JSX.Element
  /** Accessible dialog description, rendered visually hidden. */
  description?: JSX.Element
  /** Merged into the dialog content. */
  class?: string
  children?: JSX.Element
}

interface SettingsDialogContextValue {
  value: Accessor<string | undefined>
  setValue: (value: string) => void
  baseId: string
}

const SettingsDialogContext = createContext<SettingsDialogContextValue>()

function useSettingsDialog(part: string): SettingsDialogContextValue {
  const ctx = useContext(SettingsDialogContext)
  if (!ctx) throw new Error(`${part} must be used within <SettingsDialog.Root>`)
  return ctx
}

/**
 * A dialog for app settings: a sidebar of grouped tabs on the left and the
 * selected panel on the right.
 *
 * Built on the `Dialog` compound, so focus trapping, Escape and the backdrop
 * are Dialog's — this family only adds the two-pane layout. Panel selection is
 * a plain controllable signal (no extra machine): a nav item and its panel
 * share a `value`, and the selected one is reflected in `data-state` / ARIA.
 */
const Root: ParentComponent<SettingsDialogProps> = (props) => {
  const [local] = splitProps(props, [
    'open',
    'defaultOpen',
    'onOpenChange',
    'value',
    'defaultValue',
    'onValueChange',
    'title',
    'description',
    'class',
    'children',
  ])

  const [value, setValue] = createControllableSignal<string>({
    value: () => local.value,
    defaultValue: local.defaultValue,
    onChange: (next) => local.onValueChange?.(next),
  })

  const ctx: SettingsDialogContextValue = {
    value,
    setValue,
    baseId: createId('settings-dialog'),
  }

  return (
    <Dialog.Root
      open={local.open}
      defaultOpen={local.defaultOpen}
      onOpenChange={local.onOpenChange}
    >
      <SettingsDialogContext.Provider value={ctx}>
        <Dialog.Content
          class={cn(
            'flex h-[100dvh] min-h-0 w-screen max-w-none flex-col overflow-hidden rounded-none p-0',
            'sm:h-[min(860px,calc(100vh-8rem))] sm:max-h-[calc(100vh_-_8rem)] sm:min-h-[560px] sm:w-auto sm:max-w-4xl sm:flex-row sm:rounded-7',
            local.class,
          )}
        >
          <Dialog.Title class="sr-only">
            {local.title ?? 'Settings'}
          </Dialog.Title>
          <Dialog.Description class="sr-only">
            {local.description ??
              'Manage your settings across the panels in this dialog.'}
          </Dialog.Description>
          {local.children}
        </Dialog.Content>
      </SettingsDialogContext.Provider>
    </Dialog.Root>
  )
}

export interface SettingsSidebarProps {
  /** Merged into the sidebar. */
  class?: string
  children?: JSX.Element
}

/**
 * The navigation column. It is the `tablist`; put `SettingsNavGroup`s and
 * `SettingsNavItem`s inside it.
 */
const Sidebar: ParentComponent<SettingsSidebarProps> = (props) => (
  <div
    role="tablist"
    aria-orientation="vertical"
    data-slot="settings-sidebar"
    class={cn(
      'flex max-h-[38vh] w-full shrink-0 flex-col gap-4 overflow-y-auto border-b border-outline-gray-1 bg-surface-sidebar p-2',
      'sm:max-h-none sm:w-[220px] sm:border-b-0 sm:border-r',
      props.class,
    )}
  >
    {props.children}
  </div>
)

export interface SettingsNavGroupProps {
  /** Group heading shown above its items. */
  label?: JSX.Element
  /** Merged into the group. */
  class?: string
  children?: JSX.Element
}

/** A labelled group of `SettingsNavItem`s. */
const NavGroup: ParentComponent<SettingsNavGroupProps> = (props) => (
  <div
    role="presentation"
    data-slot="settings-nav-group"
    class={cn('flex flex-col', props.class)}
  >
    <Show when={props.label}>
      <div
        role="presentation"
        data-slot="settings-nav-group-label"
        class="flex h-7 items-center px-2 text-base text-ink-gray-5"
      >
        {props.label}
      </div>
    </Show>
    <div role="presentation" class="flex flex-col gap-0.5">
      {props.children}
    </div>
  </div>
)

export interface SettingsNavItemProps
  extends Omit<
    JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    'value' | 'name' | 'prefix' | 'onClick'
  > {
  /** Unique panel id — must match the `SettingsPanel` it controls. */
  value?: string
  /** Alias for `value`. */
  name?: string
  /**
   * Explicit selected state. Omit to derive it from the dialog's selected
   * `value`, which is the usual case.
   */
  active?: boolean
  /** Leading icon or avatar. */
  prefix?: JSX.Element
  /** Trailing badge or count. */
  suffix?: JSX.Element
  /** Merged into the item. */
  class?: string
  children?: JSX.Element
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>
}

/** One tab in the sidebar. Selecting it moves the dialog's `value`. */
const NavItem: ParentComponent<SettingsNavItemProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'value',
    'name',
    'active',
    'prefix',
    'suffix',
    'class',
    'children',
    'disabled',
    'onClick',
  ])

  const ctx = useSettingsDialog('SettingsNavItem')

  const itemValue = () => local.value ?? local.name
  const isActive = () => {
    const override = local.active
    if (override !== undefined) return override
    const current = itemValue()
    return current !== undefined && ctx.value() === current
  }
  const tabId = () => {
    const current = itemValue()
    return current === undefined ? undefined : `${ctx.baseId}-tab-${current}`
  }
  const panelId = () => {
    const current = itemValue()
    return current === undefined ? undefined : `${ctx.baseId}-panel-${current}`
  }

  return (
    <button
      {...rest}
      type="button"
      role="tab"
      id={tabId()}
      aria-selected={isActive()}
      aria-controls={panelId()}
      tabindex={isActive() ? 0 : -1}
      disabled={local.disabled}
      data-slot="settings-nav-item"
      data-state={isActive() ? 'active' : 'inactive'}
      class={cn(
        'flex h-7 w-full items-center gap-2 rounded-4 px-2 text-left text-base text-ink-gray-7 transition-colors',
        'focus-visible:focus-ring',
        'data-[state=inactive]:hover:bg-surface-gray-2',
        'data-[state=active]:bg-surface-elevation-3 data-[state=active]:shadow-sm',
        'disabled:cursor-not-allowed disabled:text-ink-gray-4',
        local.class,
      )}
      onClick={(event) => {
        const next = itemValue()
        if (next !== undefined) ctx.setValue(next)
        local.onClick?.(event)
      }}
    >
      <Show when={local.prefix}>
        <span
          data-slot="settings-nav-item-prefix"
          class="shrink-0 text-ink-gray-6"
        >
          {local.prefix}
        </span>
      </Show>
      <span class="min-w-0 flex-1 truncate">{local.children}</span>
      <Show when={local.suffix}>
        <span data-slot="settings-nav-item-suffix" class="shrink-0">
          {local.suffix}
        </span>
      </Show>
    </button>
  )
}

export interface SettingsContentProps {
  /** Merged into the content column. */
  class?: string
  children?: JSX.Element
}

/** The right-hand column that holds the panels. */
const Content: ParentComponent<SettingsContentProps> = (props) => (
  <div
    data-slot="settings-content"
    class={cn('flex min-h-0 flex-1 justify-stretch', props.class)}
  >
    {props.children}
  </div>
)

export interface SettingsPanelProps {
  /** Unique panel id — must match the `SettingsNavItem` that controls it. */
  value?: string
  /** Alias for `value`. */
  name?: string
  /** Merged into the panel. */
  class?: string
  children?: JSX.Element
}

/**
 * One tab's content column (`role="tabpanel"`). Compose a `SettingsHeader`
 * (fixed) and a `SettingsBody` (scrolls) inside so the header stays pinned.
 */
const Panel: ParentComponent<SettingsPanelProps> = (props) => {
  const [local] = splitProps(props, ['value', 'name', 'class', 'children'])
  const ctx = useSettingsDialog('SettingsPanel')

  const itemValue = () => local.value ?? local.name
  const isActive = () => {
    const current = itemValue()
    return current !== undefined && ctx.value() === current
  }
  const panelId = () => {
    const current = itemValue()
    return current === undefined ? undefined : `${ctx.baseId}-panel-${current}`
  }
  const tabId = () => {
    const current = itemValue()
    return current === undefined ? undefined : `${ctx.baseId}-tab-${current}`
  }

  return (
    <div
      role="tabpanel"
      id={panelId()}
      aria-labelledby={tabId()}
      hidden={!isActive()}
      data-slot="settings-panel"
      data-state={isActive() ? 'active' : 'inactive'}
      class={cn(
        'flex min-h-0 flex-1 flex-col focus-visible:outline-none',
        'data-[state=inactive]:hidden',
        local.class,
      )}
    >
      {local.children}
    </div>
  )
}

export interface SettingsHeaderProps {
  /** Convenience heading. Omit and use `children` for a custom header. */
  title?: JSX.Element
  /** Optional sub-heading under the title. */
  description?: JSX.Element
  /** Actions on the right of the default title header. */
  actions?: JSX.Element
  /** Merged into the header. */
  class?: string
  /** Replaces the entire default header. */
  children?: JSX.Element
}

/** Fixed (non-scrolling) header region of a panel. */
const Header: ParentComponent<SettingsHeaderProps> = (props) => (
  <div
    data-slot="settings-header"
    class={cn('shrink-0 px-[4.4rem] pt-10', props.class)}
  >
    <Show
      when={props.children}
      fallback={
        <div class="flex items-start justify-between gap-4">
          <div class="flex min-w-0 flex-col gap-1">
            <Show when={props.title}>
              <h2
                data-slot="settings-header-title"
                class="text-lg-semibold text-ink-gray-8"
              >
                {props.title}
              </h2>
            </Show>
            <Show when={props.description}>
              <p
                data-slot="settings-header-description"
                class="text-base text-ink-gray-6"
              >
                {props.description}
              </p>
            </Show>
          </div>
          <Show when={props.actions}>
            <div
              data-slot="settings-header-actions"
              class="flex shrink-0 items-center gap-2"
            >
              {props.actions}
            </div>
          </Show>
        </div>
      }
    >
      {props.children}
    </Show>
  </div>
)

export interface SettingsBodyProps {
  /** Merged into the scrolling region. */
  class?: string
  children?: JSX.Element
}

/** The scrolling region of a panel. */
const Body: ParentComponent<SettingsBodyProps> = (props) => (
  <div
    data-slot="settings-body"
    class={cn(
      'min-h-0 flex-1 overflow-y-auto overscroll-contain px-[4.4rem] pb-16',
      props.class,
    )}
  >
    {props.children}
  </div>
)

const CONTROL_SELECTOR =
  '[data-slot="control"], [role="switch"], [role="checkbox"], input, select, textarea'

export interface SettingsRowProps {
  /** Setting name, rendered on the left. */
  title: JSX.Element
  /** Optional helper text under the title. */
  description?: JSX.Element
  /** Explicit id to associate the title label with. Overrides auto-detection. */
  labelFor?: string
  /** Merged into the row. */
  class?: string
  /** The control on the right. */
  children?: JSX.Element
}

/**
 * A setting row: title and description on the left, the control on the right.
 * The title becomes a `<label>` for the control when one is detected (or
 * `labelFor` points at it), so the caller does not have to wire up an id.
 */
const Row: ParentComponent<SettingsRowProps> = (props) => {
  const [local] = splitProps(props, [
    'title',
    'description',
    'labelFor',
    'class',
    'children',
  ])

  let control: HTMLDivElement | undefined
  const [detectedFor, setDetectedFor] = createSignal<string | undefined>()
  const resolvedFor = () => local.labelFor ?? detectedFor()

  onMount(() => {
    if (local.labelFor) return
    const id = control?.querySelector<HTMLElement>(CONTROL_SELECTOR)?.id
    setDetectedFor(id || undefined)
  })

  return (
    <div
      data-slot="settings-row"
      class={cn('flex items-center gap-8 py-3.5', local.class)}
    >
      <div class="min-w-0 flex-1">
        <Dynamic
          component={resolvedFor() ? 'label' : 'div'}
          {...(resolvedFor() ? { for: resolvedFor() } : {})}
          data-slot="settings-row-title"
          class={cn(
            'block text-base-medium leading-tighter text-ink-gray-8',
            resolvedFor() ? 'cursor-pointer' : '',
          )}
        >
          {local.title}
        </Dynamic>
        <Show when={local.description}>
          <div
            data-slot="settings-row-description"
            class="mt-1 text-base leading-5 text-ink-gray-6"
          >
            {local.description}
          </div>
        </Show>
      </div>
      <div
        ref={(el) => {
          control = el
        }}
        data-slot="settings-row-control"
        class="flex shrink-0 items-start justify-end"
      >
        {local.children}
      </div>
    </div>
  )
}

export const SettingsDialog = {
  Root,
  Sidebar,
  NavGroup,
  NavItem,
  Content,
  Panel,
  Header,
  Body,
  Row,
}

export {
  Body as SettingsBody,
  Content as SettingsContent,
  Header as SettingsHeader,
  NavGroup as SettingsNavGroup,
  NavItem as SettingsNavItem,
  Panel as SettingsPanel,
  Row as SettingsRow,
  Sidebar as SettingsSidebar,
}

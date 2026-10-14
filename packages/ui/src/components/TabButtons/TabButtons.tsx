import { For, type JSX, Show, splitProps, untrack } from 'solid-js'
import { createControllableSignal } from '../../lib/controllable'
import {
  type BrowserTabBase,
  browserTabCardClasses,
  createTabIndicator,
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
} from '../../lib/tab-styles'
import { cn } from '../../lib/tv'
import { Icon, type IconProp } from '../Icon'

export interface TabButtonOption {
  label: string
  value: string
  /** A `lucide-*` string or component, rendered before the label. */
  icon?: IconProp
  disabled?: boolean
}

export interface TabButtonsProps {
  options: TabButtonOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Visual variant, shared with the `Tabs` family. Default `subtle`. */
  variant?: TabsVariant
  size?: TabsSize
  /** Stack the buttons in a column. */
  vertical?: boolean
  /** browser-tab + vertical only: the edge the tabs attach to. */
  edge?: TabsEdge
  /** Items share the container width equally instead of sizing to labels. */
  fluid?: boolean
  class?: string
}

/**
 * A segmented control: the "one of N" switch used in toolbars and headers.
 * Distinct from `Tabs`, which owns panels — this only picks a value. Shares
 * `Tabs`' variant/size vocabulary and its sliding-indicator system.
 */
export function TabButtons(props: TabButtonsProps): JSX.Element {
  const [local] = splitProps(props, [
    'options',
    'value',
    'defaultValue',
    'onValueChange',
    'variant',
    'size',
    'vertical',
    'edge',
    'fluid',
    'class',
  ])

  const [value, setValue] = createControllableSignal<string>({
    value: () => local.value,
    // Read once, deliberately: this is the uncontrolled initial value, not a
    // reactive read. `untrack` states that intent to the reactivity linter.
    defaultValue: untrack(
      () => local.defaultValue ?? local.options[0]?.value ?? '',
    ),
    onChange: (next) => local.onValueChange?.(next),
  })

  const variant = () => local.variant ?? 'subtle'
  const size = () => local.size ?? 'sm'
  const edge = () => local.edge ?? 'start'
  const orientation = (): TabOrientation =>
    local.vertical ? 'vertical' : 'horizontal'

  const isPill = () => variant() === 'subtle' || variant() === 'ghost'
  const isBrowser = () => variant() === 'browser-tab'
  const browserBase = (): BrowserTabBase => {
    if (!isBrowser()) return 'none'
    return local.vertical ? edge() : 'default'
  }
  const buttonBrowserBase = (option: TabButtonOption): BrowserTabBase => {
    if (!isBrowser()) return 'none'
    if (!local.vertical) return 'default'
    return value() === option.value ? edge() : 'default'
  }

  let trackEl: HTMLDivElement | undefined
  const indicator = createTabIndicator({
    track: () => trackEl,
    variant,
    orientation,
    signal: () => [value(), variant(), size(), orientation(), local.options],
  })

  const trackClass = () =>
    cn(
      isPill()
        ? 'relative isolate inline-flex shrink-0 self-start'
        : isBrowser()
          ? 'relative isolate flex'
          : 'relative flex',
      local.vertical ? 'flex-col' : 'items-center',
      local.fluid && 'w-full',
      ...tabTrackClasses({
        variant: variant(),
        size: size(),
        orientation: orientation(),
        edge: edge(),
      }),
      local.class,
    )

  const indicatorClasses = () =>
    cn(
      'absolute motion-reduce:transition-none',
      indicator.animated() &&
        `transition-[width,height,transform] ${tabIndicatorMotionClasses}`,
    )

  return (
    <div
      ref={(el) => {
        trackEl = el
      }}
      role="tablist"
      aria-orientation={orientation()}
      data-slot="tab-buttons"
      data-variant={variant()}
      data-size={size()}
      class={trackClass()}
    >
      <Show when={variant() === 'underline'}>
        <div
          data-slot="tab-indicator"
          aria-hidden="true"
          class={cn(indicatorClasses(), 'bg-outline-gray-8')}
          style={indicator.style()}
        />
      </Show>
      <Show when={isPill()}>
        <div
          aria-hidden="true"
          class={cn(...tabIndicatorClipClasses(variant(), size()))}
        >
          <div
            data-slot="tab-indicator"
            aria-hidden="true"
            class={cn(
              'pointer-events-none',
              indicatorClasses(),
              ...tabIndicatorSurfaceClasses(variant(), size()),
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
            tabRadiusClasses('browser-tab', size(), browserBase()),
            browserTabCardClasses(browserBase()),
          )}
          style={indicator.style()}
        />
      </Show>

      <For each={local.options}>
        {(option) => {
          const active = () => value() === option.value
          return (
            <button
              type="button"
              role="tab"
              aria-selected={active()}
              disabled={option.disabled}
              data-slot="tab-trigger"
              data-value={option.value}
              data-state={active() ? 'active' : 'inactive'}
              onClick={() => setValue(option.value)}
              class={cn(
                tabShellClasses,
                tabRadiusClasses(variant(), size(), buttonBrowserBase(option)),
                local.vertical && 'w-full',
                local.fluid && 'flex-1 min-w-0',
                'relative',
                option.disabled && 'pointer-events-none opacity-50',
              )}
            >
              <span
                class={cn(
                  tabPillClasses({
                    variant: variant(),
                    size: size(),
                    active: active(),
                    orientation: orientation(),
                    iconOnly: false,
                    browserTabBase: buttonBrowserBase(option),
                  }),
                  local.vertical && 'w-full justify-start',
                  local.fluid && 'w-full',
                )}
              >
                <Show when={option.icon}>
                  <Icon icon={option.icon} class="size-4 shrink-0" />
                </Show>
                <span class="min-w-0 truncate">{option.label}</span>
              </span>
            </button>
          )
        }}
      </For>
    </div>
  )
}

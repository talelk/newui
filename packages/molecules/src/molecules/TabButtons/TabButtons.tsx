import { Icon, type IconProp } from '@talelk/newui-atoms'
import {
  type BrowserTabBase,
  browserTabCardClasses,
  cn,
  createControllableSignal,
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
} from '@talelk/newui-atoms/internal'
import { For, type JSX, Show, splitProps, untrack } from 'solid-js'

export interface TabButtonOption {
  label: string
  value: string
  /** A `lucide-*` string or component, rendered before the label. */
  icon?: IconProp
  disabled?: boolean
}

export interface TabButtonsProps {
  /** Accessible name for the radiogroup. Required: an unnamed choice is unusable. */
  label: string
  options: TabButtonOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Visual variant, shared with the `Tabs` family. Default `subtle`. */
  variant?: TabsVariant
  /** @default sm */
  size?: TabsSize
  /** Stack the buttons in a column. */
  vertical?: boolean
  /** Wrap onto multiple rows instead of scrolling horizontally. */
  wrap?: boolean
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
    'label',
    'options',
    'value',
    'defaultValue',
    'onValueChange',
    'variant',
    'size',
    'vertical',
    'wrap',
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
      local.wrap
        ? 'relative flex w-fit max-w-full flex-wrap items-center justify-center'
        : isPill()
          ? 'relative isolate inline-flex shrink-0 self-start'
          : isBrowser()
            ? 'relative isolate flex'
            : 'relative flex',
      local.vertical ? 'flex-col' : 'items-center',
      local.fluid && 'w-full min-w-0',
      ...tabTrackClasses({
        variant: variant(),
        size: size(),
        orientation: orientation(),
        edge: edge(),
      }),
      local.wrap ? 'overflow-visible' : 'max-w-full overflow-x-auto',
      local.class,
    )

  const wrappedActiveClass = () => {
    if (!local.wrap) return ''
    switch (variant()) {
      case 'ghost':
        return 'data-[state=active]:bg-surface-gray-2'
      case 'underline':
        return 'data-[state=active]:border-b-2 data-[state=active]:border-outline-gray-8 data-[state=active]:pb-[calc(0.25rem-2px)]'
      case 'browser-tab':
        return 'data-[state=active]:border data-[state=active]:border-outline-gray-1 data-[state=active]:bg-surface-elevation-1'
      default:
        return 'data-[state=active]:bg-surface-elevation-3 data-[state=active]:shadow-base'
    }
  }

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
      role="radiogroup"
      aria-label={local.label}
      aria-orientation={orientation()}
      data-slot="tab-buttons"
      data-variant={variant()}
      data-size={size()}
      data-wrap={local.wrap ? '' : undefined}
      class={trackClass()}
    >
      <Show when={!local.wrap && variant() === 'underline'}>
        <div
          data-slot="tab-indicator"
          aria-hidden="true"
          class={cn(indicatorClasses(), 'bg-outline-gray-8')}
          style={indicator.style()}
        />
      </Show>
      <Show when={!local.wrap && isPill()}>
        <div aria-hidden="true" class={cn(...tabIndicatorClipClasses())}>
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
      <Show when={!local.wrap && isBrowser()}>
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
            <>
              {/* A styled segmented control cannot use native radio inputs
                  without losing the shared tab shell and sliding indicator; it
                  follows the WAI-ARIA radiogroup pattern on buttons instead. */}
              {/* biome-ignore lint/a11y/useSemanticElements: styled radiogroup buttons */}
              <button
                type="button"
                role="radio"
                aria-checked={active()}
                tabIndex={active() ? 0 : -1}
                onKeyDown={(event) => {
                  const vertical = orientation() === 'vertical'
                  const rtl =
                    trackEl && getComputedStyle(trackEl).direction === 'rtl'
                  const nextKey = vertical
                    ? 'ArrowDown'
                    : rtl
                      ? 'ArrowLeft'
                      : 'ArrowRight'
                  const previousKey = vertical
                    ? 'ArrowUp'
                    : rtl
                      ? 'ArrowRight'
                      : 'ArrowLeft'
                  if (
                    ![nextKey, previousKey, 'Home', 'End'].includes(event.key)
                  )
                    return
                  const buttons = Array.from(
                    trackEl?.querySelectorAll<HTMLButtonElement>(
                      'button[role="radio"]:not(:disabled)',
                    ) ?? [],
                  )
                  if (!buttons.length) return
                  event.preventDefault()
                  const current = buttons.indexOf(event.currentTarget)
                  const index =
                    event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? buttons.length - 1
                        : (current +
                            (event.key === nextKey ? 1 : -1) +
                            buttons.length) %
                          buttons.length
                  const target = buttons[index]
                  target?.focus()
                  if (target?.dataset['value'])
                    setValue(target.dataset['value'])
                }}
                disabled={option.disabled}
                data-slot="tab-trigger"
                data-value={option.value}
                data-state={active() ? 'active' : 'inactive'}
                onClick={() => setValue(option.value)}
                class={cn(
                  tabShellClasses,
                  tabRadiusClasses(
                    variant(),
                    size(),
                    buttonBrowserBase(option),
                  ),
                  local.vertical && 'w-full',
                  local.fluid && 'flex-1 min-w-0',
                  wrappedActiveClass(),
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
                    local.fluid && 'w-full min-w-0',
                  )}
                >
                  <Show when={option.icon}>
                    <Icon icon={option.icon} class="size-4 shrink-0" />
                  </Show>
                  <span class="min-w-0 truncate">{option.label}</span>
                </span>
              </button>
            </>
          )
        }}
      </For>
    </div>
  )
}

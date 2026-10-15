import {
  type Accessor,
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
} from 'solid-js'

/**
 * Shared styling for the tab family (`Tabs` + `TabButtons`).
 *
 * frappe-ui keeps one source of truth in `shared/tabs/styles.ts` so a track
 * looks the same whether it is a tablist or a radiogroup. We do the same here,
 * one layer down in `lib/` — components depend on `lib/`, never the reverse.
 */

export type TabsVariant = 'underline' | 'subtle' | 'ghost' | 'browser-tab'
export type TabsSize = 'sm' | 'md'
export type TabsEdge = 'start' | 'end'
export type TabOrientation = 'horizontal' | 'vertical'
export type BrowserTabBase = 'none' | 'default' | 'start' | 'end'

/** Track (container) visuals, keyed by variant/size/orientation/edge. */
export function tabTrackClasses(opts: {
  variant: TabsVariant
  size: TabsSize
  orientation: TabOrientation
  edge: TabsEdge
}): string[] {
  const { variant, size, orientation, edge } = opts
  const isSm = size === 'sm'
  const vertical = orientation === 'vertical'

  switch (variant) {
    case 'subtle':
      return [
        'bg-surface-gray-2',
        isSm ? 'gap-1 p-px' : 'gap-1.5 p-px',
        tabTrackRadiusClasses(),
      ]
    case 'ghost':
      return [
        'bg-surface-base',
        isSm ? 'gap-1 p-px' : 'gap-1.5 p-px',
        tabTrackRadiusClasses(),
      ]
    case 'underline':
      return vertical
        ? ['gap-1.5 border-e border-outline-gray-1']
        : ['gap-6 border-b border-outline-gray-1']
    case 'browser-tab':
      if (!vertical) return ['gap-1 border-b border-outline-gray-1']
      return [
        'gap-1',
        edge === 'end'
          ? 'border-e border-outline-gray-1'
          : 'border-s border-outline-gray-1',
      ]
  }
}

/** Sliding active-pill surface (subtle/ghost). */
export function tabIndicatorSurfaceClasses(
  variant: TabsVariant,
  size: TabsSize,
): string[] {
  return [
    variant === 'ghost'
      ? 'bg-surface-gray-2'
      : 'bg-surface-elevation-3 shadow-base',
    tabRadiusClasses(variant, size),
  ]
}

/** Track radius, one step outside the trigger radius. */
function tabTrackRadiusClasses(): string {
  return 'rounded-3'
}

/** Clip layer for the sliding pill indicator (subtle/ghost). */
export function tabIndicatorClipClasses(): string[] {
  return [
    'pointer-events-none absolute inset-0 overflow-hidden',
    tabTrackRadiusClasses(),
  ]
}

/**
 * Browser-tab active card: an opaque surface with a 1px border on every edge
 * except the attached one, plus an `after` pseudo that paints over the track's
 * rail segment so the card fuses with the area beyond it.
 */
export function browserTabCardClasses(base: BrowserTabBase): string {
  if (base === 'start') {
    return 'border border-outline-gray-1 border-s-transparent bg-surface-base after:absolute after:-inset-y-px after:-start-[2px] after:w-px after:bg-surface-base'
  }
  if (base === 'end') {
    return 'border border-outline-gray-1 border-e-transparent bg-surface-base after:absolute after:-inset-y-px after:-end-[2px] after:w-px after:bg-surface-base'
  }
  return 'border border-outline-gray-1 border-b-transparent bg-surface-base after:absolute after:-inset-x-px after:-bottom-[2px] after:h-px after:bg-surface-base'
}

/** Sliding-indicator motion, shared by every variant. */
export const tabIndicatorMotionClasses =
  'duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]'

/**
 * Reset, focus ring and disabled treatment for the focusable element wrapping
 * a pill. The shell owns the ring so every track gets the same one.
 */
export const tabShellClasses =
  'inline-flex appearance-none border-0 bg-transparent p-0 text-inherit no-underline focus-visible:ring-0 focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-60'

/** Trigger radius, one step inside the track radius. */
export function tabRadiusClasses(
  variant: TabsVariant,
  size: TabsSize,
  browserTabBase: BrowserTabBase = 'none',
): string {
  if (variant === 'underline') return ''
  if (variant === 'subtle') {
    return 'rounded-2'
  }
  if (variant === 'ghost') return 'rounded-2'
  if (variant === 'browser-tab') {
    if (browserTabBase === 'start') return 'rounded-e-4'
    if (browserTabBase === 'end') return 'rounded-s-4'
    if (browserTabBase === 'default') return 'rounded-t-4'
  }
  return size === 'sm' ? 'rounded-[7px]' : 'rounded-4'
}

/**
 * The visible pill inside a trigger: typography, padding and radius. The pill
 * never paints the active surface — the sliding indicator carries it — so an
 * active pill differs from an inactive one only in text colour.
 */
export function tabPillClasses(opts: {
  variant: TabsVariant
  size: TabsSize
  active: boolean
  orientation: TabOrientation
  iconOnly: boolean
  browserTabBase: BrowserTabBase
}): string {
  const { variant, size, active, orientation, iconOnly, browserTabBase } = opts
  const isSm = size === 'sm'
  const vertical = orientation === 'vertical'

  const padded = !vertical && (variant === 'subtle' || variant === 'ghost')
  const sizeClasses = iconOnly
    ? padded
      ? isSm
        ? 'size-6.5 p-[5px]'
        : 'size-7.5 p-[5px]'
      : isSm
        ? 'size-7 p-[5px]'
        : 'size-8 p-[5px]'
    : variant === 'underline'
      ? vertical
        ? isSm
          ? 'h-7 gap-2 px-2'
          : 'h-8 gap-2 px-2'
        : isSm
          ? 'h-7 gap-2'
          : 'h-8 gap-2'
      : variant === 'browser-tab'
        ? vertical
          ? isSm
            ? 'h-7 gap-2 px-2'
            : 'h-8 gap-2 px-2.5'
          : isSm
            ? 'h-7 gap-2 px-2 py-[5px]'
            : 'h-8 gap-2 px-2.5 py-[7px]'
        : padded
          ? isSm
            ? 'h-6.5 gap-2 px-2 py-[5px]'
            : 'h-7.5 gap-2 px-2.5 py-1.5'
          : isSm
            ? 'h-7 gap-2 px-2 py-[5px]'
            : 'h-8 gap-2 px-2.5 py-1.5'

  return [
    'inline-flex box-border shrink-0 select-none items-center justify-center whitespace-nowrap outline-none transition-[background-color,color,box-shadow] duration-150 ease-out motion-reduce:transition-none',
    'text-base leading-tighter',
    active ? 'text-ink-gray-8' : 'text-ink-gray-6',
    size === 'md' && variant !== 'underline' && variant !== 'subtle'
      ? 'font-medium tracking-[0.015em]'
      : '',
    sizeClasses,
    tabRadiusClasses(variant, size, browserTabBase),
    variant === 'browser-tab'
      ? active
        ? 'border border-transparent'
        : 'border border-transparent hover:text-ink-gray-8'
      : active
        ? ''
        : 'hover:text-ink-gray-8',
  ].join(' ')
}

export interface TabIndicatorRect {
  x: number
  y: number
  w: number
  h: number
}

export interface TabIndicatorOptions {
  /** The track element the indicator rides in. */
  track: Accessor<HTMLElement | undefined>
  variant: Accessor<TabsVariant>
  orientation: Accessor<TabOrientation>
  /** Read to re-measure; include every axis that moves the indicator. */
  signal: Accessor<unknown>
  /** CSS selector for the active trigger. */
  activeSelector?: string
}

/**
 * Measures the active trigger and returns the sliding indicator's inline
 * style. Rect deltas (not `offsetLeft`/`offsetWidth`) keep it exact on
 * fractional layouts. Transitions switch on after the first paint so the
 * indicator never slides in on mount.
 */
export function createTabIndicator(opts: TabIndicatorOptions) {
  const [rect, setRect] = createSignal<TabIndicatorRect | null>(null)
  const [animated, setAnimated] = createSignal(false)

  const measure = () => {
    const track = opts.track()
    if (!track) {
      setRect(null)
      return
    }
    const active = track.querySelector<HTMLElement>(
      opts.activeSelector ?? '[data-slot="tab-trigger"][data-state="active"]',
    )
    if (!active) {
      setRect(null)
      return
    }
    const trackRect = track.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()
    const style = getComputedStyle(track)
    const borderTop = Number.parseFloat(style.borderTopWidth) || 0
    const borderBottom = Number.parseFloat(style.borderBottomWidth) || 0
    const borderLeft = Number.parseFloat(style.borderLeftWidth) || 0
    const borderRight = Number.parseFloat(style.borderRightWidth) || 0
    const x = activeRect.left - trackRect.left - borderLeft + track.scrollLeft
    const y = activeRect.top - trackRect.top - borderTop + track.scrollTop

    if (opts.variant() === 'underline') {
      if (opts.orientation() === 'vertical') {
        const innerW = trackRect.width - borderLeft - borderRight
        setRect({
          x: style.direction === 'rtl' ? -1 : innerW,
          y,
          w: 1,
          h: activeRect.height,
        })
      } else {
        const innerH = trackRect.height - borderTop - borderBottom
        setRect({ x, y: innerH, w: activeRect.width, h: 1 })
      }
      return
    }
    setRect({ x, y, w: activeRect.width, h: activeRect.height })
  }

  let resizeObserver: ResizeObserver | undefined
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => measure())
  }
  onCleanup(() => resizeObserver?.disconnect())

  createEffect(() => {
    const track = opts.track()
    resizeObserver?.disconnect()
    if (track) resizeObserver?.observe(track)
  })

  createEffect(() => {
    opts.signal()
    opts.variant()
    opts.orientation()
    measure()
  })

  onMount(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)))
  })

  const style = (): JSX.CSSProperties => {
    const r = rect()
    if (!r) return { display: 'none' }
    return {
      width: `${r.w}px`,
      height: `${r.h}px`,
      transform: `translate(${r.x}px, ${r.y}px)`,
    }
  }

  return { rect, animated, style, measure }
}

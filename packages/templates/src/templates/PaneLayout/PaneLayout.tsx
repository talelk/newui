import { cn } from '@talelk/newui-atoms'
import { createControllableSignal } from '@talelk/newui-atoms/internal'
import {
  createEffect,
  createSignal,
  createUniqueId,
  type JSX,
  Show,
  splitProps,
} from 'solid-js'

/**
 * Two panes side by side, with a draggable divider.
 *
 * This is the shape a workspace reaches for the moment it has a list and a
 * record: mail's conversations beside the message, a ticket queue beside the
 * ticket, a file tree beside the preview. Mail was hand-rolling it with a grid,
 * a CSS variable and a *slider in the toolbar* — three pieces of plumbing per
 * consumer, and a resize affordance in the wrong place.
 *
 * **The divider is the control.** `role="separator"` with a value: it drags with
 * a pointer, moves with the arrow keys (Shift for a coarse step), jumps to the
 * bounds with Home/End, returns to the default split on double-click, and — when
 * `collapsible` allows — folds a pane away with Enter/Space. Its value is the
 * start pane's width as a percentage, so the split survives a resize of the
 * window.
 *
 * **Nothing is stored here.** Size and collapse are plain controllable signals
 * (`size`/`onSizeChange`, `collapsed`/`onCollapseChange`): "remember this split"
 * is the app's config store, not the layout's.
 *
 * **One pane on a narrow viewport.** Below `compactAt` the layout becomes a
 * single column showing `active`; the app switches it when a record opens and
 * renders its own back affordance. Collapsing the detail pane is that same
 * mobile state — below the breakpoint a collapsed pane simply shows the other.
 * Nothing here hides content the reader cannot get back to.
 *
 * **Three panes are two layouts.** A `PaneLayout` inside either pane gives a
 * three-panel workspace with independent separators; nesting is legal because
 * panes accept any children.
 */

export type PaneBreakpoint = 'sm' | 'md' | 'lg'

/** Which pane a fold belongs to. */
export type PaneSide = 'start' | 'end'

/** The whole fold state: which panes are collapsed. */
export type PaneCollapse = 'none' | PaneSide | 'both'

/** Below the breakpoint one pane shows; above it, both. */
const HIDE_BELOW: Record<PaneBreakpoint, string> = {
  sm: 'max-sm:hidden',
  md: 'max-md:hidden',
  lg: 'max-lg:hidden',
}

/** The divider is furniture: only the split breakpoint gets one. */
const DIVIDER_FROM: Record<PaneBreakpoint, string> = {
  sm: 'hidden sm:block',
  md: 'hidden md:block',
  lg: 'hidden lg:block',
}

/** Two panes with a resize column. */
const SPLIT_FROM: Record<PaneBreakpoint, string> = {
  sm: 'sm:grid-cols-[var(--pane-start,36%)_auto_minmax(0,1fr)]',
  md: 'md:grid-cols-[var(--pane-start,36%)_auto_minmax(0,1fr)]',
  lg: 'lg:grid-cols-[var(--pane-start,36%)_auto_minmax(0,1fr)]',
}

/** Two panes without one — the consumer owns the border. */
const FIXED_FROM: Record<PaneBreakpoint, string> = {
  sm: 'sm:grid-cols-[var(--pane-start,36%)_minmax(0,1fr)]',
  md: 'md:grid-cols-[var(--pane-start,36%)_minmax(0,1fr)]',
  lg: 'lg:grid-cols-[var(--pane-start,36%)_minmax(0,1fr)]',
}

export interface PaneLayoutProps {
  /** The first pane: a list, a tree, a queue. */
  start: JSX.Element
  /** The second pane: the record the start pane selects. */
  end: JSX.Element
  /**
   * Percent of the frame the start pane takes, controlled. When set, the
   * layout moves only when the app does — every drag or key reports itself
   * through `onSizeChange` first.
   */
  size?: number
  /**
   * Percent the uncontrolled layout starts at.
   * @default 36
   */
  defaultSize?: number
  /**
   * Superseded by `defaultSize`; the same value under its old name.
   * @deprecated Use `defaultSize` (and `size`/`onSizeChange` to control it).
   */
  startSize?: number
  /** The requested percent, in percent, on every user-initiated change. */
  onSizeChange?: (size: number) => void
  /**
   * Narrowest the split may go, in percent.
   * @default 20
   */
  minStartSize?: number
  /**
   * Widest the split may go, in percent.
   * @default 70
   */
  maxStartSize?: number
  /**
   * Below this breakpoint one pane shows.
   * @default 'lg'
   */
  compactAt?: PaneBreakpoint
  /**
   * Which pane a compact viewport shows.
   * @default 'start'
   */
  active?: PaneSide
  /**
   * Allow dragging the divider.
   * @default true
   */
  resizable?: boolean
  /**
   * Accessible name of the resize control.
   * @default 'Resize panes'
   */
  resizeLabel?: string
  /** Which panes may fold away with Enter/Space on the divider. */
  collapsible?: 'start' | 'end' | 'both'
  /** Which panes are folded, controlled. */
  collapsed?: PaneCollapse
  /**
   * Which panes are folded when uncontrolled.
   * @default 'none'
   */
  defaultCollapsed?: PaneCollapse
  /** The whole fold state on every user-initiated change. */
  onCollapseChange?: (collapsed: PaneCollapse) => void
  class?: string
}

export function PaneLayout(props: PaneLayoutProps): JSX.Element {
  const [local] = splitProps(props, [
    'start',
    'end',
    'size',
    'defaultSize',
    'startSize',
    'onSizeChange',
    'minStartSize',
    'maxStartSize',
    'compactAt',
    'active',
    'resizable',
    'resizeLabel',
    'collapsible',
    'collapsed',
    'defaultCollapsed',
    'onCollapseChange',
    'class',
  ])
  const breakpoint = () => local.compactAt ?? 'lg'
  const resizable = () => local.resizable !== false
  const min = () => local.minStartSize ?? 20
  const max = () => local.maxStartSize ?? 70
  const defaultSize = () => local.defaultSize ?? local.startSize ?? 36
  const clamp = (value: number) =>
    Math.min(max(), Math.max(min(), Math.round(value * 10) / 10))

  const [size, setSize] = createControllableSignal<number>({
    value: () => local.size,
    defaultValue: defaultSize(),
    onChange: (value) => local.onSizeChange?.(value),
  })

  const [collapsed, setCollapsed] = createControllableSignal<PaneCollapse>({
    value: () => local.collapsed,
    defaultValue: local.defaultCollapsed ?? 'none',
    onChange: (value) => local.onCollapseChange?.(value),
  })
  const collapsedStart = () => collapsed() === 'start' || collapsed() === 'both'
  const collapsedEnd = () => collapsed() === 'end' || collapsed() === 'both'
  const collapsibleSides = (): PaneSide[] =>
    local.collapsible === 'start'
      ? ['start']
      : local.collapsible === 'end'
        ? ['end']
        : local.collapsible === 'both'
          ? ['start', 'end']
          : []

  // A folded pane is 0% or 100%; the remembered size survives the fold so the
  // split returns to where the reader left it.
  const split = () => {
    if (collapsedStart() && !collapsedEnd()) return 0
    if (collapsedEnd() && !collapsedStart()) return 100
    return clamp(size())
  }

  const expand = () => {
    if (collapsed() !== 'none') setCollapsed('none')
  }

  const toggleCollapse = (side: PaneSide) => {
    const now = collapsed()
    setCollapsed(
      side === 'start'
        ? now === 'none'
          ? 'start'
          : now === 'start'
            ? 'none'
            : now === 'both'
              ? 'end'
              : 'both'
        : now === 'none'
          ? 'end'
          : now === 'end'
            ? 'none'
            : now === 'both'
              ? 'start'
              : 'both',
    )
  }

  // The fold target is the pane the divider is nearer — the narrower one — so
  // Enter folds what the reader is looking away from and unfolds what they
  // folded. With one collapsible side there is nothing to choose.
  const foldTarget = (): PaneSide => {
    const sides = collapsibleSides()
    if (sides.length === 1) return sides[0] as PaneSide
    return split() <= 50 ? 'start' : 'end'
  }

  const startId = createUniqueId()
  const label = () => local.resizeLabel ?? 'Resize panes'

  let frame: HTMLDivElement | undefined
  // The CSS variable rather than an inline width: the compact layout is a
  // single `1fr` column, and an inline width would win over that rule.
  createEffect(() => {
    frame?.style.setProperty('--pane-start', `${split()}%`)
  })

  const [dragging, setDragging] = createSignal(false)
  let originX = 0
  let originSize = 0
  let frameWidth = 0

  const beginDrag = (event: PointerEvent) => {
    if (event.button !== 0) return
    const element = event.currentTarget as HTMLElement
    originX = event.clientX
    originSize = split()
    frameWidth = frame?.getBoundingClientRect().width ?? 0
    if (frameWidth === 0) return
    event.preventDefault()
    element.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  const moveDrag = (event: PointerEvent) => {
    if (!dragging()) return
    const delta = ((event.clientX - originX) / frameWidth) * 100
    const target = Math.min(100, Math.max(0, originSize + delta))
    if (collapsedStart() || collapsedEnd()) {
      // Dragging at a folded edge: stay folded until the pointer crosses back
      // over the divider, then unfold and hand the size to the drag.
      if (target <= 0 && collapsedStart()) return
      if (target >= 100 && collapsedEnd()) return
      expand()
    }
    setSize(clamp(target))
  }

  const endDrag = (event: PointerEvent) => {
    if (!dragging()) return
    setDragging(false)
    const element = event.currentTarget as HTMLElement
    if (element.hasPointerCapture(event.pointerId))
      element.releasePointerCapture(event.pointerId)
  }

  const nudge = (step: number) => {
    if (collapsed() !== 'none') {
      // Any arrow from a fold unfolds and moves from the remembered size.
      expand()
      setSize(clamp(size() + step))
    } else {
      setSize(clamp(split() + step))
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 2
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      nudge(-step)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      nudge(step)
    } else if (event.key === 'Home') {
      event.preventDefault()
      expand()
      setSize(clamp(min()))
    } else if (event.key === 'End') {
      event.preventDefault()
      expand()
      setSize(clamp(max()))
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (collapsibleSides().length === 0) return
      event.preventDefault()
      toggleCollapse(foldTarget())
    }
  }

  return (
    <div
      ref={frame}
      data-slot="pane-layout"
      data-resizing={dragging() ? '' : undefined}
      data-collapsed={collapsed() === 'none' ? undefined : collapsed()}
      class={cn(
        'grid min-h-0 min-w-0 flex-1',
        resizable() ? SPLIT_FROM[breakpoint()] : FIXED_FROM[breakpoint()],
        dragging() && 'cursor-col-resize select-none',
        local.class,
      )}
    >
      <div
        id={startId}
        data-slot="pane-start"
        data-state={collapsedStart() ? 'collapsed' : undefined}
        class={cn(
          'min-h-0 min-w-0',
          collapsedStart()
            ? 'hidden'
            : local.active === 'end' &&
                !collapsedEnd() &&
                HIDE_BELOW[breakpoint()],
        )}
      >
        {local.start}
      </div>

      <Show when={resizable()}>
        <div
          data-slot="pane-resizer"
          class={cn(
            'relative w-px shrink-0 bg-outline-gray-1',
            DIVIDER_FROM[breakpoint()],
          )}
        >
          <button
            type="button"
            role="separator"
            aria-orientation="vertical"
            aria-label={label()}
            aria-controls={startId}
            aria-valuenow={Math.round(split())}
            aria-valuemin={collapsedStart() ? 0 : min()}
            aria-valuemax={collapsedEnd() ? 100 : max()}
            class="absolute inset-y-0 -end-2 -start-2 z-raised cursor-col-resize rounded-3 focus-visible:focus-ring"
            onPointerDown={beginDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDblClick={() => {
              expand()
              setSize(clamp(defaultSize()))
            }}
            onKeyDown={onKeyDown}
          />
        </div>
      </Show>

      <div
        data-slot="pane-end"
        data-state={collapsedEnd() ? 'collapsed' : undefined}
        class={cn(
          'min-h-0 min-w-0',
          collapsedEnd()
            ? 'hidden'
            : local.active !== 'end' &&
                !collapsedStart() &&
                HIDE_BELOW[breakpoint()],
        )}
      >
        {local.end}
      </div>
    </div>
  )
}

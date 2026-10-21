import { cn } from '@newui/atoms'
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
 * bounds with Home/End, and returns to the default split on double-click. Its
 * value is the start pane's width as a percentage, so the split survives a
 * resize of the window.
 *
 * **One pane on a narrow viewport.** Below `compactAt` the layout becomes a
 * single column showing `active`; the app switches it when a record opens and
 * renders its own back affordance. Nothing here hides content the reader cannot
 * get back to.
 */

export type PaneBreakpoint = 'sm' | 'md' | 'lg'

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
  /** Percent of the frame the start pane takes. Default `36`. */
  startSize?: number
  /** Narrowest the split may go, in percent. Default `20`. */
  minStartSize?: number
  /** Widest the split may go, in percent. Default `70`. */
  maxStartSize?: number
  /** Below this breakpoint only one pane shows. Default `lg`. */
  compactAt?: PaneBreakpoint
  /** Which pane a compact viewport shows. Default `start`. */
  active?: 'start' | 'end'
  /** Allow dragging the divider. Default `true`. */
  resizable?: boolean
  /** Accessible name of the resize control. Default `Resize panes`. */
  resizeLabel?: string
  class?: string
}

export function PaneLayout(props: PaneLayoutProps): JSX.Element {
  const [local] = splitProps(props, [
    'start',
    'end',
    'startSize',
    'minStartSize',
    'maxStartSize',
    'compactAt',
    'active',
    'resizable',
    'resizeLabel',
    'class',
  ])
  const breakpoint = () => local.compactAt ?? 'lg'
  const resizable = () => local.resizable !== false
  const min = () => local.minStartSize ?? 20
  const max = () => local.maxStartSize ?? 70
  const clamp = (value: number) =>
    Math.min(max(), Math.max(min(), Math.round(value * 10) / 10))

  const [size, setSize] = createSignal<number | undefined>(undefined)
  const split = () => clamp(size() ?? local.startSize ?? 36)
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
    setSize(clamp(originSize + delta))
  }

  const endDrag = (event: PointerEvent) => {
    if (!dragging()) return
    setDragging(false)
    const element = event.currentTarget as HTMLElement
    if (element.hasPointerCapture(event.pointerId))
      element.releasePointerCapture(event.pointerId)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 2
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setSize(clamp(split() - step))
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      setSize(clamp(split() + step))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setSize(clamp(min()))
    } else if (event.key === 'End') {
      event.preventDefault()
      setSize(clamp(max()))
    }
  }

  return (
    <div
      ref={frame}
      data-slot="pane-layout"
      data-resizing={dragging() ? '' : undefined}
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
        class={cn(
          'min-h-0 min-w-0',
          local.active === 'end' && HIDE_BELOW[breakpoint()],
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
            aria-valuemin={min()}
            aria-valuemax={max()}
            class="absolute inset-y-0 -end-2 -start-2 z-10 cursor-col-resize rounded-3 focus-visible:focus-ring"
            onPointerDown={beginDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDblClick={() => setSize(undefined)}
            onKeyDown={onKeyDown}
          />
        </div>
      </Show>

      <div
        data-slot="pane-end"
        class={cn(
          'min-h-0 min-w-0',
          local.active !== 'end' && HIDE_BELOW[breakpoint()],
        )}
      >
        {local.end}
      </div>
    </div>
  )
}

import { Button, cn, Icon, Portal, VisuallyHidden } from '@talelk/newui-atoms'
import { createControllableSignal } from '@talelk/newui-atoms/internal'
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  type JSX,
  onCleanup,
  Show,
  useContext,
} from 'solid-js'
import {
  emptyWidgetGridConfig,
  moveWidgetGrid,
  removeWidgetGrid,
  resetWidgetGridConfig,
  resizeWidgetGrid,
  resolveLayout,
  WIDGET_GRID_COLUMNS,
  type WidgetDeclaration,
  type WidgetGridConfig,
  type WidgetPlacement,
} from './layout'

/** px a pointer must travel before a press becomes a drag. */
const DRAG_THRESHOLD = 4
/** Tailwind's `md`; below it the grid stacks and gestures rest. */
const STACK_BELOW_PX = 768

interface WidgetRegistration {
  id: string
  span: () => number
  rows: () => number
  minSpan: () => number
  minRows: () => number
  title: () => JSX.Element
  body: () => JSX.Element
}

interface WidgetGridApi {
  register(registration: WidgetRegistration): void
  unregister(id: string): void
  placement(id: string): WidgetPlacement | undefined
  placementStyle(id: string): Record<string, string>
  isHidden(id: string): boolean
  isDragging(id: string): boolean
  editable(): boolean
  narrow(): boolean
  columns(): number
  nameOf(id: string): string
  startMove(id: string, event: PointerEvent): void
  startResize(id: string, event: PointerEvent): void
  resizeByKey(id: string, event: KeyboardEvent): void
  remove(id: string): void
}

const WidgetGridContext = createContext<WidgetGridApi>()

function useWidgetGrid(): WidgetGridApi {
  const api = useContext(WidgetGridContext)
  if (!api)
    throw new Error('WidgetGrid.Widget must be used within <WidgetGrid>')
  return api
}

export interface WidgetGridProps {
  /**
   * The layout document, controlled. When given, the grid moves only when the
   * app applies what `onConfigChange` reports — the same contract as
   * PaneLayout's `size`.
   */
  config?: WidgetGridConfig
  /** The document an uncontrolled grid starts from. @default empty */
  defaultConfig?: WidgetGridConfig
  /** The whole document, emitted on every user change. The grid never stores. */
  onConfigChange?: (config: WidgetGridConfig) => void
  /** Column tracks. @default 12 */
  columns?: number
  /** One row's height, in px. @default 64 */
  rowHeight?: number
  /**
   * Enter edit mode: drag, resize and remove become available and their
   * handles appear. View-only by default — a dashboard that is always
   * draggable is a dashboard you ruin by accident.
   */
  editable?: boolean
  /**
   * Render a "Reset layout" control that emits the code defaults (tombstones
   * kept). @default false
   */
  resettable?: boolean
  /** Accessible name for the grid region. @default 'Widgets' */
  label?: string
  class?: string
  children: JSX.Element
}

/**
 * A dashboard that tiles widgets — drag to move, drag the corner to resize,
 * and the whole layout survives as one JSON document.
 *
 * **The document is the point.** `{ v: 1, widgets: { [id]: { x, y, span,
 * rows, hidden? } } } }` — the grid emits it on every change and stores
 * nothing. "Remember this dashboard" is one `createConfigStore.save` line in
 * the app; removed widgets keep a `hidden` tombstone so undo-remove is one
 * flag, and reset-to-defaults restores the geometry declared in code.
 *
 * **The header is the drag handle, never the body.** A chart owns its body
 * gestures; grabbing anywhere else would fight it. A 4px threshold separates
 * a click from a lift, a ghost follows the pointer, and the drop snaps to the
 * 12-column track. Whatever the drop lands on pushes down — widgets reflow,
 * they never overlap.
 *
 * **The corner handle is the keyboard twin.** `role="separator"`: arrows
 * resize by a column, Shift+arrows by a row, Home/End jump to the bounds.
 *
 * **Below `md` the grid stacks.** Every widget goes full-width and its rows
 * keep their relative ratio; gestures rest there, so a thumb cannot clobber
 * desktop geometry.
 */
export function WidgetGrid(props: WidgetGridProps): JSX.Element {
  const columns = () => props.columns ?? WIDGET_GRID_COLUMNS
  const rowHeight = () => props.rowHeight ?? 64
  const editable = () => props.editable === true

  const [config, setConfig] = createControllableSignal<WidgetGridConfig>({
    value: () => props.config,
    defaultValue: props.defaultConfig ?? emptyWidgetGridConfig(),
    onChange: (next) => props.onConfigChange?.(next),
  })

  const registrations = new Map<string, WidgetRegistration>()
  const [version, setVersion] = createSignal(0)
  const declarations = (): WidgetDeclaration[] => {
    version()
    return [...registrations.values()].map((widget) => ({
      id: widget.id,
      span: widget.span(),
      rows: widget.rows(),
    }))
  }
  const registrationOf = (id: string) => {
    version()
    return registrations.get(id)
  }

  const [drag, setDrag] = createSignal<{
    id: string
    width: number
    height: number
    x: number
    y: number
  }>()
  const [resize, setResize] = createSignal<{
    id: string
    span: number
    rows: number
  }>()
  const [announcement, setAnnouncement] = createSignal('')

  const [narrow, setNarrow] = createSignal(
    typeof window !== 'undefined' && window.innerWidth < STACK_BELOW_PX,
  )
  createEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => setNarrow(window.innerWidth < STACK_BELOW_PX)
    window.addEventListener('resize', onResize)
    onCleanup(() => window.removeEventListener('resize', onResize))
  })

  let gridRoot: HTMLDivElement | undefined
  let gestureCleanup: (() => void) | undefined
  onCleanup(() => gestureCleanup?.())

  const layout = createMemo(() =>
    resolveLayout(declarations(), config(), columns()),
  )
  const placementOf = (id: string): WidgetPlacement | undefined => {
    const preview = resize()
    if (preview?.id === id) {
      const base = layout().find((placement) => placement.id === id)
      if (base) return { ...base, span: preview.span, rows: preview.rows }
    }
    return layout().find((placement) => placement.id === id)
  }

  const nameOf = (id: string) => {
    const title = registrationOf(id)?.title()
    return typeof title === 'string' && title.trim() ? title.trim() : id
  }

  /** Column/row pitch, in px, read from the live grid. */
  function steps(): { colStep: number; rowStep: number } {
    const width = gridRoot?.getBoundingClientRect().width ?? 0
    const raw = (gridRoot && getComputedStyle(gridRoot).gap) || '8px 8px'
    const parts = raw
      .trim()
      .split(/\s+/)
      .map((value) => Number.parseFloat(value))
    const first = parts[0]
    const second = parts[1]
    const colGap = first !== undefined && Number.isFinite(first) ? first : 8
    const rowGap =
      second !== undefined && Number.isFinite(second) ? second : colGap
    const colStep = width > 0 ? (width + colGap) / columns() : 1
    return { colStep, rowStep: rowHeight() + rowGap }
  }

  const itemOf = (id: string): HTMLElement | undefined =>
    [
      ...(gridRoot?.querySelectorAll<HTMLElement>('[data-widget-id]') ?? []),
    ].find((element) => element.dataset['widgetId'] === id)

  function listen(handlers: Record<string, (event: Event) => void>) {
    for (const [type, handler] of Object.entries(handlers)) {
      window.addEventListener(type, handler)
    }
    gestureCleanup = () => {
      for (const [type, handler] of Object.entries(handlers)) {
        window.removeEventListener(type, handler)
      }
      gestureCleanup = undefined
    }
  }

  function startMove(id: string, event: PointerEvent): void {
    if (!editable() || narrow() || drag() || resizing()) return
    if (event.button !== 0) return
    if ((event.target as Element | null)?.closest('button')) return
    const start = placementOf(id)
    const item = itemOf(id)
    if (!start || !item || !gridRoot) return
    const gridRect = gridRoot.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    const { colStep, rowStep } = steps()
    const offsetX = event.clientX - itemRect.left
    const offsetY = event.clientY - itemRect.top
    const originX = event.clientX
    const originY = event.clientY
    let active = false
    let lastX = event.clientX
    let lastY = event.clientY

    listen({
      pointermove: (event) => {
        const move = event as PointerEvent
        lastX = move.clientX
        lastY = move.clientY
        if (!active) {
          if (
            Math.hypot(move.clientX - originX, move.clientY - originY) <
            DRAG_THRESHOLD
          )
            return
          active = true
        }
        setDrag({
          id,
          width: itemRect.width,
          height: itemRect.height,
          x: move.clientX - offsetX,
          y: move.clientY - offsetY,
        })
      },
      pointerup: () => {
        if (active) {
          const x = Math.round((lastX - offsetX - gridRect.left) / colStep)
          const y = Math.max(
            0,
            Math.round((lastY - offsetY - gridRect.top) / rowStep),
          )
          commitMove(id, x, y)
        }
        setDrag(undefined)
        gestureCleanup?.()
      },
      pointercancel: () => {
        setDrag(undefined)
        gestureCleanup?.()
      },
      keydown: (event) => {
        if ((event as KeyboardEvent).key !== 'Escape') return
        event.preventDefault()
        setDrag(undefined)
        gestureCleanup?.()
      },
    })
  }

  const resizing = () => resize() !== undefined

  function startResize(id: string, event: PointerEvent): void {
    if (!editable() || narrow() || drag()) return
    if (event.button !== 0) return
    const start = placementOf(id)
    if (!start || !gridRoot) return
    const { colStep, rowStep } = steps()
    const originX = event.clientX
    const originY = event.clientY
    let active = false
    let span = start.span
    let rows = start.rows

    listen({
      pointermove: (event) => {
        const move = event as PointerEvent
        if (!active) {
          if (
            Math.hypot(move.clientX - originX, move.clientY - originY) <
            DRAG_THRESHOLD
          )
            return
          active = true
        }
        span = Math.min(
          Math.max(
            1,
            start.span + Math.round((move.clientX - originX) / colStep),
          ),
          columns() - start.x,
        )
        rows = Math.max(
          1,
          start.rows + Math.round((move.clientY - originY) / rowStep),
        )
        setResize({ id, span, rows })
      },
      pointerup: () => {
        if (active) commitResize(id, span, rows)
        setResize(undefined)
        gestureCleanup?.()
      },
      pointercancel: () => {
        setResize(undefined)
        gestureCleanup?.()
      },
      keydown: (event) => {
        if ((event as KeyboardEvent).key !== 'Escape') return
        event.preventDefault()
        setResize(undefined)
        gestureCleanup?.()
      },
    })
  }

  function resizeByKey(id: string, event: KeyboardEvent): void {
    if (!editable() || narrow()) return
    const placement = placementOf(id)
    const registration = registrationOf(id)
    if (!placement || !registration) return
    let span = placement.span
    let rows = placement.rows
    switch (event.key) {
      case 'ArrowRight':
        span += 1
        break
      case 'ArrowLeft':
        span -= 1
        break
      case 'ArrowDown':
        rows += 1
        break
      case 'ArrowUp':
        rows -= 1
        break
      case 'Home':
        span = registration.minSpan()
        break
      case 'End':
        span = columns() - placement.x
        break
      default:
        return
    }
    event.preventDefault()
    commitResize(id, span, rows)
  }

  function commitMove(id: string, x: number, y: number): void {
    setConfig(moveWidgetGrid(declarations(), config(), columns(), id, { x, y }))
    setAnnouncement(`${nameOf(id)} moved to column ${x + 1}, row ${y + 1}`)
  }

  function commitResize(id: string, span: number, rows: number): void {
    const next = resizeWidgetGrid(declarations(), config(), columns(), id, {
      span,
      rows,
    })
    const entry = next.widgets[id]
    setConfig(next)
    setAnnouncement(
      `${nameOf(id)} resized to ${entry?.span ?? span} columns by ${
        entry?.rows ?? rows
      } rows`,
    )
  }

  const api: WidgetGridApi = {
    register: (registration) => {
      registrations.set(registration.id, registration)
      setVersion((value) => value + 1)
    },
    unregister: (id) => {
      if (!registrations.has(id)) return
      registrations.delete(id)
      setVersion((value) => value + 1)
    },
    placement: placementOf,
    placementStyle: (id): Record<string, string> => {
      if (narrow()) {
        return {
          'grid-column': '1 / -1',
          'grid-row': `span ${placementOf(id)?.rows ?? 1}`,
        }
      }
      const placement = placementOf(id)
      if (!placement) return {}
      return {
        'grid-column': `${placement.x + 1} / span ${placement.span}`,
        'grid-row': `${placement.y + 1} / span ${placement.rows}`,
      }
    },
    isHidden: (id) => config().widgets[id]?.hidden === true,
    isDragging: (id) => drag()?.id === id,
    editable,
    narrow,
    columns,
    nameOf,
    startMove,
    startResize,
    resizeByKey,
    remove: (id) => {
      setConfig(removeWidgetGrid(declarations(), config(), columns(), id))
      setAnnouncement(`${nameOf(id)} removed`)
    },
  }

  return (
    <WidgetGridContext.Provider value={api}>
      <div
        data-slot="widget-grid"
        data-dragging={drag() ? '' : undefined}
        data-resizing={resize() ? '' : undefined}
        class={cn('flex min-w-0 flex-col gap-2', props.class)}
      >
        <Show when={props.resettable}>
          <div data-slot="widget-grid-toolbar" class="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              icon="lucide-rotate-ccw"
              onClick={() => {
                setConfig(resetWidgetGridConfig(config()))
                setAnnouncement('Layout reset to defaults')
              }}
            >
              Reset layout
            </Button>
          </div>
        </Show>
        <div
          ref={gridRoot}
          data-slot="widget-grid-layout"
          // biome-ignore lint/a11y/useSemanticElements: a live layout region has no native equivalent.
          role="group"
          aria-label={props.label ?? 'Widgets'}
          class="grid min-w-0 gap-card-gap"
          style={{
            'grid-template-columns': `repeat(${columns()}, minmax(0, 1fr))`,
            'grid-auto-rows': `${rowHeight()}px`,
          }}
        >
          {props.children}
        </div>
        <span aria-live="polite">
          <VisuallyHidden>{announcement()}</VisuallyHidden>
        </span>
      </div>

      <Show when={drag()}>
        {(state) => (
          <Portal>
            {/* The lifted widget: fixed, inert, out of hit-testing, so the
                grid reads the pointer through it. */}
            <div
              class="pointer-events-none fixed top-0 left-0 z-overlay will-change-transform"
              style={{
                width: `${state().width}px`,
                height: `${state().height}px`,
                transform: `translate3d(${state().x}px, ${state().y}px, 0)`,
              }}
            >
              <div class="flex h-full flex-col rounded-card border border-outline-gray-1 bg-surface-gray-1 shadow-drag">
                <div class="flex items-center gap-2 border-b border-outline-gray-1 px-3 py-2">
                  <Icon
                    icon="lucide-grip-vertical"
                    class="size-4 text-ink-gray-6"
                  />
                  <span class="min-w-0 flex-1 truncate text-sm-medium text-ink-gray-9">
                    {registrationOf(state().id)?.title()}
                  </span>
                </div>
                <div class="min-h-0 flex-1 overflow-auto p-3">
                  {registrationOf(state().id)?.body()}
                </div>
              </div>
            </div>
          </Portal>
        )}
      </Show>
    </WidgetGridContext.Provider>
  )
}

export interface WidgetGridWidgetProps {
  /** The widget's identity across sessions. Renaming it loses its position,
   * so it is required and stable. */
  id: string
  /** Default columns to span, used until the user's layout overrides it.
   * @default 12 */
  span?: number
  /** Default rows to span. @default 1 */
  rows?: number
  /** Smallest the resize may take it, in columns. @default 1 */
  minSpan?: number
  /** Smallest the resize may take it, in rows. @default 1 */
  minRows?: number
  /** The header's text. It doubles as the widget's accessible name. */
  title?: JSX.Element
  class?: string
  children: JSX.Element
}

/**
 * One tile of the grid.
 *
 * The header is the drag handle — the body belongs to whatever is inside it.
 * In edit mode the header grows a grip and a remove button, and the bottom-right
 * corner grows the resize handle.
 */
export function WidgetGridWidget(props: WidgetGridWidgetProps): JSX.Element {
  const api = useWidgetGrid()
  api.register({
    // `id` is a stable identity by contract — renaming it loses the widget's
    // position — so it is keyed once at registration, unlike the live options.
    // eslint-disable-next-line solid/reactivity
    id: props.id,
    span: () => props.span ?? 12,
    rows: () => props.rows ?? 1,
    minSpan: () => props.minSpan ?? 1,
    minRows: () => props.minRows ?? 1,
    title: () => props.title,
    body: () => props.children,
  })
  onCleanup(() => api.unregister(props.id))

  const name = () => api.nameOf(props.id)
  // A body whose content overflows is a scroll container, and a scroll
  // container must be reachable by keyboard (axe: scrollable-region-
  // focusable). Only an overflowing body becomes a tab stop, so a grid of
  // short widgets does not grow a stop per widget.
  const [scrollable, setScrollable] = createSignal(false)
  const watchOverflow = (el: HTMLDivElement) => {
    const measure = () =>
      setScrollable(
        el.scrollHeight > el.clientHeight + 1 ||
          el.scrollWidth > el.clientWidth + 1,
      )
    queueMicrotask(measure)
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    onCleanup(() => observer.disconnect())
  }
  const placement = () => api.placement(props.id)

  return (
    <Show when={!api.isHidden(props.id)}>
      <div
        data-slot="widget-grid-item"
        data-widget-id={props.id}
        data-state={api.isDragging(props.id) ? 'dragging' : undefined}
        style={api.placementStyle(props.id)}
        class={cn(
          'relative flex min-h-0 min-w-0 flex-col rounded-card border border-outline-gray-1 bg-surface-gray-1',
          api.isDragging(props.id) && 'border-dashed opacity-40',
          props.class,
        )}
      >
        <Show when={api.editable() || props.title}>
          <div
            data-slot="widget-grid-header"
            class={cn(
              'flex items-center gap-2 border-b border-outline-gray-1 px-3 py-2',
              api.editable() && 'cursor-grab',
            )}
            onPointerDown={(event) => api.startMove(props.id, event)}
          >
            <Show when={api.editable()}>
              <Icon
                icon="lucide-grip-vertical"
                class="size-4 shrink-0 text-ink-gray-6"
              />
            </Show>
            <span class="min-w-0 flex-1 truncate text-sm-medium text-ink-gray-9">
              {props.title}
            </span>
            <Show when={api.editable()}>
              <Button
                variant="ghost"
                size="sm"
                icon="lucide-x"
                aria-label={`Remove ${name()} widget`}
                class="max-lg:size-10"
                onClick={() => api.remove(props.id)}
              />
            </Show>
          </div>
        </Show>
        <div
          ref={watchOverflow}
          data-slot="widget-grid-body"
          {...(scrollable()
            ? { tabindex: 0, role: 'region', 'aria-label': `${name()} content` }
            : {})}
          class="min-h-0 flex-1 overflow-auto p-3 focus-visible:focus-ring focus-visible:-outline-offset-2"
        >
          {props.children}
        </div>
        <Show when={api.editable() && !api.narrow()}>
          <span
            data-slot="widget-grid-resize"
            role="separator"
            tabindex={0}
            aria-label={`Resize ${name()} widget`}
            aria-valuenow={placement()?.span ?? 1}
            aria-valuemin={props.minSpan ?? 1}
            aria-valuemax={api.columns() - (placement()?.x ?? 0)}
            aria-valuetext={`${placement()?.span ?? 1} columns by ${
              placement()?.rows ?? 1
            } rows`}
            class="absolute right-0 bottom-0 z-10 flex size-5 cursor-nwse-resize touch-none items-center justify-center rounded-br-card text-ink-gray-6 focus-visible:focus-ring"
            onPointerDown={(event) => {
              event.stopPropagation()
              api.startResize(props.id, event)
            }}
            onKeyDown={(event) => api.resizeByKey(props.id, event)}
          >
            <Icon icon="lucide-corner-down-right" class="size-3.5" />
          </span>
        </Show>
      </div>
    </Show>
  )
}

WidgetGrid.Widget = WidgetGridWidget

export type {
  WidgetDeclaration,
  WidgetGridConfig,
  WidgetGridEntry,
  WidgetPlacement,
} from './layout'
export {
  emptyWidgetGridConfig,
  materializeWidgetGridConfig,
  moveWidgetGrid,
  normalizeWidgetGridConfig,
  removeWidgetGrid,
  resetWidgetGridConfig,
  resizeWidgetGrid,
  resolveLayout,
  restoreWidgetGrid,
  WIDGET_GRID_COLUMNS,
  WIDGET_GRID_SCHEMA_VERSION,
} from './layout'

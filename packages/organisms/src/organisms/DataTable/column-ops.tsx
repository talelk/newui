import { createEffect, createSignal, type JSX } from 'solid-js'

/**
 * Column operations (issue #20): resize, reorder, multi-pin and per-column
 * filters. The table owns the state plumbing; this module owns the header
 * parts — the separator, the filter popover, the column menu and the drag
 * controller — so `DataTable.tsx` stays the composition it was.
 */

/** Which header operations the table turns on. */
export interface ColumnOps {
  /** Drag handles on header edges, plus the keyboard twin. */
  resizable?: boolean
  /** Pointer drag on headers plus Move left/right in the column menu. */
  reorderable?: boolean
  /** The per-column menu button. Default `true` when `columnOps` is set. */
  menu?: boolean
}

/** One server-provided facet value inside a filter popover. */
export interface DataTableFilterFacet {
  value: string
  count: number
}

/**
 * The slice of a TanStack column the parts here touch. Structural on purpose:
 * the parts never import the table engine, only what they read and set.
 */
export interface FilterColumn {
  id: string
  getFilterValue(): unknown
  setFilterValue(value: unknown): void
  columnDef: { filterFn?: unknown }
}

/** The slice of a TanStack table the ordering helpers touch. */
export interface OrderTable {
  getAllLeafColumns(): { id: string }[]
  atoms?: { columnOrder?: { get(): string[] | undefined } }
  setColumnOrder(order: string[]): void
}

/**
 * The leaf column ids in display order: the applied `columnOrder` first, then
 * columns it does not mention in definition order — exactly how TanStack
 * orders them, so a move reads as the reader sees it.
 */
export function orderedLeafIds(table: OrderTable): string[] {
  const all = table.getAllLeafColumns().map((column) => column.id)
  const order = table.atoms?.columnOrder?.get()
  if (!order || order.length === 0) return all
  const known = order.filter((id) => all.includes(id))
  return [...known, ...all.filter((id) => !known.includes(id))]
}

/** Move `id` to sit directly before `targetId` (or at the end when absent). */
export function moveColumnTo(
  table: OrderTable,
  id: string,
  targetId: string | undefined,
): void {
  const ids = orderedLeafIds(table)
  const without = ids.filter((columnId) => columnId !== id)
  const at = targetId === undefined ? without.length : without.indexOf(targetId)
  if (at === -1 || without.at(at) === id) return
  without.splice(at, 0, id)
  table.setColumnOrder(without)
}

/** Swap `id` with its neighbour `delta` places away. */
export function moveColumnBy(
  table: OrderTable,
  id: string,
  delta: number,
): void {
  const ids = orderedLeafIds(table)
  const from = ids.indexOf(id)
  const to = from + delta
  if (from === -1 || to < 0 || to >= ids.length) return
  const next = [...ids]
  next.splice(from, 1)
  next.splice(to, 0, id)
  table.setColumnOrder(next)
}

/**
 * Header pointer-drag: a threshold before a drag starts so a click still
 * reads as a click, pointer capture so the table keeps tracking outside its
 * own bounds, and drop targeting by header midpoints. Registers header
 * elements so the controller can measure without querying the DOM.
 */
export interface HeaderDrag {
  register(columnId: string, element: HTMLElement): void
  begin(columnId: string, event: PointerEvent): void
  move(columnId: string, event: PointerEvent): void
  end(columnId: string, event: PointerEvent): void
}

export function createHeaderDrag(deps: {
  enabled: () => boolean
  order: () => string[]
  move: (id: string, targetId: string | undefined) => void
}): HeaderDrag {
  const elements = new Map<string, HTMLElement>()
  let activeId: string | undefined
  let startX = 0
  let dragging = false

  const targetFor = (clientX: number): string | undefined => {
    const ids = deps.order()
    for (const id of ids) {
      const element = elements.get(id)
      if (!element) continue
      const rect = element.getBoundingClientRect()
      if (rect.width === 0) continue
      if (clientX < rect.left + rect.width / 2) return id
    }
    return undefined
  }

  return {
    register(columnId, element) {
      elements.set(columnId, element)
    },
    begin(columnId, event) {
      if (!deps.enabled() || event.button !== 0) return
      // Buttons carry their own gesture: sorting, the menu, the filter and
      // the resize separator must not also start a drag.
      const target = event.target as HTMLElement
      if (target.closest('button, [role="separator"]')) return
      activeId = columnId
      startX = event.clientX
      dragging = false
      const element = event.currentTarget as HTMLElement
      element.setPointerCapture?.(event.pointerId)
    },
    move(columnId, event) {
      if (activeId !== columnId) return
      if (!dragging) {
        if (Math.abs(event.clientX - startX) < 4) return
        dragging = true
        ;(event.currentTarget as HTMLElement).dataset['dragging'] = ''
      }
      event.preventDefault()
    },
    end(columnId, event) {
      if (activeId !== columnId) return
      const element = event.currentTarget as HTMLElement
      if (element.hasPointerCapture?.(event.pointerId))
        element.releasePointerCapture(event.pointerId)
      delete element.dataset['dragging']
      if (dragging) {
        // Drop before the header whose midpoint the pointer is over; past the
        // last midpoint means the end. Landing on itself is not a move.
        const target = targetFor(event.clientX)
        if (target !== columnId) deps.move(columnId, target)
      }
      activeId = undefined
      dragging = false
    },
  }
}

/** Clamp a resize target into the column's bounds. */
export function clampSize(size: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(size)))
}

/**
 * One sized `<col>`: the width is written imperatively (the `style` prop is
 * not the idiom) from the column's current size, so a resize reaches the
 * layout without re-rendering the row model.
 */
export function SizedCol(props: { size: number }): JSX.Element {
  let col: HTMLTableColElement | undefined
  createEffect(() => {
    const size = props.size
    if (col) col.style.width = `${size}px`
  })
  return <col ref={(el) => (col = el)} />
}

/**
 * The keyboard twin of the drag handle, on the `role="separator"` pattern
 * `PaneLayout` proved: arrows nudge, Shift moves ten times as far, Home and
 * End jump to the bounds.
 */
export function ColumnResizeHandle(props: {
  label: string
  size: number
  min: number
  max: number
  onResize: (size: number) => void
  onReset: () => void
}): JSX.Element {
  const [dragging, setDragging] = createSignal(false)
  let originX = 0
  let originSize = 0

  const beginDrag = (event: PointerEvent) => {
    if (event.button !== 0) return
    const element = event.currentTarget as HTMLElement
    originX = event.clientX
    originSize = props.size
    event.preventDefault()
    element.setPointerCapture?.(event.pointerId)
    setDragging(true)
  }
  const moveDrag = (event: PointerEvent) => {
    if (!dragging()) return
    event.preventDefault()
    props.onResize(
      clampSize(originSize + (event.clientX - originX), props.min, props.max),
    )
  }
  const endDrag = (event: PointerEvent) => {
    if (!dragging()) return
    setDragging(false)
    const element = event.currentTarget as HTMLElement
    if (element.hasPointerCapture?.(event.pointerId))
      element.releasePointerCapture(event.pointerId)
  }

  const nudge = (step: number) =>
    props.onResize(clampSize(props.size + step, props.min, props.max))
  const onKeyDown = (event: KeyboardEvent) => {
    const step = event.shiftKey ? 32 : 8
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      nudge(-step)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      nudge(step)
    } else if (event.key === 'Home') {
      event.preventDefault()
      props.onResize(props.min)
    } else if (event.key === 'End') {
      event.preventDefault()
      props.onResize(props.max)
    }
  }

  return (
    <button
      type="button"
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${props.label}`}
      aria-valuenow={Math.round(props.size)}
      aria-valuemin={props.min}
      aria-valuemax={props.max}
      data-slot="data-table-resize"
      data-state={dragging() ? 'dragging' : undefined}
      class="absolute inset-y-0 -end-1 z-raised w-1.5 cursor-col-resize rounded-3 focus-visible:focus-ring"
      onPointerDown={beginDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDblClick={() => props.onReset()}
      onKeyDown={onKeyDown}
    />
  )
}

/**
 * The control kind a filter function resolves to. The names are TanStack's
 * eighteen built-ins; anything unknown (including a function) falls back to
 * the text box, which is the right answer for a contains-style matcher.
 */
export function filterKind(
  filterFn: unknown,
): 'text' | 'select' | 'range' | 'date' | 'empty' {
  const name = typeof filterFn === 'string' ? filterFn : ''
  if (
    name === 'inNumberRange' ||
    name === 'between' ||
    name === 'betweenInclusive'
  )
    return 'range'
  if (name === 'inDateRange') return 'date'
  if (name === 'empty' || name === 'notEmpty') return 'empty'
  if (
    name === 'equals' ||
    name === 'equalsString' ||
    name === 'equalsStringSensitive' ||
    name === 'weakEquals' ||
    name.startsWith('arr')
  )
    return 'select'
  return 'text'
}

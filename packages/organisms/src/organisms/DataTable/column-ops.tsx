import { cn, Icon, TextInput } from '@talelk/newui-atoms'
import { NumberInput, Popover, Select } from '@talelk/newui-molecules'
import { createEffect, createSignal, For, type JSX, Show } from 'solid-js'

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

const EMPTY_OPTIONS = [
  { label: 'Is empty', value: 'empty' },
  { label: 'Is not empty', value: 'notEmpty' },
]

/**
 * A filter button opening the right control for the column's filter function.
 * State is TanStack's `columnFilters` — the same array server mode sends to
 * the backend — so client and server filtering stay one vocabulary.
 */
export function ColumnFilter(props: {
  column: FilterColumn
  label: string
  facets?: DataTableFilterFacet[]
}): JSX.Element {
  const [open, setOpen] = createSignal(false)
  const kind = () => filterKind(props.column.columnDef.filterFn)
  const value = () => props.column.getFilterValue()
  // Every control keeps its own string while the popover is open; TanStack's
  // state is the commit, not the binding. A text box bound straight to the
  // filter value would fight the user: each keystroke round-trips through the
  // table and lands back in the input after the next one, dropping characters.
  const [text, setText] = createSignal('')
  const [low, setLow] = createSignal('')
  const [high, setHigh] = createSignal('')
  const seed = () => {
    const current = value()
    if (Array.isArray(current)) {
      setText('')
      setLow(current[0] == null ? '' : String(current[0]))
      setHigh(current[1] == null ? '' : String(current[1]))
    } else {
      setText(current == null ? '' : String(current))
      setLow('')
      setHigh('')
    }
  }
  const commitRange = () => {
    const lo = low() === '' ? undefined : low()
    const hi = high() === '' ? undefined : high()
    set(lo === undefined && hi === undefined ? undefined : [lo, hi])
  }
  const dateValue = (): [unknown, unknown] | undefined => {
    const current = value()
    return Array.isArray(current) ? [current[0], current[1]] : undefined
  }
  const datePart = (index: 0 | 1): string => {
    const part = dateValue()?.[index]
    return part == null ? '' : String(part)
  }
  const commitDate = (index: 0 | 1, next: string): void => {
    const current = dateValue() ?? [undefined, undefined]
    const merged: [unknown, unknown] =
      index === 0
        ? [next === '' ? undefined : next, current[1]]
        : [current[0], next === '' ? undefined : next]
    set(merged)
  }
  const active = () => {
    const current = value()
    if (current === undefined || current === null || current === '')
      return false
    if (Array.isArray(current))
      return current.some(
        (part) => part !== undefined && part !== null && part !== '',
      )
    return true
  }
  const set = (next: unknown) => {
    props.column.setFilterValue(
      next === undefined ||
        next === '' ||
        (Array.isArray(next) &&
          next.every((part) => part === undefined || part === ''))
        ? undefined
        : next,
    )
  }

  return (
    <Popover.Root
      open={open()}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) seed()
      }}
    >
      <Popover.Trigger
        aria-label={`Filter by ${props.label}`}
        data-active={active() ? '' : undefined}
        class={cn(
          'inline-flex size-6 shrink-0 items-center justify-center rounded-3 focus-visible:focus-ring hover:bg-surface-gray-2',
          active() ? 'text-interface' : 'text-ink-gray-6',
        )}
      >
        <Icon
          icon={active() ? 'lucide-filter-check' : 'lucide-filter'}
          class="size-3.5"
        />
      </Popover.Trigger>
      <Popover.Content>
        <div class="flex min-w-48 flex-col gap-2 p-1">
          <Show when={kind() === 'text'}>
            <TextInput
              aria-label={`Filter by ${props.label}`}
              placeholder={`Contains…`}
              size="xs"
              value={text()}
              onInput={(event) => {
                setText(event.currentTarget.value)
                set(event.currentTarget.value)
              }}
            />
          </Show>
          <Show when={kind() === 'select'}>
            <Show
              when={props.facets?.length}
              fallback={
                <TextInput
                  aria-label={`Filter by ${props.label}`}
                  placeholder={`Equals…`}
                  size="xs"
                  value={text()}
                  onInput={(event) => {
                    setText(event.currentTarget.value)
                    set(event.currentTarget.value)
                  }}
                />
              }
            >
              <Select
                aria-label={`Filter by ${props.label}`}
                size="sm"
                placeholder="Any"
                options={(props.facets ?? []).map((facet) => ({
                  label: `${facet.value} (${facet.count})`,
                  value: facet.value,
                }))}
                value={value() == null ? null : String(value())}
                onValueChange={(next) => set(next ?? undefined)}
              />
            </Show>
          </Show>
          <Show when={kind() === 'range'}>
            <div class="flex items-center gap-2">
              <NumberInput
                aria-label={`${props.label} minimum`}
                value={low()}
                onValueChange={(details) => {
                  setLow(details.value)
                  if (details.value !== '') commitRange()
                  else commitRange()
                }}
              />
              <span aria-hidden="true" class="text-ink-gray-6">
                –
              </span>
              <NumberInput
                aria-label={`${props.label} maximum`}
                value={high()}
                onValueChange={(details) => {
                  setHigh(details.value)
                  commitRange()
                }}
              />
            </div>
          </Show>
          <Show when={kind() === 'date'}>
            <div class="flex flex-col gap-1">
              <TextInput
                type="date"
                size="xs"
                aria-label={`${props.label} from`}
                value={datePart(0)}
                onInput={(event) => commitDate(0, event.currentTarget.value)}
              />
              <TextInput
                type="date"
                size="xs"
                aria-label={`${props.label} to`}
                value={datePart(1)}
                onInput={(event) => commitDate(1, event.currentTarget.value)}
              />
            </div>
          </Show>
          <Show when={kind() === 'empty'}>
            <Select
              aria-label={`Filter by ${props.label}`}
              size="sm"
              placeholder="Any"
              options={EMPTY_OPTIONS}
              value={value() == null ? null : String(value())}
              onValueChange={(next) => set(next ?? undefined)}
            />
          </Show>
          <Show when={props.facets?.length && kind() !== 'select'}>
            <div class="flex flex-col gap-0.5 border-t border-outline-gray-1 pt-1">
              <For each={props.facets}>
                {(facet) => (
                  <button
                    type="button"
                    data-slot="data-table-filter-facet"
                    aria-pressed={String(value() ?? '') === facet.value}
                    class="flex items-center justify-between gap-4 rounded-3 px-2 py-1 text-start text-caption hover:bg-surface-gray-2 focus-visible:focus-ring"
                    onClick={() => {
                      set(facet.value)
                      setOpen(false)
                    }}
                  >
                    <span class="truncate">{facet.value}</span>
                    <span class="text-ink-gray-6 tabular-nums">
                      {facet.count}
                    </span>
                  </button>
                )}
              </For>
            </div>
          </Show>
        </div>
      </Popover.Content>
    </Popover.Root>
  )
}

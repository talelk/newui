import { type Accessor, createMemo, createSignal, onCleanup } from 'solid-js'

/**
 * The board's drag gesture.
 *
 * This is not a state machine and there is no Zag machine to reach for: a
 * sortable board is pointer geometry — where the finger is, what it is over, and
 * what has to move as a result. So the whole gesture lives here, behind a
 * factory, with the DOM knowledge (`data-kanban-card`, `data-dragging`) kept in
 * the component and the arithmetic kept in this file.
 *
 * The shape is the reference implementation's, because each piece of it was
 * earned:
 *
 * - **A press is not a drag yet.** A mouse has to travel `MOUSE_THRESHOLD`;
 *   a touch has to hold still for `LIFT_DELAY`, and *stops being a candidate* if
 *   it drifts past `DRIFT_TOLERANCE`, because a finger that moves is scrolling
 *   the board, not picking up a card.
 * - **One rAF loop, not `pointermove`.** A held pointer at the edge keeps
 *   auto-scrolling the containers under itself, which moves the slots the
 *   pointer is not moving over. Position, hit-test and auto-scroll therefore all
 *   run per frame.
 * - **The insertion index counts the *other* cards only.** The dragged card's
 *   slot is skipped, which is what makes the choice self-stabilising: inserting
 *   pushes the boundary card away from the pointer, so it cannot oscillate
 *   between two neighbours.
 * - **Live reordering is a preview, not a mutation.** The reference splices the
 *   real array during the drag and splices it back on cancel. Here the drop is
 *   reported once, at the end: cancelling is then just discarding a signal,
 *   there is no restore path to get wrong, and a controlled board never sees a
 *   move it did not accept.
 */

/** px a mouse must travel before a press becomes a drag. */
export const MOUSE_THRESHOLD = 4
/** px a *held touch* may drift before the gesture is read as a scroll. */
export const DRIFT_TOLERANCE = 8
/** ms a touch must hold before it becomes a drag. */
export const LIFT_DELAY = 250
/** px-wide edge zones that trigger auto-scroll. */
export const EDGE = 48
/** px per frame at the very edge. */
export const EDGE_SPEED = 14
/** ms the ghost glides onto the slot on release. */
export const SETTLE_MS = 150

export interface KanbanSlot {
  column: string
  /** Insertion index counted over the column's *other* items. */
  index: number
}

export interface KanbanDragState<T> {
  item: T
  itemId: string
  /** The grabbed card's size, so the ghost and the slot match it exactly. */
  width: number
  height: number
  /** Ghost top-left, in viewport coordinates. */
  x: number
  y: number
  /** True while the ghost glides onto the slot; the ghost animates only then. */
  settling: boolean
}

/**
 * A press that starts on one of these is a click on that control — a menu, a
 * link, a field — not a grab. `data-kanban-no-drag` is the escape hatch for
 * anything else interactive a card contains.
 */
const INTERACTIVE = 'button, a, input, select, textarea, [data-kanban-no-drag]'

export interface KanbanDragOptions<T extends { id: string }> {
  /** The element that scrolls horizontally — the board's viewport. */
  container: () => HTMLElement | undefined
  /** The element that scrolls vertically, per column. */
  columnScroller: (columnId: string) => HTMLElement | undefined
  /** Column ids in render order. */
  columnIds: () => string[]
  /** Where the item sits right now: the live preview, else its slot in the data. */
  slotOf: (itemId: string) => KanbanSlot | undefined
  /** The pointer crossed into another slot. The board re-renders from this. */
  onPreview: (itemId: string, to: KanbanSlot) => void
  /** Released somewhere new. `from` is where the gesture started. */
  onDrop: (item: T, from: KanbanSlot, to: KanbanSlot) => void
  /** Released where it started, or cancelled. */
  onCancel: () => void
}

export interface KanbanDrag<T> {
  state: Accessor<KanbanDragState<T> | undefined>
  /** Begin tracking a press on a card. */
  start: (event: PointerEvent, item: T, card: HTMLElement) => void
  isDragging: (itemId: string) => boolean
  /** Abandon the gesture, putting the card back where it was. */
  cancel: () => void
}

interface Pending<T> {
  item: T
  card: HTMLElement
  startX: number
  startY: number
  mouse: boolean
  timer: number
}

export function createKanbanDrag<T extends { id: string }>(
  options: KanbanDragOptions<T>,
): KanbanDrag<T> {
  /**
   * Two signals, not one: the position changes every frame, and the cards read
   * only *which* item is lifted. One signal would re-render every card in the
   * board sixty times a second to move one ghost.
   */
  const [lifted, setLifted] = createSignal<Omit<
    KanbanDragState<T>,
    'x' | 'y' | 'settling'
  > | null>(null)
  const [ghost, setGhost] = createSignal<{
    x: number
    y: number
    settling: boolean
  } | null>(null)

  const state = createMemo<KanbanDragState<T> | undefined>(() => {
    const active = lifted()
    const position = ghost()
    return active && position ? { ...active, ...position } : undefined
  })

  const pointer = { x: 0, y: 0 }
  const grab = { x: 0, y: 0 }
  let pending: Pending<T> | undefined
  let from: KanbanSlot | undefined
  let frame = 0
  let settle = 0
  // Whether the window listeners are on. Without this, teardown after a
  // cancelled press removes listeners that are already gone, and "we remove
  // exactly what we added" stops being true.
  let watching = false
  let holding = false

  const motionAllowed = () =>
    typeof matchMedia !== 'function' ||
    !matchMedia('(prefers-reduced-motion: reduce)').matches

  function preventScroll(event: TouchEvent) {
    // While a card is lifted, the gesture is ours: the only way to stop the
    // browser from starting a scroll (which would fire `pointercancel` and kill
    // the drag) is a non-passive listener on `touchmove`.
    event.preventDefault()
  }

  function watch() {
    if (watching) return
    watching = true
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerCancel)
  }

  function releaseListeners() {
    if (watching) {
      watching = false
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerCancel)
    }
    if (holding) {
      holding = false
      window.removeEventListener('touchmove', preventScroll)
    }
  }

  function stopFrame() {
    cancelAnimationFrame(frame)
    frame = 0
  }

  /** Tear the gesture down. Never reports: this is what unmount does. */
  function teardown() {
    if (pending) {
      clearTimeout(pending.timer)
      pending = undefined
    }
    clearTimeout(settle)
    settle = 0
    stopFrame()
    releaseListeners()
  }

  function cancelPending() {
    if (pending) clearTimeout(pending.timer)
    pending = undefined
    releaseListeners()
  }

  function endDrag() {
    teardown()
    setLifted(null)
    setGhost(null)
    from = undefined
  }

  function start(event: PointerEvent, item: T, card: HTMLElement) {
    if (lifted() || pending) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if ((event.target as Element | null)?.closest(INTERACTIVE)) return

    pointer.x = event.clientX
    pointer.y = event.clientY
    const mouse = event.pointerType === 'mouse'

    pending = {
      item,
      card,
      startX: event.clientX,
      startY: event.clientY,
      mouse,
      // A mouse lifts on drift; a finger has to hold still, because a finger
      // that moves is scrolling.
      timer: mouse ? 0 : window.setTimeout(() => lift(), LIFT_DELAY),
    }

    watch()
  }

  function lift() {
    const armed = pending
    if (!armed) return
    clearTimeout(armed.timer)
    pending = undefined

    const slot = options.slotOf(armed.item.id)
    if (!slot) return releaseListeners()

    const rect = armed.card.getBoundingClientRect()
    from = slot
    grab.x = pointer.x - rect.left
    grab.y = pointer.y - rect.top
    setLifted({
      item: armed.item,
      itemId: armed.item.id,
      width: rect.width,
      height: rect.height,
    })
    setGhost({ x: rect.left, y: rect.top, settling: false })

    if (!holding) {
      holding = true
      window.addEventListener('touchmove', preventScroll, { passive: false })
    }
    navigator.vibrate?.(10)
    frame = requestAnimationFrame(tick)
  }

  function tick() {
    const active = lifted()
    if (!active) return
    setGhost((current) =>
      current
        ? { ...current, x: pointer.x - grab.x, y: pointer.y - grab.y }
        : current,
    )
    autoscroll(active.itemId)
    updateSlot(active.itemId)
    frame = requestAnimationFrame(tick)
  }

  /** Where the pointer is over, expressed as a slot for the item. */
  function slotUnderPointer(): KanbanSlot | undefined {
    for (const columnId of options.columnIds()) {
      const element = options.columnScroller(columnId)
      if (!element) continue
      const rect = element.getBoundingClientRect()
      // The gaps between columns are not drop targets: leaving the item where
      // it is beats guessing which neighbour the pointer meant.
      if (pointer.x < rect.left || pointer.x > rect.right) continue

      let index = 0
      for (const card of element.querySelectorAll(
        '[data-kanban-card]:not([data-dragging])',
      )) {
        const bounds = card.getBoundingClientRect()
        if (pointer.y > bounds.top + bounds.height / 2) index += 1
      }
      return { column: columnId, index }
    }
    return undefined
  }

  function updateSlot(itemId: string) {
    const slot = slotUnderPointer()
    if (!slot) return
    const current = options.slotOf(itemId)
    if (
      current &&
      current.column === slot.column &&
      current.index === slot.index
    )
      return
    options.onPreview(itemId, slot)
  }

  function autoscroll(itemId: string) {
    const step = (overshoot: number) =>
      Math.ceil((Math.min(overshoot, EDGE) / EDGE) * EDGE_SPEED)

    const board = options.container()
    if (board) {
      const rect = board.getBoundingClientRect()
      if (pointer.x < rect.left + EDGE)
        board.scrollLeft -= step(rect.left + EDGE - pointer.x)
      else if (pointer.x > rect.right - EDGE)
        board.scrollLeft += step(pointer.x - (rect.right - EDGE))
    }

    const column = options.slotOf(itemId)?.column
    const scroller = column ? options.columnScroller(column) : undefined
    if (scroller) {
      const rect = scroller.getBoundingClientRect()
      if (pointer.y < rect.top + EDGE)
        scroller.scrollTop -= step(rect.top + EDGE - pointer.y)
      else if (pointer.y > rect.bottom - EDGE)
        scroller.scrollTop += step(pointer.y - (rect.bottom - EDGE))
    }
  }

  function commit() {
    const active = lifted()
    const to = active ? options.slotOf(active.itemId) : undefined
    const started = from
    if (active && to && started) {
      if (to.column !== started.column || to.index !== started.index)
        options.onDrop(active.item, started, to)
      else options.onCancel()
    } else {
      options.onCancel()
    }
    endDrag()
  }

  function onPointerMove(event: PointerEvent) {
    pointer.x = event.clientX
    pointer.y = event.clientY
    if (!pending) return
    const drift = Math.hypot(
      event.clientX - pending.startX,
      event.clientY - pending.startY,
    )
    if (pending.mouse) {
      if (drift > MOUSE_THRESHOLD) lift()
    } else if (drift > DRIFT_TOLERANCE) {
      cancelPending()
    }
  }

  function onPointerUp() {
    if (pending) return cancelPending()
    const active = lifted()
    if (!active || ghost()?.settling) return

    // Land the ghost on the slot, then reveal the real card. The slot has held
    // the item's place since it lifted, so the reveal is a swap with no entry
    // animation and nothing else in the column moves.
    const slot = options
      .container()
      ?.querySelector<HTMLElement>('[data-kanban-card][data-dragging]')
    const landing = slot?.getBoundingClientRect()

    if (!landing) return commit()

    if (!motionAllowed()) {
      setGhost({ x: landing.left, y: landing.top, settling: true })
      return commit()
    }

    setGhost({ x: landing.left, y: landing.top, settling: true })
    settle = window.setTimeout(commit, SETTLE_MS)
  }

  function onPointerCancel() {
    // A cancelled pointer is the browser taking the gesture back (a scroll
    // won, the window lost focus): put the card down.
    if (pending) return cancelPending()
    if (!lifted()) return
    options.onCancel()
    endDrag()
  }

  function cancel() {
    if (pending) return cancelPending()
    if (!lifted() || ghost()?.settling) return
    options.onCancel()
    endDrag()
  }

  onCleanup(teardown)

  return {
    state,
    start,
    isDragging: (itemId: string) => lifted()?.itemId === itemId,
    cancel,
  }
}

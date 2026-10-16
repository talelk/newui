import { createRoot } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createKanbanDrag,
  type KanbanDrag,
  type KanbanDragOptions,
  type KanbanSlot,
} from './drag'

/**
 * The gesture is tested against fabricated geometry, because that is the only
 * way to test it at all: jsdom reports every box as a zero rect, so "is the
 * pointer past this card's midpoint" would be unanswerable. Every element the
 * engine touches is injected, so the boxes are just numbers here — the
 * thresholds, the hit-test arithmetic, the auto-scroll edges and the drop
 * payload are asserted directly rather than through a drag the harness cannot
 * perform.
 *
 * The frame loop is stubbed rather than timed: `frame()` runs exactly one tick,
 * so a test says how many frames it means instead of waiting for one.
 */

interface Box {
  left: number
  top: number
  width: number
  height: number
}

function boxed(box: Box, cards: FakeCard[] = []): HTMLElement {
  const node = document.createElement('div')
  node.getBoundingClientRect = () => rect(box)
  for (const card of cards) {
    const inner = document.createElement('div')
    inner.setAttribute('data-kanban-card', '')
    inner.setAttribute('data-kanban-id', card.id)
    if (card.dragging) inner.setAttribute('data-dragging', '')
    inner.getBoundingClientRect = () =>
      rect({
        left: box.left,
        top: card.top,
        width: box.width,
        height: card.height,
      })
    node.append(inner)
  }
  return node
}

interface FakeCard {
  id: string
  top: number
  height: number
  dragging?: boolean
}

function rect(box: Box): DOMRect {
  return {
    x: box.left,
    y: box.top,
    left: box.left,
    top: box.top,
    right: box.left + box.width,
    bottom: box.top + box.height,
    width: box.width,
    height: box.height,
    toJSON: () => ({}),
  } as DOMRect
}

/** jsdom's `scrollLeft`/`scrollTop` never move without layout; make them fields. */
function scrollable(node: HTMLElement): HTMLElement {
  Object.defineProperty(node, 'scrollLeft', { value: 0, writable: true })
  Object.defineProperty(node, 'scrollTop', { value: 0, writable: true })
  return node
}

/** A `pointerdown`-shaped event: jsdom has no PointerEvent constructor. */
function pointer(
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  options: { x: number; y: number; pointerType?: string; button?: number },
  // `window` too: the engine listens for the move and the release there.
  target?: EventTarget,
): PointerEvent {
  const event = new MouseEvent(type, {
    clientX: options.x,
    clientY: options.y,
    button: options.button ?? 0,
    bubbles: true,
  }) as unknown as PointerEvent
  Object.defineProperty(event, 'pointerType', {
    value: options.pointerType ?? 'mouse',
  })
  target?.dispatchEvent(event)
  return event
}

interface Harness extends KanbanDragOptions<{ id: string }> {
  drag: KanbanDrag<{ id: string }>
  previews: { itemId: string; slot: KanbanSlot }[]
  drops: { item: { id: string }; from: KanbanSlot; to: KanbanSlot }[]
  cancels: number
  board: HTMLElement
  column: HTMLElement
  card: HTMLElement
  frame: () => void
  press: (at?: { x: number; y: number }, pointerType?: string) => void
  move: (at: { x: number; y: number }) => void
  up: (at?: { x: number; y: number }) => void
  dispose: () => void
}

function harness(overrides: Partial<KanbanDragOptions<{ id: string }>> = {}) {
  let tick: FrameRequestCallback | undefined
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    tick = callback
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', () => {
    tick = undefined
  })

  const board = scrollable(boxed({ left: 0, top: 0, width: 1200, height: 600 }))
  // The board holds the slot the ghost lands on: the element the component
  // marks while a card is in flight.
  board.append(
    boxed({ left: 16, top: 300, width: 288, height: 100 }, [
      { id: 'slot', top: 300, height: 100, dragging: true },
    ]),
  )
  const column = scrollable(
    boxed({ left: 16, top: 60, width: 288, height: 520 }, [
      { id: 'a', top: 80, height: 100 },
      { id: 'b', top: 190, height: 100 },
      { id: 'c', top: 300, height: 100 },
    ]),
  )
  const won = scrollable(boxed({ left: 316, top: 60, width: 288, height: 520 }))

  /** The grabbed card's own box: the ghost and the slot both match it. */
  const card = boxed({ left: 16, top: 80, width: 288, height: 100 })

  const test = {
    board,
    column,
    card,
    previews: [] as Harness['previews'],
    drops: [] as Harness['drops'],
    cancels: 0,
  } as Harness

  /**
   * Where the item sits, as the board would answer it: the preview *is* the
   * placement once reported, which is what makes the engine's "has it actually
   * changed?" check meaningful instead of always true.
   */
  let current: KanbanSlot = { column: 'open', index: 0 }

  test.frame = () => {
    const current = tick
    tick = undefined
    current?.(0)
  }
  test.press = (at = { x: 100, y: 100 }, pointerType = 'mouse') => {
    const event = pointer('pointerdown', { ...at, pointerType }, test.card)
    test.drag.start(event, { id: 'a' }, test.card)
  }
  test.move = (at) => pointer('pointermove', { ...at }, window)
  test.up = (at = { x: 0, y: 0 }) => pointer('pointerup', { ...at }, window)

  createRoot((dispose) => {
    test.dispose = dispose
    test.drag = createKanbanDrag<{ id: string }>({
      container: () => board,
      columnScroller: (id) => (id === 'open' ? column : won),
      columnIds: () => ['open', 'won'],
      slotOf: () => current,
      onPreview: (itemId, slot) => {
        current = slot
        test.previews.push({ itemId, slot })
      },
      onDrop: (item, from, to) => test.drops.push({ item, from, to }),
      onCancel: () => {
        test.cancels += 1
      },
      ...overrides,
    })
  })

  return test
}

/** Press, then drift past the mouse threshold: the card is in the air. */
function lift(test: Harness, at = { x: 100, y: 100 }) {
  test.press(at)
  test.move({ x: at.x + 6, y: at.y })
}

/** Run the settle timer the release started. */
const drop = () => vi.advanceTimersByTime(1000)

describe('createKanbanDrag', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('does not lift a card on a press that never moves', () => {
    const test = harness()
    test.press()
    test.up({ x: 100, y: 100 })

    expect(test.drag.state()).toBeUndefined()
    expect(test.drops).toEqual([])
    expect(test.cancels).toBe(0)
    test.dispose()
  })

  it('lifts once the mouse travels past the threshold', () => {
    const test = harness()
    test.press()
    test.move({ x: 103, y: 100 })
    expect(test.drag.state()).toBeUndefined()

    test.move({ x: 106, y: 100 })
    expect(test.drag.state()?.itemId).toBe('a')
    // The ghost starts exactly on the card it replaced.
    expect(test.drag.state()?.x).toBe(16)
    expect(test.drag.state()?.y).toBe(80)
    expect(test.drag.state()?.width).toBe(288)
    expect(test.drag.state()?.height).toBe(100)
    test.dispose()
  })

  it('reads a drifting finger as a scroll, and a still one as a grab', () => {
    const drifting = harness()
    drifting.press({ x: 100, y: 100 }, 'touch')
    drifting.move({ x: 130, y: 100 })
    vi.advanceTimersByTime(400)
    expect(drifting.drag.state()).toBeUndefined()
    drifting.dispose()

    const holding = harness()
    holding.press({ x: 100, y: 100 }, 'touch')
    vi.advanceTimersByTime(400)
    expect(holding.drag.state()?.itemId).toBe('a')
    holding.dispose()
  })

  it('knows which item is in the air', () => {
    const test = harness()
    lift(test)
    expect(test.drag.isDragging('a')).toBe(true)
    expect(test.drag.isDragging('b')).toBe(false)
    test.dispose()
  })

  it('leaves a press that starts on a control inside the card alone', () => {
    const test = harness()
    const button = document.createElement('button')
    const event = pointer('pointerdown', { x: 100, y: 100 }, button)
    test.drag.start(event, { id: 'a' }, test.card)
    test.move({ x: 160, y: 100 })

    expect(test.drag.state()).toBeUndefined()
    expect(test.cancels).toBe(0)
    test.dispose()
  })

  it('counts the insertion index over the other cards only', () => {
    const test = harness()
    lift(test)

    // The item is already at the top, so a frame over that spot changes nothing
    // and the board is not asked to re-render.
    test.frame()
    expect(test.previews).toEqual([])

    // Past the first card's midpoint (80 + 100 / 2 = 130), and nothing else's.
    test.move({ x: 100, y: 140 })
    test.frame()
    expect(test.previews.at(-1)?.slot).toEqual({ column: 'open', index: 1 })

    // Past the second's (240), not the third's (350).
    test.move({ x: 100, y: 250 })
    test.frame()
    expect(test.previews.at(-1)?.slot).toEqual({ column: 'open', index: 2 })

    // And back above them all.
    test.move({ x: 100, y: 70 })
    test.frame()
    expect(test.previews.at(-1)?.slot).toEqual({ column: 'open', index: 0 })
    test.dispose()
  })

  it('reports a slot once, not once per frame', () => {
    const test = harness()
    lift(test)
    test.move({ x: 100, y: 140 })
    test.frame()
    test.frame()
    test.frame()
    // The first frame crossed into a new slot; the next two did not.
    expect(test.previews).toEqual([
      { itemId: 'a', slot: { column: 'open', index: 1 } },
    ])
    test.dispose()
  })

  it('previews nothing while the pointer is in the gap between columns', () => {
    const test = harness()
    lift(test)
    test.move({ x: 300, y: 100 })
    test.frame()

    // 300 is past the first column's right edge (304 would be inside it) and
    // short of the second's left one (316): neither column is a target.
    expect(test.previews).toEqual([])
    test.dispose()
  })

  it('moves the ghost with the pointer, holding where it was grabbed', () => {
    const test = harness()
    lift(test)
    // Grabbed 90px in from the card's left edge, 20px from its top.
    test.frame()
    expect(test.drag.state()?.x).toBe(16)
    expect(test.drag.state()?.y).toBe(80)

    test.move({ x: 400, y: 260 })
    test.frame()
    expect(test.drag.state()?.x).toBe(310)
    expect(test.drag.state()?.y).toBe(240)
    test.dispose()
  })

  it('auto-scrolls the board and the column at their edges', () => {
    const board = scrollable(
      boxed({ left: 0, top: 0, width: 600, height: 600 }),
    )
    board.append(
      boxed({ left: 16, top: 300, width: 288, height: 100 }, [
        { id: 'slot', top: 300, height: 100, dragging: true },
      ]),
    )
    const column = scrollable(
      boxed({ left: 16, top: 60, width: 288, height: 520 }, [
        { id: 'a', top: 80, height: 100 },
      ]),
    )
    const test = harness({
      container: () => board,
      columnScroller: () => column,
    })

    // Top-left: both scrollers drift back.
    test.press({ x: 30, y: 100 })
    test.move({ x: 36, y: 100 })
    test.frame()
    expect(board.scrollLeft).toBeLessThan(0)
    expect(column.scrollTop).toBeLessThan(0)

    // Bottom-right: both drift forward.
    test.move({ x: 590, y: 560 })
    test.frame()
    expect(board.scrollLeft).toBeGreaterThan(0)
    expect(column.scrollTop).toBeGreaterThan(0)
    test.dispose()
  })

  it('reports the drop once, with where the gesture started', () => {
    const test = harness()
    test.press({ x: 100, y: 70 })
    test.move({ x: 400, y: 300 })
    test.frame()
    test.up({ x: 400, y: 300 })
    drop()

    expect(test.drops).toHaveLength(1)
    expect(test.drops[0]?.item).toEqual({ id: 'a' })
    expect(test.drops[0]?.from).toEqual({ column: 'open', index: 0 })
    expect(test.drops[0]?.to).toEqual({ column: 'won', index: 0 })
    expect(test.drag.state()).toBeUndefined()

    // The gesture is over: a second release is not a second move.
    test.up({ x: 400, y: 300 })
    expect(test.drops).toHaveLength(1)
    test.dispose()
  })

  it('cancels when the card is put back where it started', () => {
    const test = harness()
    lift(test)
    test.up({ x: 106, y: 100 })
    drop()

    expect(test.drops).toEqual([])
    expect(test.cancels).toBe(1)
    expect(test.drag.state()).toBeUndefined()
    test.dispose()
  })

  it('cancels on Escape, and when the browser takes the gesture back', () => {
    const escaped = harness()
    lift(escaped)
    escaped.drag.cancel()
    expect(escaped.cancels).toBe(1)
    expect(escaped.drag.state()).toBeUndefined()
    escaped.dispose()

    const cancelled = harness()
    lift(cancelled)
    pointer('pointercancel', { x: 106, y: 100 }, window)
    expect(cancelled.cancels).toBe(1)
    expect(cancelled.drag.state()).toBeUndefined()
    cancelled.dispose()
  })

  it('takes every listener and timer back when it is disposed', () => {
    const added = vi.spyOn(window, 'addEventListener')
    const removed = vi.spyOn(window, 'removeEventListener')
    const cleared = vi.spyOn(window, 'clearTimeout')

    const test = harness()
    test.press({ x: 100, y: 100 }, 'touch')
    test.move({ x: 130, y: 100 })
    test.dispose()

    expect(removed.mock.calls.map((call) => call[0]).sort()).toEqual(
      added.mock.calls.map((call) => call[0]).sort(),
    )
    expect(cleared).toHaveBeenCalled()
    expect(test.drag.state()).toBeUndefined()
  })

  it('survives a press on an item the board no longer has', () => {
    const test = harness({ slotOf: () => undefined })
    lift(test)

    expect(test.drag.state()).toBeUndefined()
    test.up({ x: 106, y: 100 })
    expect(test.cancels).toBe(0)
    test.dispose()
  })
})

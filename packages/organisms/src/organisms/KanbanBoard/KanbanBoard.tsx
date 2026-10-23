import {
  Button,
  cn,
  Icon,
  type IconProp,
  Portal,
  ScrollArea,
} from '@talelk/newui-atoms'
import { Card, Menu } from '@talelk/newui-molecules'
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  onCleanup,
  Show,
} from 'solid-js'
import { DataState } from '../DataState'
import { createKanbanDrag, type KanbanSlot } from './drag'

export type KanbanTone = 'gray' | 'amber' | 'blue' | 'green' | 'red' | 'violet'

/**
 * Literal classes: Tailwind scans for whole names, so `bg-surface-${tone}-7`
 * would compile to nothing. `css:check` fails on that, which is why.
 */
const TONES: Record<KanbanTone, string> = {
  gray: 'bg-surface-gray-7',
  amber: 'bg-surface-amber-7',
  blue: 'bg-surface-blue-7',
  green: 'bg-surface-green-7',
  red: 'bg-surface-red-7',
  violet: 'bg-surface-violet-7',
}

/** ms the cards around a moving slot take to slide to their new places. */
const FLIP_MS = 200

export interface KanbanColumn<T> {
  id: string
  /**
   * Plain text on purpose: it is the column's heading, its accessible name, and
   * the entry a card's menu offers when moving the card here. One string, so the
   * three can never disagree.
   */
  name: string
  /** Status dot tone. Omit for no dot. */
  theme?: KanbanTone
  items: T[]
  /** Muted line under the heading — a column total, a filter summary. */
  summary?: JSX.Element
  /** A trailing control in the heading, usually "add". */
  action?: { label: string; icon?: IconProp; onClick?: () => void }
}

export interface KanbanMove<T> {
  item: T
  itemId: string
  from: KanbanSlot
  to: KanbanSlot
  /** The columns with the move applied — the next value for a controlled board. */
  columns: KanbanColumn<T>[]
}

export interface KanbanBoardProps<T extends { id: string }> {
  /** Controlled columns. When given, the board never changes them itself. */
  columns?: KanbanColumn<T>[]
  /** Uncontrolled initial columns. The board owns them from here. */
  defaultColumns?: KanbanColumn<T>[]
  /** Fires on every accepted drop, controlled or not. */
  onMove?: (move: KanbanMove<T>) => void
  /** The card body. The frame — grab, ghost, move menu — belongs to the block. */
  children: (item: T) => JSX.Element
  /** Replaces the built-in "Move to…" menu on every card. */
  renderActions?: (item: T) => JSX.Element
  /** Accessible name for the board region. */
  label?: string
  /** How a card is named in its menu and its accessible name. Defaults to its id. */
  itemLabel?: (item: T) => string
  /** Rendered in a column with no cards. */
  emptyColumn?: (column: KanbanColumn<T>) => JSX.Element
  /** Replaces the board with the shared loading skeleton. */
  loading?: boolean
  /** Replaces the board with the shared error state. */
  error?: JSX.Element
  onRetry?: () => void
  class?: string
}

/**
 * Move an item to a slot, without mutating the input.
 *
 * `to.index` counts the column's *other* items — the index to insert at once the
 * item has been taken out, which is the number the drag gesture produces and the
 * one a `splice` pair wants. Getting this wrong is an off-by-one that only shows
 * when dragging downwards, so it is stated once, here, and pinned by a test.
 */
export function placeKanbanItem<T extends { id: string }>(
  columns: KanbanColumn<T>[],
  itemId: string,
  to: KanbanSlot,
): KanbanColumn<T>[] {
  const from = columns.find((column) =>
    column.items.some((item) => item.id === itemId),
  )
  const record = from?.items.find((item) => item.id === itemId)
  if (!from || !record) return columns

  const moved: KanbanColumn<T>[] = columns.map((column) => {
    if (column.id !== from.id && column.id !== to.column) return column
    const items = column.items.filter((item) => item.id !== itemId)
    if (column.id === to.column) {
      const index = Math.max(0, Math.min(to.index, items.length))
      items.splice(index, 0, record)
    }
    return { ...column, items }
  })

  // A move that changes nothing should compare equal to what came in, so a
  // consumer diffing the value does not re-render the world.
  if (from.id === to.column) {
    const after = moved.find((column) => column.id === from.id)?.items
    if (
      after &&
      from.items.length === after.length &&
      from.items.every((item, index) => item === after[index])
    )
      return columns
  }
  return moved
}

/**
 * A board of columns you drag cards between.
 *
 * **The gesture is an enhancement, not the only way.** Every card carries a
 * "Move to…" menu listing the other columns, so the board is operable from the
 * keyboard and from a screen reader. The reference implementation is
 * pointer-only, which puts reordering out of reach without a mouse; that is a
 * gap to close, not a detail to copy.
 *
 * **Reordering is previewed, then committed once.** The reference splices the
 * caller's data during the drag and splices it back on cancel. Here the drop is
 * reported a single time, at the end — cancelling is discarding a preview, so
 * there is no restore path that can drift out of sync with the data, and a
 * controlled board never receives a move it did not accept.
 *
 * `columns` makes it controlled, `defaultColumns` makes it own its state; either
 * way `onMove` reports the accepted move with the next columns already computed.
 */
export function KanbanBoard<T extends { id: string }>(
  props: KanbanBoardProps<T>,
): JSX.Element {
  const [internal, setInternal] = createSignal<KanbanColumn<T>[]>(
    props.defaultColumns ?? [],
  )
  const isControlled = () => props.columns !== undefined
  const columns = () => props.columns ?? internal()
  const nameOf = (item: T) => props.itemLabel?.(item) ?? item.id

  /** The live preview of the item in flight: a slot, not a commit. */
  const [preview, setPreview] = createSignal<KanbanSlot & { itemId: string }>()

  const rendered = createMemo(() => {
    const slot = preview()
    return slot ? placeKanbanItem(columns(), slot.itemId, slot) : columns()
  })

  /**
   * The columns are walked by *id*, not by object.
   *
   * A controlled board is handed fresh column objects whenever its owner
   * re-renders — a keystroke in a filter, a re-sorted list. Keying the rows on
   * those objects would throw each column's DOM away and build it again: the
   * scroll position resets, the ScrollArea machine remounts, and any card in
   * flight loses the element the gesture is holding. An id survives both.
   */
  const columnIds = createMemo(() => rendered().map((column) => column.id))
  const status = () =>
    props.loading
      ? ('loading' as const)
      : props.error
        ? ('error' as const)
        : columnIds().length === 0
          ? ('empty' as const)
          : ('ready' as const)
  const columnOf = (columnId: string): KanbanColumn<T> =>
    rendered().find((column) => column.id === columnId) ?? {
      id: columnId,
      name: columnId,
      items: [],
    }

  let boardRoot: HTMLDivElement | undefined
  const columnRoots = new Map<string, HTMLElement>()

  const boardScroller = () =>
    boardRoot?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    ) ?? undefined

  /**
   * A column's vertical scroller is the ScrollArea machine's viewport, which the
   * machine owns and hands out no ref for. The column's own root *is* ours, so
   * the viewport is looked up inside it — the one honest way to reach an element
   * the library keeps.
   */
  const columnScroller = (columnId: string): HTMLElement | undefined =>
    columnRoots
      .get(columnId)
      ?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]') ??
    undefined

  const slotOf = (itemId: string): KanbanSlot | undefined => {
    for (const column of rendered()) {
      const index = column.items.findIndex((item) => item.id === itemId)
      if (index !== -1) return { column: column.id, index }
    }
    return undefined
  }

  const motionAllowed = () =>
    typeof matchMedia !== 'function' ||
    !matchMedia('(prefers-reduced-motion: reduce)').matches

  function measure(): Map<string, DOMRect> {
    const rects = new Map<string, DOMRect>()
    const cards =
      boardRoot?.querySelectorAll<HTMLElement>('[data-kanban-card]') ?? []
    for (const card of cards) {
      const id = card.dataset['kanbanId']
      if (id) rects.set(id, card.getBoundingClientRect())
    }
    return rects
  }

  /**
   * FLIP: reorder first (Solid moves the nodes synchronously), then play each
   * card back from where it was. `Element.animate` rather than a transition
   * class, so there is nothing to clean up afterwards — and it is skipped
   * entirely when motion is reduced, which the Web Animations API does not do on
   * its own.
   */
  function playFlip(before: Map<string, DOMRect>) {
    if (!motionAllowed()) return
    const cards =
      boardRoot?.querySelectorAll<HTMLElement>('[data-kanban-card]') ?? []
    for (const card of cards) {
      const id = card.dataset['kanbanId']
      const was = id ? before.get(id) : undefined
      if (!was || typeof card.animate !== 'function') continue
      const now = card.getBoundingClientRect()
      const dx = was.left - now.left
      const dy = was.top - now.top
      if (dx === 0 && dy === 0) continue
      card.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        { duration: FLIP_MS, easing: 'ease' },
      )
    }
  }

  function previewTo(itemId: string, to: KanbanSlot) {
    const before = measure()
    setPreview({ itemId, ...to })
    playFlip(before)
  }

  function settle(
    item: T | undefined,
    from: KanbanSlot | undefined,
    to: KanbanSlot | undefined,
  ) {
    setPreview(undefined)
    if (!item || !from || !to) return
    const next = placeKanbanItem(columns(), item.id, to)
    if (!isControlled()) setInternal(next)
    props.onMove?.({ item, itemId: item.id, from, to, columns: next })
  }

  const drag = createKanbanDrag<T>({
    container: boardScroller,
    columnScroller,
    columnIds,
    slotOf,
    onPreview: previewTo,
    onDrop: (item, from, to) => settle(item, from, to),
    onCancel: () => settle(undefined, undefined, undefined),
  })

  /** The keyboard path: same commit as a drop, at the end of the target column. */
  const moveTo = (item: T, columnId: string) => {
    const from = slotOf(item.id)
    if (!from || from.column === columnId) return
    settle(item, from, {
      column: columnId,
      index: columnOf(columnId).items.length,
    })
  }

  createEffect(() => {
    if (!drag.state()) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      drag.cancel()
    }
    window.addEventListener('keydown', onKey)
    onCleanup(() => window.removeEventListener('keydown', onKey))
  })

  return (
    <div
      ref={boardRoot}
      data-slot="kanban-board"
      data-kanban-dragging={drag.state() ? '' : undefined}
      class={cn('flex min-h-0 flex-col', props.class)}
    >
      <Show
        when={status() === 'ready'}
        fallback={
          <DataState
            status={status()}
            skeleton="cards"
            title={props.emptyColumn ? undefined : 'No columns yet'}
            error={props.error}
            onRetry={props.onRetry}
          />
        }
      >
        <ScrollArea.Root class="min-h-0 flex-1">
          <ScrollArea.Viewport>
            <ul
              // A list of columns, each holding a list of cards: the structure a
              // screen reader walks. The drag is invisible to it, which is exactly
              // why the card menu exists.
              class={cn(
                'flex h-full min-w-max items-stretch gap-card-gap p-card-pad',
                // Below `lg` the board is a phone-width panner, and there the
                // reference snaps: a column that lands half-off the edge is a
                // column you cannot read. Wide, it is a drag surface, and snapping
                // under a pointer mid-drop is just fighting the user.
                'max-lg:snap-x max-lg:snap-mandatory max-lg:scroll-px-4',
                // Text selection during a drag turns a card into a smear.
                drag.state() && 'select-none',
              )}
              aria-label={props.label ?? 'Board'}
            >
              <For each={columnIds()}>
                {(columnId) => {
                  const column = () => columnOf(columnId)
                  return (
                    <li
                      ref={(element) => columnRoots.set(columnId, element)}
                      data-kanban-column={columnId}
                      class="flex min-h-0 w-72 shrink-0 flex-col rounded-card border border-outline-gray-1 bg-surface-gray-1 max-lg:snap-start dark:bg-transparent"
                    >
                      <div class="flex items-center justify-between gap-2 pe-1 ps-3 pt-1 pb-2">
                        <div class="flex min-w-0 items-center gap-2">
                          <Show when={column().theme}>
                            {(tone) => (
                              <span
                                class={cn('size-2 rounded-full', TONES[tone()])}
                                aria-hidden="true"
                              />
                            )}
                          </Show>
                          {/* `h2`, like the reference: the board is the page's
                            main content, and a card's own headings then nest
                            under it. An `h3` here trips the heading-order rule
                            on every screen whose board sits directly under an
                            `h1`. */}
                          <h2 class="truncate text-sm-medium text-ink-gray-8">
                            {column().name}
                          </h2>
                          {/* The count sits on the column's tinted surface, so it
                            is `ink-gray-6`: the step above fails AA here. */}
                          <span class="text-sm text-ink-gray-6">
                            {column().items.length}
                          </span>
                        </div>
                        <Show when={column().action}>
                          {(action) => (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={action().icon ?? 'lucide-plus'}
                              aria-label={action().label}
                              onClick={action().onClick}
                            />
                          )}
                        </Show>
                      </div>

                      <Show when={column().summary}>
                        <div class="ps-3 pb-2 text-sm tabular-nums text-ink-gray-6">
                          {column().summary}
                        </div>
                      </Show>

                      <ScrollArea.Root class="min-h-0 flex-1">
                        <ScrollArea.Viewport class="px-2 pb-2">
                          <ul class="flex min-h-24 flex-col gap-2">
                            <For
                              each={column().items}
                              fallback={
                                <li class="rounded-5 border border-dashed border-outline-gray-3 p-6 text-center text-sm text-ink-gray-6">
                                  {props.emptyColumn?.(column()) ??
                                    'Nothing in this column.'}
                                </li>
                              }
                            >
                              {(item) => (
                                <li
                                  data-kanban-card=""
                                  data-kanban-id={item.id}
                                  data-dragging={
                                    drag.isDragging(item.id) ? '' : undefined
                                  }
                                  // Wrapped: a handler read straight off an
                                  // accessor is captured once, and this one needs
                                  // the live element.
                                  onPointerDown={(event) =>
                                    drag.start(event, item, event.currentTarget)
                                  }
                                  class="shrink-0"
                                >
                                  <Show
                                    when={!drag.isDragging(item.id)}
                                    fallback={
                                      // The card that was picked up keeps its
                                      // place as the hole the ghost lands on, so
                                      // the column does not reflow when it lifts.
                                      <div
                                        class="rounded-5 border-2 border-dashed border-outline-gray-2 bg-surface-gray-2"
                                        style={{
                                          height: `${drag.state()?.height ?? 0}px`,
                                        }}
                                      />
                                    }
                                  >
                                    <KanbanCardFrame>
                                      <div class="flex items-start justify-between gap-1">
                                        <div class="min-w-0 flex-1">
                                          {props.children(item)}
                                        </div>
                                        <Show when={!props.renderActions}>
                                          <div class="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                                            <Menu.Root
                                              onSelect={(value) =>
                                                moveTo(item, value)
                                              }
                                            >
                                              <Menu.Trigger
                                                aria-label={`Actions for ${nameOf(item)}`}
                                                class="flex size-7 cursor-pointer items-center justify-center rounded-3 text-ink-gray-6 transition-colors hover:bg-surface-gray-3 hover:text-ink-gray-8 focus-visible:focus-ring"
                                              >
                                                <Icon
                                                  icon="lucide-ellipsis"
                                                  class="size-4"
                                                />
                                              </Menu.Trigger>
                                              <Menu.Content>
                                                <Menu.Label>Move to</Menu.Label>
                                                <For
                                                  each={columnIds().filter(
                                                    (id) => id !== columnId,
                                                  )}
                                                >
                                                  {(target) => (
                                                    <Menu.Item value={target}>
                                                      {columnOf(target).name}
                                                    </Menu.Item>
                                                  )}
                                                </For>
                                              </Menu.Content>
                                            </Menu.Root>
                                          </div>
                                        </Show>
                                        <Show when={props.renderActions}>
                                          {(render) => (
                                            <div class="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                                              {render()(item)}
                                            </div>
                                          )}
                                        </Show>
                                      </div>
                                    </KanbanCardFrame>
                                  </Show>
                                </li>
                              )}
                            </For>
                          </ul>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar />
                      </ScrollArea.Root>
                    </li>
                  )
                }}
              </For>
            </ul>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="horizontal" />
        </ScrollArea.Root>
      </Show>

      <Show when={drag.state()}>
        {(state) => (
          <Portal>
            {/* The lifted card: fixed, inert and out of hit-testing, so the
                pointer sees the board underneath it. */}
            <div
              class="pointer-events-none fixed top-0 left-0 z-overlay will-change-transform"
              classList={{
                'transition-transform duration-base ease-out': state().settling,
              }}
              style={{
                width: `${state().width}px`,
                transform: `translate3d(${state().x}px, ${state().y}px, 0)`,
              }}
            >
              <KanbanCardFrame
                ghost
                class={cn(
                  !state().settling && 'scale-[1.02] rotate-2 shadow-xl',
                )}
              >
                <div class="flex items-start justify-between gap-1">
                  <div class="min-w-0 flex-1">
                    {props.children(state().item)}
                  </div>
                  {/* Keeps the ghost's header row the same height as the real
                      card's, without a menu that would do nothing. */}
                  <Show when={!props.renderActions}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="lucide-ellipsis"
                      class="opacity-0"
                      tabindex="-1"
                      aria-hidden="true"
                    />
                  </Show>
                </div>
              </KanbanCardFrame>
            </div>
          </Portal>
        )}
      </Show>
    </div>
  )
}

/**
 * The card itself: the grab cursor, the hover ring, the ghost's lift. Separate
 * so the ghost is provably the same box as the card it replaces — a ghost a few
 * pixels off makes every drop feel like a miss.
 */
function KanbanCardFrame(props: {
  ghost?: boolean
  class?: string
  children: JSX.Element
}): JSX.Element {
  return (
    <Card
      padding="sm"
      class={cn(
        'group relative border-outline-gray-1',
        props.ghost ? 'cursor-grabbing' : 'cursor-grab hover:shadow-sm',
        props.class,
      )}
    >
      {props.children}
    </Card>
  )
}

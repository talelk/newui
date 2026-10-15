import * as zag from '@zag-js/dialog'
import { createEffect, type JSX, onCleanup, Show, splitProps } from 'solid-js'
import { createDisclosure } from '../../lib/disclosure'
import { createId } from '../../lib/id'
import { Portal } from '../../lib/portal'
import { cn } from '../../lib/tv'
import { createZagApi } from '../../lib/zag'

type DialogApi = ReturnType<typeof zag.connect>

export interface BottomSheetProps {
  /** Controlled open state. */
  open?: boolean
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Optional centered title in the drag-handle area. */
  title?: JSX.Element
  /** Allow outside-click, Escape and drag gestures to close. Default `true`. */
  dismissible?: boolean
  /** Sheet body, rendered in a scrollable region below the handle. */
  children?: JSX.Element
  /** Merged into the sheet content. */
  class?: string
}

/**
 * A bottom-anchored modal sheet: a grab handle, an optional title, and a
 * scrollable body, capped at `90dvh`.
 *
 * Built on Zag's `dialog` machine (the same one `Dialog` uses) so focus
 * trapping, Escape and outside-click dismissal come from the primitive.
 * Dragging down dismisses after 96px. Body gestures dismiss only when started
 * at the top of the scroller, leaving normal scrolling to the browser.
 */
export function BottomSheet(props: BottomSheetProps): JSX.Element {
  const [local] = splitProps(props, [
    'open',
    'defaultOpen',
    'onOpenChange',
    'title',
    'dismissible',
    'class',
    'children',
  ])

  const dismissible = () => local.dismissible ?? true
  let content: HTMLDivElement | undefined
  let body: HTMLDivElement | undefined
  let start: { x: number; y: number } | undefined
  let offset = 0
  let pointer: number | undefined
  let animation: Animation | undefined
  function begin(x: number, y: number) {
    if (!dismissible()) return
    animation?.cancel()
    start = { x, y }
    offset = 0
  }
  function move(x: number, y: number) {
    if (!start || !content || !dismissible()) return false
    if (Math.abs(x - start.x) > Math.abs(y - start.y)) {
      finish(true)
      return false
    }
    offset = Math.max(0, y - start.y)
    content.style.transform = `translateY(${offset}px)`
    return offset > 0
  }
  function finish(canceled = false) {
    const distance = offset
    start = undefined
    offset = 0
    if (content) content.style.removeProperty('transform')
    if (!canceled && dismissible() && distance >= 96) setOpen(false)
    else if (
      distance &&
      content?.animate &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      animation = content.animate(
        [
          { transform: `translateY(${distance}px)` },
          { transform: 'translateY(0)' },
        ],
        { duration: 160, easing: 'ease-out' },
      )
    }
  }
  onCleanup(() => animation?.cancel())
  const [open, setOpen] = createDisclosure({
    value: () => local.open,
    defaultOpen: local.defaultOpen,
    onChange: (value) => local.onOpenChange?.(value),
  })

  createEffect(() => {
    if (!open()) {
      pointer = undefined
      finish(true)
    }
  })

  const machineId = createId('bottom-sheet')
  const { api } = createZagApi<DialogApi>(zag.machine, zag.connect, () => ({
    id: machineId,
    role: 'dialog',
    modal: true,
    open: open(),
    closeOnEscape: dismissible(),
    closeOnInteractOutside: dismissible(),
    onOpenChange: (details: { open: boolean }) => setOpen(details.open),
  }))

  return (
    <Show when={api().open}>
      <Portal>
        <div
          {...api().getBackdropProps()}
          data-slot="bottom-sheet-backdrop"
          class="fixed inset-0 z-50 bg-black-overlay-200 dark:bg-black-overlay-700"
        />
        <div
          {...api().getPositionerProps()}
          data-slot="bottom-sheet-positioner"
          class="fixed inset-0 z-50 flex items-end justify-center"
        >
          <div
            {...api().getContentProps()}
            ref={content}
            on:touchstart={(event: TouchEvent) => {
              const touch = event.touches[0]
              const target = event.target as Element | null
              if (
                target?.closest(
                  'input, textarea, button, a, select, [contenteditable="true"]',
                )
              )
                return
              if (
                touch &&
                event.touches.length === 1 &&
                (!body || body.scrollTop <= 0)
              )
                begin(touch.clientX, touch.clientY)
            }}
            on:touchmove={(event: TouchEvent) => {
              const touch = event.touches[0]
              if (event.touches.length !== 1) finish(true)
              else if (
                touch &&
                move(touch.clientX, touch.clientY) &&
                event.cancelable
              )
                event.preventDefault()
            }}
            on:touchend={() => finish()}
            on:touchcancel={() => finish(true)}
            data-slot="bottom-sheet-content"
            role="dialog"
            aria-label={local.title ? undefined : 'Bottom sheet'}
            class={cn(
              'relative z-50 flex max-h-[90dvh] w-full max-w-2xl flex-col rounded-t-6 border border-outline-gray-1 bg-surface-elevation-2 text-ink-gray-9 shadow-lg',
              'focus-visible:outline-none',
              local.class,
            )}
          >
            <div
              data-slot="bottom-sheet-handle"
              class="flex shrink-0 touch-none justify-center pt-3 pb-2"
              onPointerDown={(event) => {
                if (
                  event.pointerType === 'touch' ||
                  event.button !== 0 ||
                  !dismissible()
                )
                  return
                pointer = event.pointerId
                begin(event.clientX, event.clientY)
                event.currentTarget.setPointerCapture(event.pointerId)
              }}
              onPointerMove={(event) => {
                if (pointer === event.pointerId)
                  move(event.clientX, event.clientY)
              }}
              onPointerUp={(event) => {
                if (pointer !== event.pointerId) return
                pointer = undefined
                finish()
              }}
              onPointerCancel={() => {
                pointer = undefined
                finish(true)
              }}
              onLostPointerCapture={(event) => {
                // Touch dismissal is completed by touchend. Its implicit
                // pointer capture must not cancel that gesture first.
                if (pointer !== event.pointerId) return
                pointer = undefined
                finish(true)
              }}
            >
              <div class="h-1.5 w-10 rounded-full bg-surface-gray-3" />
            </div>

            <Show when={local.title}>
              <h2
                {...api().getTitleProps()}
                data-slot="bottom-sheet-title"
                class="shrink-0 px-2 pb-3 pt-2 text-center text-section text-ink-gray-9"
              >
                {local.title}
              </h2>
            </Show>

            <div
              ref={body}
              data-slot="bottom-sheet-body"
              class="min-h-0 overflow-y-auto overscroll-contain px-4 pb-4"
            >
              {local.children}
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  )
}

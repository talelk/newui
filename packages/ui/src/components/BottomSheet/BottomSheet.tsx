import * as zag from '@zag-js/dialog'
import { type JSX, Show, splitProps } from 'solid-js'
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
  /** Allow outside-click and Escape to close. Default `true`. */
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
 * `dismissible={false}` turns off the two dismissal paths. Swipe-down-to-close
 * is not implemented yet; the handle is presentational.
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
  const [open, setOpen] = createDisclosure({
    value: () => local.open,
    defaultOpen: local.defaultOpen,
    onChange: (value) => local.onOpenChange?.(value),
  })

  const { api } = createZagApi<DialogApi>(zag.machine, zag.connect, () => ({
    id: createId('bottom-sheet'),
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
            data-slot="bottom-sheet-content"
            role="dialog"
            aria-label={local.title ? undefined : 'Bottom sheet'}
            class={cn(
              'relative z-50 flex max-h-[90dvh] w-full max-w-2xl flex-col rounded-t-[36px] bg-surface-base text-ink-gray-9 shadow-lg [corner-shape:squircle]',
              'focus-visible:outline-none',
              local.class,
            )}
          >
            <div
              data-slot="bottom-sheet-handle"
              class="flex shrink-0 justify-center pt-3 pb-2"
            >
              <div class="h-1.5 w-10 rounded-full bg-surface-gray-3" />
            </div>

            <Show when={local.title}>
              <h2
                {...api().getTitleProps()}
                data-slot="bottom-sheet-title"
                class="shrink-0 px-2 pb-3 pt-2 text-center text-3xl-semibold text-ink-gray-9"
              >
                {local.title}
              </h2>
            </Show>

            <div
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

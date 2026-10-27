import {
  cn,
  createId,
  createZagApi,
  Portal,
} from '@talelk/newui-atoms/internal'
import * as zagToast from '@zag-js/toast'
import { createMemo, For, type JSX, Show } from 'solid-js'

export type ToastType =
  | 'success'
  | 'error'
  | 'info'
  | 'loading'
  | 'warning'
  | 'message'
  | 'custom'

/** A custom toast body. Replaces the default icon/title/description layout. */
export type ToastRender = (context: { dismiss: () => void }) => JSX.Element

export interface ToastOptions {
  title?: string
  description?: JSX.Element
  type?: ToastType
  /** ms; `Infinity` keeps it until dismissed. */
  duration?: number
  id?: string
  /** Custom body; set by `toast.custom` and overrides the default layout. */
  render?: ToastRender
}

/** Options for `toast.promise`: a loading state plus resolved/rejected states. */
export interface ToastPromiseOptions<T> {
  loading: Omit<ToastOptions, 'type'>
  success?:
    | Omit<ToastOptions, 'type'>
    | ((value: T) => Omit<ToastOptions, 'type'>)
  error?:
    | Omit<ToastOptions, 'type'>
    | ((error: unknown) => Omit<ToastOptions, 'type'>)
  finally?: () => void | Promise<void>
}

/**
 * The toaster. Zag's group machine subscribes to the store and syncs the toast
 * list into its own context, so `api().getToasts()` is reactive under Solid —
 * no external-store bridge needed. The imperative surface (below) is the
 * namespaced API P9 asks for.
 */
export function createToaster(options?: {
  placement?: zagToast.Placement
  duration?: number
  max?: number
  gap?: number
}) {
  return zagToast.createStore({
    placement: options?.placement ?? 'bottom-end',
    duration: options?.duration ?? 4000,
    max: options?.max ?? 5,
    gap: options?.gap ?? 8,
    overlap: false,
  })
}

export type ToasterApi = ReturnType<typeof createToaster>
type ToastApi = ReturnType<typeof zagToast.connect>
type ToastGroupApi = ReturnType<typeof zagToast.group.connect>
type ToastRecord = ReturnType<ToasterApi['getVisibleToasts']>[number]

// frappe's toast is a dark bar that tints the icon per type, not a light card
// with a coloured border.
const ACCENT: Record<string, string> = {
  error: 'text-ink-red-4',
  warning: 'text-ink-amber-4',
}

const ICON: Record<string, string> = {
  success: 'lucide-circle-check',
  error: 'lucide-circle-alert',
  warning: 'lucide-triangle-alert',
  info: 'lucide-info',
  loading: 'lucide-loader-circle',
}

type ToastRecordWithRender = ToastRecord & { render?: ToastRender }

function ToastItem(props: {
  /** The toast's stable id; the live record is read from `toasts`. */
  id: string
  /** The region's tracked toast list, so record updates stay reactive. */
  toasts: () => ToastRecordWithRender[]
  parent: zagToast.GroupService
}): JSX.Element {
  const record = createMemo(
    () =>
      props.toasts().find((toast) => toast.id === props.id) as
        | ToastRecordWithRender
        | undefined,
  )
  const { api: connected } = createZagApi<ToastApi>(
    zagToast.machine,
    zagToast.connect,
    () => ({
      id: props.id,
      ...record(),
      parent: props.parent,
    }),
  )
  // The item's placement style is computed from the *group's* heights, which
  // live outside this machine's state and are read lazily inside the template
  // spread. Re-reading them here makes the connected API recompute when a
  // sibling mounts or leaves — without this, the first toast never lifts and
  // its close button stays buried under the newest one.
  const heights = createMemo(() =>
    JSON.stringify(props.parent.context.get('heights')),
  )
  const api = createMemo(() => {
    heights()
    return connected()
  })
  const type = () => (api().type ?? 'info') as string
  const render = () => record()?.render

  // `message` (and `custom`) carry no icon; only the typed toasts do.
  const defaultBody = () => (
    <>
      <Show when={ICON[type()]}>
        {(icon) => (
          <span
            class={cn(
              icon(),
              'mr-2 size-4 shrink-0 text-ink-base',
              ACCENT[type()],
              type() === 'loading' && 'animate-spin',
            )}
            aria-hidden="true"
          />
        )}
      </Show>
      <div class="flex flex-1 flex-col">
        <Show when={api().title}>
          <span
            {...api().getTitleProps()}
            class="text-p-base font-medium text-ink-base"
          >
            {api().title as string}
          </span>
        </Show>
        <Show when={api().description}>
          <span
            {...api().getDescriptionProps()}
            class="text-p-base text-ink-base"
          >
            {api().description as string}
          </span>
        </Show>
      </div>
      <button
        {...api().getCloseTriggerProps()}
        class="order-1 ml-auto grid size-5 shrink-0 place-items-center rounded-1 text-ink-base hover:bg-surface-gray-8"
        aria-label="Dismiss"
      >
        <span class="lucide-x size-4" aria-hidden="true" />
      </button>
    </>
  )

  return (
    <div
      {...api().getRootProps()}
      data-slot="toast"
      class="pointer-events-auto flex w-[360px] items-center rounded-card bg-surface-gray-9 px-4 py-2.5 shadow-xl [transform:translate(var(--x,0),var(--y,0))] [z-index:var(--z-index,0)] transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none data-[state=closed]:opacity-0"
    >
      <Show when={render()} fallback={defaultBody()}>
        {(custom) => <>{custom()({ dismiss: api().dismiss })}</>}
      </Show>
    </div>
  )
}

/** Props for `ToastRegion`, the portal that renders one toaster's stack. */
export interface ToastRegionProps {
  /** The toaster store whose visible toasts this region renders. */
  toaster: ToasterApi
  /** Extra classes merged onto the region container. */
  class?: string
}

/** Renders a toaster's stack. Mount once, near the app root. */
export function ToastRegion(props: ToastRegionProps): JSX.Element {
  const { service: groupService, api } = createZagApi<
    ToastGroupApi,
    zagToast.GroupService
  >(zagToast.group.machine, zagToast.group.connect, () => ({
    id: createId('toaster'),
    store: props.toaster,
  }))
  /** Tracked once here: every item reads its record through this memo, so a
   * store sync reaches the items through Solid, not through the raw store. */
  const toasts = createMemo(() => api().getToasts() as ToastRecordWithRender[])

  return (
    <Portal>
      <div
        {...api().getGroupProps()}
        data-slot="toast-region"
        class={cn(
          'pointer-events-none z-overlay flex flex-col gap-2',
          props.class,
        )}
      >
        {/* Keyed by toast id, reading the live record from the store. The
            store hands back fresh record objects on every sync (presence,
            pause, timers), so keying the items by reference would tear down
            and recreate each item's machine on every tick — and any
            pointerdown→mouseup pair straddling a replacement never fires its
            click. The id list is stable, so For moves nodes instead of
            replacing them and each machine lives as long as its toast. */}
        <For
          each={api()
            .getToasts()
            .map((toast) => String(toast.id))}
        >
          {(id) => <ToastItem id={id} toasts={toasts} parent={groupService} />}
        </For>
      </div>
    </Portal>
  )
}

/** The app-wide toaster and its namespaced imperative API. */
export const toaster = createToaster()

type ToastCreateInput = Parameters<ToasterApi['create']>[0]

/** `create` with our options shape, which carries an extra `render`. */
function createToast(data: ToastOptions): string {
  return toaster.create(data as ToastCreateInput)
}

export const toast = {
  create: createToast,
  success: (options: ToastOptions) => toaster.success(options),
  error: (options: ToastOptions) => toaster.error(options),
  warning: (options: ToastOptions) => toaster.warning(options),
  info: (options: ToastOptions) => toaster.info(options),
  loading: (options: ToastOptions) => toaster.loading(options),
  /** A neutral toast with no type icon. */
  message: (options: ToastOptions) =>
    createToast({ ...options, type: 'message' }),
  /** Tracks a promise: loading, then success or error. */
  promise: <T,>(
    promise: Promise<T> | (() => Promise<T>),
    options: ToastPromiseOptions<T>,
  ) => toaster.promise<T>(promise, options),
  /** A toast whose body is rendered by `render`, not the default layout. */
  custom: (render: ToastRender, options?: Omit<ToastOptions, 'render'>) =>
    createToast({ ...options, type: 'custom', render }),
  dismiss: (id: string) => toaster.dismiss(id),
}

/** Mounts the app-wide toaster. */
export function Toaster(): JSX.Element {
  return <ToastRegion toaster={toaster} />
}

import {
  type Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  type JSX,
  Show,
  useContext,
} from 'solid-js'
import { closeDialog, createMediaQuery, showDialog } from '../../lib/media'
import { cn } from '../../lib/tv'
import { AppShell } from '../AppShell'
import { Icon } from '../Icon'
import { MobileShell, PageHeaderMobile } from '../MobileShell/MobileShell'

/** Below this the shell is a phone: a header, a scroller and a bottom nav. */
const DOCKED = '(min-width: 1024px)'

interface ResponsiveShellContextValue {
  /** The window is narrow enough that the sidebar is a drawer. */
  compact: Accessor<boolean>
  open: Accessor<boolean>
  showDrawer: () => void
  hideDrawer: () => void
}

const ResponsiveShellContext = createContext<ResponsiveShellContextValue>({
  compact: () => false,
  open: () => false,
  showDrawer: () => {},
  hideDrawer: () => {},
})

/** The shell's own state, for a header button or a nav item that opens the drawer. */
export function useResponsiveShell(): ResponsiveShellContextValue {
  return useContext(ResponsiveShellContext)
}

export interface ResponsiveShellProps {
  /** Narrow icon rail on the far left, docked at desktop width. */
  rail?: JSX.Element
  /**
   * The sidebar. Docked beside the content when there is room for two columns,
   * and the body of a drawer when there is not — one declaration, both frames.
   */
  sidebar?: JSX.Element
  /** The content column's own header. */
  header?: JSX.Element
  /** The pinned header on a phone. Defaults to `title` plus a menu button. */
  mobileHeader?: JSX.Element
  /** Title for the default mobile header. */
  title?: JSX.Element
  /** Bottom navigation on a phone, usually a `MobileNav`. */
  mobileNav?: JSX.Element
  /** The widening media query. Default `(min-width: 1024px)`. */
  query?: string
  /** Accessible name of the drawer. Default `Navigation`. */
  label?: string
  class?: string
  children: JSX.Element
}

/**
 * One navigation, two frames.
 *
 * `DesktopShell` and `MobileShell` are two honest frames, and every application
 * that wanted both ended up writing the same switch: a media query, a sidebar
 * that becomes an off-canvas drawer, a hamburger that opens it, and a rule that
 * closes it again when the window grows. That switch is the same in every app,
 * which is the definition of a component.
 *
 * The breakpoint is a *media query*, not a prop, so the frame follows the window
 * the way CSS does — there is no state to keep in sync with a resize, and the
 * drawer closes itself the moment there is room for the real sidebar.
 *
 * The drawer is the platform's own modal `<dialog>`: a real top layer, a real
 * focus trap, Escape, and focus restored to the trigger when it closes. The
 * animated surfaces in this library (`Dialog`, `BottomSheet`) use the Zag machine
 * because they need its motion and drag; a drawer that slides in from the edge
 * needs none of that, and the browser's own implementation is the more correct
 * one to lean on.
 */
export function ResponsiveShell(props: ResponsiveShellProps): JSX.Element {
  // Read through a memo (a tracked scope) rather than off the props directly:
  // the shell decides its frame from this, so a `query` that changed under it
  // would be a resize the component never saw.
  const query = createMemo(() => props.query ?? DOCKED)
  const widened = createMediaQuery(query())
  const compact = () => !widened()
  const [open, setOpen] = createSignal(false)
  let drawer: HTMLDialogElement | undefined
  let trigger: HTMLButtonElement | undefined

  const showDrawer = () => {
    setOpen(true)
    showDialog(drawer)
  }
  const hideDrawer = () => {
    setOpen(false)
    closeDialog(drawer)
  }

  // The window grew: the drawer has nowhere to live, and leaving it open would
  // cover the sidebar it was standing in for.
  createEffect(() => {
    if (!compact() && open()) hideDrawer()
  })

  const context: ResponsiveShellContextValue = {
    compact,
    open,
    showDrawer,
    hideDrawer,
  }

  return (
    <ResponsiveShellContext.Provider value={context}>
      <Show
        when={compact()}
        fallback={
          <AppShell
            rail={props.rail}
            sidebar={props.sidebar}
            class={props.class}
          >
            <Show when={props.header}>{props.header}</Show>
            <div
              data-slot="responsive-shell-content"
              class="min-h-0 flex-1 overflow-y-auto"
            >
              {props.children}
            </div>
          </AppShell>
        }
      >
        <MobileShell
          class={props.class}
          header={
            props.mobileHeader ?? (
              <PageHeaderMobile
                title={props.title}
                prefix={
                  <ResponsiveShellMenu
                    ref={(element) => {
                      trigger = element
                    }}
                  />
                }
              />
            )
          }
          nav={props.mobileNav}
        >
          {props.children}
        </MobileShell>

        <dialog
          ref={drawer}
          aria-label={props.label ?? 'Navigation'}
          data-slot="responsive-shell-drawer"
          onClose={() => {
            setOpen(false)
            trigger?.focus()
          }}
          onClick={(event) => {
            // A click on anything that navigates closes the drawer behind it.
            const target = event.target as Element
            if (
              event.target === drawer ||
              target.closest('a, [data-navigates]')
            )
              hideDrawer()
          }}
          class="m-0 h-dvh max-h-none w-72 max-w-[calc(100vw-3rem)] overflow-y-auto border-e border-outline-gray-1 bg-surface-sidebar p-0 text-ink-gray-9 backdrop:bg-black-overlay-200"
        >
          <div class="flex h-full flex-col">
            {props.rail}
            {props.sidebar}
          </div>
        </dialog>
      </Show>
    </ResponsiveShellContext.Provider>
  )
}

export interface ResponsiveShellMenuProps {
  /** Accessible name. Default `Open navigation`. */
  label?: string
  class?: string
  /** Receives the button, so the shell can restore focus to it on close. */
  ref?: (element: HTMLButtonElement) => void
}

/**
 * The button that opens the drawer. Yours to place — usually at the start of the
 * mobile header — and it renders nothing when the sidebar is docked: a hamburger
 * beside a visible sidebar is a control that would do nothing.
 */
export function ResponsiveShellMenu(
  props: ResponsiveShellMenuProps,
): JSX.Element {
  const { compact, open, showDrawer } = useResponsiveShell()
  return (
    <Show when={compact()}>
      <button
        ref={props.ref}
        type="button"
        aria-label={props.label ?? 'Open navigation'}
        aria-haspopup="dialog"
        aria-expanded={open()}
        onClick={() => showDrawer()}
        class={cn(
          'grid size-9 shrink-0 place-items-center rounded-3 text-ink-gray-7 transition-colors',
          'hover:bg-surface-gray-2 focus-visible:focus-ring motion-reduce:transition-none',
          props.class,
        )}
      >
        <Icon icon="lucide-menu" class="size-4" />
      </button>
    </Show>
  )
}

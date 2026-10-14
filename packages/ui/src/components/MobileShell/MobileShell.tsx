import { type JSX, Show, splitProps } from 'solid-js'
import { cn } from '../../lib/tv'

export interface MobileShellProps {
  /** Pinned top region, usually a `PageHeaderMobile`. */
  header?: JSX.Element
  /** Bottom navigation region, usually a `MobileNav`. */
  nav?: JSX.Element
  /** Merged into the root. */
  class?: string
  /** The routed page content, in the natively-scrolling body. */
  children?: JSX.Element
}

/**
 * The mobile app frame: a pinned header, a natively-scrolling body and a
 * bottom nav region. A fixed full-height column, so the header and nav stay put
 * while the body scrolls. Presentational — it owns no state and no router.
 *
 * The body uses the browser's own scrolling (momentum and overscroll) rather
 * than a custom scrollbar. In an installed PWA the shell grows to `100lvh`
 * (capped at the top inset) and the header clears the status bar; the tab bar's
 * bottom inset is owned by `MobileNav`.
 */
export function MobileShell(props: MobileShellProps): JSX.Element {
  const [local] = splitProps(props, ['header', 'nav', 'class', 'children'])

  return (
    <div
      data-slot="mobile-shell"
      class={cn(
        'fixed inset-0 flex touch-none flex-col overflow-hidden',
        '[@media(display-mode:standalone)]:h-[min(100lvh,100%_+_env(safe-area-inset-top))]',
        local.class,
      )}
    >
      <Show when={local.header}>
        <div
          data-slot="mobile-shell-header"
          class="shrink-0 [@media(display-mode:standalone)]:pt-[env(safe-area-inset-top)]"
        >
          {local.header}
        </div>
      </Show>
      <div
        data-slot="mobile-shell-scroll"
        class="flex-1 overflow-y-auto overscroll-auto bg-surface-base [-webkit-overflow-scrolling:touch]"
      >
        {local.children}
      </div>
      <Show when={local.nav}>{local.nav}</Show>
    </div>
  )
}

export interface PageHeaderMobileProps {
  /** Centered title text. Overridden by `children`. */
  title?: JSX.Element
  /** Leading control, usually a back button. */
  prefix?: JSX.Element
  /** Trailing control(s), usually actions. */
  suffix?: JSX.Element
  /** Merged into the header. */
  class?: string
  /** Custom title markup; overrides `title`. */
  children?: JSX.Element
}

/**
 * The mobile page header: a centered title with an optional leading control
 * (a back button) and trailing actions. Renders a single-line, ellipsised
 * `<h1>` so navigating between pages never changes the header's height.
 *
 * The prefix and suffix are absolutely positioned at the edges and the title is
 * inset symmetrically, so it stays visually centered however wide the controls
 * are. A presentational header — the caller wires the back action.
 */
export function PageHeaderMobile(props: PageHeaderMobileProps): JSX.Element {
  const [local] = splitProps(props, [
    'title',
    'prefix',
    'suffix',
    'class',
    'children',
  ])

  return (
    <header
      data-slot="page-header-mobile"
      class={cn(
        'relative z-10 flex h-13 shrink-0 items-center border-b border-outline-gray-1 bg-surface-base px-3',
        local.class,
      )}
    >
      <Show when={local.prefix}>
        <div
          data-slot="page-header-mobile-prefix"
          class="absolute start-0 top-1/2 z-1 flex max-w-[35%] -translate-y-1/2 justify-start"
        >
          {local.prefix}
        </div>
      </Show>
      <h1
        data-slot="page-header-mobile-title"
        class="w-full min-w-0 truncate px-12 text-center text-xl-semibold leading-tight text-ink-gray-9"
      >
        {local.children ?? local.title}
      </h1>
      <Show when={local.suffix}>
        <div
          data-slot="page-header-mobile-suffix"
          class="absolute end-0 top-1/2 z-1 flex max-w-[35%] -translate-y-1/2 justify-end"
        >
          {local.suffix}
        </div>
      </Show>
    </header>
  )
}

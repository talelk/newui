import { type ParentComponent, splitProps } from 'solid-js'
import { cn } from '../../lib/tv'
import { AppShell, type AppShellProps } from '../AppShell/AppShell'

export interface DesktopShellProps extends AppShellProps {
  /**
   * Whether the shell owns the page scroller. Defaults to `true`.
   *
   * `true` wraps the content in one scrolling region, so the shell owns the
   * page scroll. Pass `false` for a multi-pane layout where the panes own their
   * overflow — a list-and-detail split, or a board whose columns scroll
   * separately — or when the page composes `PageBody`, which is already its own
   * scroller.
   */
  scroll?: boolean
}

/**
 * The desktop app frame: `rail` · `sidebar` · content column.
 *
 * Structurally this is `AppShell`; `DesktopShell` only adds the `scroll` axis,
 * so the shell can own the page scroller the way frappe-ui's shell does. See
 * `spec/desktop-shell.md` for why this is a thin wrapper rather than a separate
 * implementation, and what it does *not* port (the teleported pinned header).
 */
export const DesktopShell: ParentComponent<DesktopShellProps> = (props) => {
  const [local, rest] = splitProps(props, ['scroll', 'class', 'children'])
  const scroll = () => local.scroll ?? true
  return (
    <AppShell {...rest} class={local.class}>
      <div
        data-slot="desktop-shell-content"
        data-scroll={scroll() ? 'page' : 'panes'}
        class={cn(
          'flex min-h-0 flex-1 flex-col',
          scroll() ? 'overflow-y-auto' : 'overflow-hidden',
        )}
      >
        {local.children}
      </div>
    </AppShell>
  )
}

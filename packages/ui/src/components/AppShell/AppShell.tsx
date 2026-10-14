import { type JSX, type ParentComponent, splitProps } from 'solid-js'
import { cn } from '../../lib/tv'

export interface AppShellProps {
  /** Narrow icon rail on the far left. */
  rail?: JSX.Element
  /** Navigation sidebar. */
  sidebar?: JSX.Element
  class?: string
  children?: JSX.Element
}

/**
 * The desktop app frame: rail · sidebar · content column. A page declares a
 * `PageHeader` and a `PageBody` inside it, and the shell owns the viewport
 * height so inner regions scroll instead of the page.
 */
export const AppShell: ParentComponent<AppShellProps> = (props) => (
  <div
    data-slot="app-shell"
    class={cn(
      'flex h-full overflow-hidden bg-surface-base text-ink-gray-9',
      props.class,
    )}
  >
    {props.rail}
    {props.sidebar}
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      {props.children}
    </div>
  </div>
)

export interface PageHeaderProps {
  class?: string
  children?: JSX.Element
}

export const PageHeader: ParentComponent<PageHeaderProps> = (props) => (
  <header
    data-slot="page-header"
    class={cn(
      'z-10 flex min-h-12 shrink-0 items-center justify-between gap-2 border-b border-outline-gray-1 bg-surface-base px-3 sm:px-5',
      props.class,
    )}
  >
    {props.children}
  </header>
)

export const PageHeaderTitle: ParentComponent<{
  class?: string
  children?: JSX.Element
}> = (props) => (
  <h1
    data-slot="page-header-title"
    class={cn('truncate text-lg font-semibold text-ink-gray-9', props.class)}
  >
    {props.children}
  </h1>
)

export interface PageBodyProps {
  /** Content max width, e.g. `max-w-[940px]`. */
  width?: string
  class?: string
  children?: JSX.Element
}

export const PageBody: ParentComponent<PageBodyProps> = (props) => {
  const [local] = splitProps(props, ['width', 'class'])
  return (
    <div
      data-slot="page-body"
      class={cn('min-h-0 flex-1 overflow-y-auto', local.class)}
    >
      <div
        class={cn('mx-auto w-full px-4 py-4', local.width ?? 'max-w-[940px]')}
      >
        {props.children}
      </div>
    </div>
  )
}

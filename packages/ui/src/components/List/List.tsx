import { type JSX, type ParentComponent, splitProps } from 'solid-js'
import { cn } from '../../lib/tv'

const DEFAULT_COLUMNS = 'auto minmax(0, 1fr) auto'

export interface ListProps {
  /** CSS `grid-template-columns` shared by every row. */
  columns?: string
  class?: string
  children?: JSX.Element
}

/**
 * The list family. `List` owns the column template (a CSS variable) so rows and
 * the header stay aligned without each repeating the track list, and rows get a
 * rounded hover surface — the shape frappe-ui's lists use everywhere.
 */
export const List: ParentComponent<ListProps> = (props) => (
  <div
    data-slot="list"
    style={{ '--list-columns': props.columns ?? DEFAULT_COLUMNS }}
    class={cn('flex flex-col gap-0.5', props.class)}
  >
    {props.children}
  </div>
)

export interface ListRowProps {
  active?: boolean
  /** Row height utility, e.g. `h-14`. */
  height?: string
  class?: string
  children?: JSX.Element
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>
}

export const ListRow: ParentComponent<ListRowProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'active',
    'height',
    'class',
    'children',
  ])
  return (
    <div
      {...rest}
      data-slot="list-row"
      data-active={local.active ? '' : undefined}
      class={cn(
        'grid cursor-pointer grid-cols-[var(--list-columns)] items-center gap-3 rounded-5 px-2',
        'transition-colors hover:bg-surface-gray-2',
        'data-[active]:bg-surface-gray-3',
        local.height ?? 'h-14',
        local.class,
      )}
    >
      {local.children}
    </div>
  )
}

export interface ListCellProps {
  class?: string
  children?: JSX.Element
}

export const ListCell: ParentComponent<ListCellProps> = (props) => (
  <div
    data-slot="list-cell"
    class={cn('flex min-w-0 items-center', props.class)}
  >
    {props.children}
  </div>
)

export const ListHeader: ParentComponent<{
  class?: string
  children?: JSX.Element
}> = (props) => (
  <div
    data-slot="list-header"
    class={cn(
      'grid grid-cols-[var(--list-columns)] items-center gap-3 px-2 pb-1 text-sm text-ink-gray-6',
      props.class,
    )}
  >
    {props.children}
  </div>
)

export const ListHeaderCell: ParentComponent<{
  class?: string
  children?: JSX.Element
}> = (props) => (
  <div
    data-slot="list-header-cell"
    class={cn('flex items-center', props.class)}
  >
    {props.children}
  </div>
)

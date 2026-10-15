import { type JSX, type ParentComponent, Show, splitProps } from 'solid-js'
import { cn } from '../../lib/tv'
import { Icon } from '../Icon'
import { TooltipContent, TooltipRoot, TooltipTrigger } from '../Tooltip'

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

export type ListSortDirection = 'asc' | 'desc' | null

export interface ListHeaderCellSortProps {
  /** `asc` / `desc` when this column is the sort key, `null` when it is not. */
  direction?: ListSortDirection
  /** Align the cell (and its glyph) to the end of the column. */
  align?: 'start' | 'end'
  /** Tooltip copy. Falls back to a hint derived from `direction`. */
  tooltip?: string
  /** A plain handler: this button is not a form control, and the union form is
   * not callable without the array-shape check. */
  onClick?: (event: MouseEvent) => void
  class?: string
  children?: JSX.Element
}

/**
 * A sortable column header.
 *
 * Controlled on purpose: the sort state and the toggle rule (fresh column →
 * `asc`, same column → flip, third click → unsorted if the app wants that) live
 * in the screen, which is the only place that knows the data. The cell owns the
 * chrome — a real button, `aria-sort`, and the glyph.
 *
 * The glyph is revealed with opacity rather than `display`, so hovering never
 * shifts the label. End-aligned columns lead with the glyph: a trailing one
 * would reserve space and push the label off the column's right edge, away from
 * the values underneath it.
 */
/**
 * A sortable column header.
 *
 * Controlled on purpose: the sort state and the toggle rule (fresh column →
 * `asc`, same column → flip, third click → unsorted if the app wants that) live
 * in the screen, which is the only place that knows the data. The cell owns the
 * chrome — a real button, `aria-sort`, and the glyph.
 *
 * The glyph is revealed with opacity rather than `display`, so hovering never
 * shifts the label. End-aligned columns lead with the glyph: a trailing one
 * would reserve space and push the label off the column's right edge, away from
 * the values underneath it.
 *
 * The tooltip is the compound form, not `<Tooltip>`: the shorthand renders its
 * own `<button>`, and this cell's button has to *be* the trigger — a button
 * inside a button is not a thing.
 */
export function ListHeaderCellSort(
  props: ListHeaderCellSortProps,
): JSX.Element {
  const direction = () => props.direction ?? null
  const atEnd = () => props.align === 'end'
  const glyph = () =>
    direction() === 'asc'
      ? 'lucide-arrow-up'
      : direction() === 'desc'
        ? 'lucide-arrow-down'
        : 'lucide-arrow-up-down'

  const hint = () =>
    props.tooltip ??
    (direction() === null
      ? 'Sort ascending'
      : direction() === 'asc'
        ? 'Sorted ascending — activate to reverse'
        : 'Sorted descending — activate to reverse')

  const glyphNode = () => (
    <span
      class={cn(
        'shrink-0',
        direction() === null && 'opacity-0 group-hover:opacity-100',
      )}
      aria-hidden="true"
    >
      <Icon icon={glyph()} class="size-3.5" />
    </span>
  )

  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: `aria-sort` belongs on a `columnheader`; the family leaves the table roles (table/row/columnheader) to the caller, which is where the rowgroup sits too.
    <div
      data-slot="list-header-cell"
      data-sort={direction() ?? undefined}
      aria-sort={
        direction() === 'asc'
          ? 'ascending'
          : direction() === 'desc'
            ? 'descending'
            : undefined
      }
      class={cn(
        'flex min-w-0 items-center',
        atEnd() && 'justify-end',
        props.class,
      )}
    >
      <TooltipRoot>
        <TooltipTrigger
          type="button"
          // Wrapped: an event handler read straight off props is captured once.
          onClick={(event: MouseEvent) => props.onClick?.(event)}
          class={cn(
            'group inline-flex h-7 min-w-0 cursor-pointer items-center gap-1 rounded-4 text-sm-medium leading-tighter text-ink-gray-6 transition-colors',
            'hover:text-ink-gray-8',
            'focus-visible:focus-ring',
          )}
        >
          <Show when={atEnd()}>{glyphNode()}</Show>
          <span class="truncate leading-tighter">{props.children}</span>
          <Show when={!atEnd()}>{glyphNode()}</Show>
        </TooltipTrigger>
        <TooltipContent>{hint()}</TooltipContent>
      </TooltipRoot>
    </div>
  )
}

export interface ListGroupProps {
  /** Section label; the label row is omitted when this is absent. */
  label?: JSX.Element
  /** Pin the label to the top of the scroll container while the rows scroll. */
  sticky?: boolean
  class?: string
  children?: JSX.Element
}

/**
 * A titled section of rows.
 *
 * `role="rowgroup"` is what gives assistive tech real group structure — and
 * keeping the rows as direct children is what preserves the family's row-to-row
 * divider adjacency inside the group, which a stray heading spliced between rows
 * silently breaks.
 */
export const ListGroup: ParentComponent<ListGroupProps> = (props) => {
  const [local] = splitProps(props, ['label', 'sticky', 'class'])
  return (
    // biome-ignore lint/a11y/useSemanticElements: a `<fieldset>` is a form group, not a table row group, and would change what the label means.
    <div
      data-slot="list-group"
      role="rowgroup"
      aria-label={typeof local.label === 'string' ? local.label : undefined}
      class={local.class}
    >
      <Show when={local.label}>
        <div
          data-slot="list-group-header"
          class={cn(
            'flex h-8 items-center text-sm-medium leading-tighter text-ink-gray-6',
            local.sticky && 'sticky top-0 z-10 bg-surface-base',
          )}
        >
          {local.label}
        </div>
      </Show>
      {props.children}
    </div>
  )
}

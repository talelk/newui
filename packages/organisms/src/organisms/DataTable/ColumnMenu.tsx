import { cn } from '@talelk/newui-atoms'
import { Menu } from '@talelk/newui-molecules'
import {
  createContext,
  type JSX,
  type ParentComponent,
  Show,
  useContext,
} from 'solid-js'

/**
 * The per-column operations menu — the keyboard-complete half of the
 * DataTable's column operations.
 *
 * Resizing and reordering both have pointer paths in the header; this is the
 * path that does not depend on a gesture. Every operation the table exposes
 * (sort, pin, move, reset size, hide) is a menu item, so a keyboard or
 * screen-reader user can reach the same state the drag handles drive. The
 * parts are `Menu` parts — Zag's menu machine owns the arrow keys, typeahead
 * and focus, exactly as in the kit's other menus.
 *
 * It is a part of the DataTable family: the table resolves the column's
 * capabilities and wires the callbacks, and the menu renders what applies.
 */

/** Which edge a column is frozen to; `undefined` unfreezes it. */
export type ColumnMenuPinEdge = 'start' | 'end' | undefined

export interface ColumnMenuRootProps {
  /** The column whose operations this menu exposes. */
  columnId: string
  /** The column's visible header text — the trigger's accessible name. */
  label: string
  /** The edges this column is frozen to, so the menu offers `Unpin`. */
  pinnedStart?: string[]
  pinnedEnd?: string[]
  /** A resize handle and its keyboard twin exist for this column. */
  resizable?: boolean
  /** Move left / Move right operate on this column. */
  reorderable?: boolean
  canSort?: boolean
  canHide?: boolean
  /** `Move left` is available; false at the first column. */
  canMoveLeft?: boolean
  /** `Move right` is available; false at the last column. */
  canMoveRight?: boolean
  /** Sort this column; `desc` is the requested direction. */
  onSort?: (columnId: string, desc: boolean) => void
  /** Freeze the column to an edge, or unfreeze it with `undefined`. */
  onPin?: (columnId: string, edge: ColumnMenuPinEdge) => void
  /** Move the column one slot; `-1` toward the start, `1` toward the end. */
  onMove?: (columnId: string, direction: -1 | 1) => void
  /** Return the column to its declared size. */
  onResetSize?: (columnId: string) => void
  /** Hide the column. */
  onHide?: (columnId: string) => void
  children: JSX.Element
}

interface ColumnMenuContextValue extends ColumnMenuRootProps {}

const ColumnMenuContext = createContext<ColumnMenuContextValue>()

function useColumnMenu(part: string): ColumnMenuContextValue {
  const value = useContext(ColumnMenuContext)
  if (!value) {
    throw new Error(`ColumnMenu.${part} must render inside <ColumnMenu.Root>`)
  }
  return value
}

const Root: ParentComponent<ColumnMenuRootProps> = (props) => {
  // Dispatch by item value. The menu is a part of the table, so every action
  // goes back through the callbacks the table resolved — the menu never owns
  // state of its own.
  const run = (value: string): void => {
    const columnId = props.columnId
    if (value === 'sort-asc') props.onSort?.(columnId, false)
    else if (value === 'sort-desc') props.onSort?.(columnId, true)
    else if (value === 'pin-start') props.onPin?.(columnId, 'start')
    else if (value === 'pin-end') props.onPin?.(columnId, 'end')
    else if (value === 'unpin') props.onPin?.(columnId, undefined)
    else if (value === 'move-left') props.onMove?.(columnId, -1)
    else if (value === 'move-right') props.onMove?.(columnId, 1)
    else if (value === 'reset-size') props.onResetSize?.(columnId)
    else if (value === 'hide') props.onHide?.(columnId)
  }
  return (
    <ColumnMenuContext.Provider value={props}>
      <Menu.Root onSelect={run}>{props.children}</Menu.Root>
    </ColumnMenuContext.Provider>
  )
}

const Trigger: ParentComponent<{ class?: string }> = (props) => {
  const menu = useColumnMenu('Trigger')
  return (
    <Menu.Trigger
      aria-label={`${menu.label} column menu`}
      class={cn(
        'inline-flex size-6 shrink-0 items-center justify-center rounded-control focus-visible:focus-ring hover:bg-surface-gray-2',
        props.class,
      )}
    >
      {props.children ?? (
        <span aria-hidden="true" class="lucide-ellipsis-vertical size-4" />
      )}
    </Menu.Trigger>
  )
}

const Content: ParentComponent<{ class?: string }> = (props) => (
  <Menu.Content class={cn('min-w-48', props.class)}>
    {props.children}
  </Menu.Content>
)

/**
 * The operations themselves, rendered from what the column can do. The
 * separators group them by kind — sort, pin, move, size, visibility — the
 * same order the table's own header controls appear in.
 */
const Items: ParentComponent = () => {
  const menu = useColumnMenu('Items')
  const pinned = () =>
    (menu.pinnedStart ?? []).includes(menu.columnId) ||
    (menu.pinnedEnd ?? []).includes(menu.columnId)
  return (
    <>
      <Show when={menu.canSort}>
        <Menu.Item value="sort-asc">Sort A → Z</Menu.Item>
        <Menu.Item value="sort-desc">Sort Z → A</Menu.Item>
        <Menu.Separator />
      </Show>
      <Show
        when={pinned()}
        fallback={
          <>
            <Menu.Item value="pin-start">Pin to start</Menu.Item>
            <Menu.Item value="pin-end">Pin to end</Menu.Item>
          </>
        }
      >
        <Menu.Item value="unpin">Unpin</Menu.Item>
      </Show>
      <Show when={menu.reorderable}>
        <Menu.Separator />
        <Menu.Item value="move-left" disabled={!menu.canMoveLeft}>
          Move left
        </Menu.Item>
        <Menu.Item value="move-right" disabled={!menu.canMoveRight}>
          Move right
        </Menu.Item>
      </Show>
      <Show when={menu.resizable}>
        <Menu.Separator />
        <Menu.Item value="reset-size">Reset size</Menu.Item>
      </Show>
      <Show when={menu.canHide}>
        <Menu.Separator />
        <Menu.Item value="hide">Hide column</Menu.Item>
      </Show>
    </>
  )
}

export const ColumnMenu = { Root, Trigger, Content, Items }

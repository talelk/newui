import type { TreeCollection } from '@zag-js/collection'
import * as zag from '@zag-js/tree-view'
import {
  createMemo,
  For,
  type JSX,
  type ParentComponent,
  Show,
  splitProps,
} from 'solid-js'
import { createId } from '../../lib/id'
import { cn } from '../../lib/tv'
import { createZagApi, createZagContext } from '../../lib/zag'

type TreeApi = ReturnType<typeof zag.connect>

const { context: TreeContext, useApi: useTreeApi } =
  createZagContext<TreeApi>('Tree')

/**
 * One node. A `value` identifies it (the collection key), `label` is its
 * visible text, and nested `children` make it a branch. Any extra field is
 * preserved and reaches the render parts, so a node can carry its own record.
 *
 * Expansion and selection live in the machine, never on the node — the tree
 * does not write to the objects you pass in.
 */
export interface TreeItem {
  /** Stable identity. The default collection key. */
  value: string
  /** Visible text. Falls back to `value`. */
  label?: string
  /** Nested nodes. An absent or empty array makes this a leaf. */
  children?: TreeItem[]
  /** Skips the node for interaction. */
  disabled?: boolean
  /** Any extra field the caller wants to carry on the node. */
  [key: string]: unknown
}

export type TreeSelectionMode = 'single' | 'multiple'

export interface TreeRootProps {
  /** Nested nodes, converted to a Zag `TreeCollection`. */
  items?: TreeItem[]
  /** A pre-built collection. Wins over `items` when both are given. */
  collection?: TreeCollection<TreeItem>
  /** Field that uniquely identifies each node. Default `"value"`. */
  nodeKey?: string
  /** `"single"` (default) selects one node; `"multiple"` allows many. */
  selectionMode?: TreeSelectionMode
  /** Controlled selected node values (P2). */
  selectedValue?: string[]
  /** Uncontrolled initial selection. */
  defaultSelectedValue?: string[]
  /** Fires with the selected values after a selection change. */
  onSelectionChange?: (value: string[]) => void
  /** Controlled expanded node values (P2). */
  expandedValue?: string[]
  /** Uncontrolled initial expansion. */
  defaultExpandedValue?: string[]
  /** Fires with the expanded values after an expand/collapse. */
  onExpandedChange?: (value: string[]) => void
  /** Clicking a branch row toggles it. Default `true`. */
  expandOnClick?: boolean
  /** Focus a node by typing its label. Default `true`. */
  typeahead?: boolean
  /** Merged into the root wrapper. */
  class?: string
  children: JSX.Element
}

const ROOT_VALUE = '__tree_root__'

function buildCollection(
  items: TreeItem[],
  key: string,
): TreeCollection<TreeItem> {
  const rootNode: TreeItem = { value: ROOT_VALUE, children: items }
  // The synthetic root is skipped in traversal; it only needs to answer the
  // configured key so `isRootNode` comparisons stay consistent.
  if (key !== 'value') rootNode[key] = ROOT_VALUE
  return zag.collection<TreeItem>({
    rootNode,
    nodeToValue: (node) => String(node[key] ?? node.value ?? ''),
    nodeToString: (node) => String(node.label ?? node[key] ?? node.value ?? ''),
    nodeToChildren: (node) => node.children ?? [],
  })
}

/**
 * The provider and outer wrapper. It owns the collection and the expanded/
 * selected control (P2: a value plus a change callback, never `v-model`), and
 * provides the connected machine to every part.
 *
 * Render the tree itself with `Tree.Tree`; render nodes with `Tree.Node` (the
 * recursive default) or the low-level `Branch`/`Item` parts.
 */
const Root: ParentComponent<TreeRootProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'items',
    'collection',
    'nodeKey',
    'selectionMode',
    'selectedValue',
    'defaultSelectedValue',
    'onSelectionChange',
    'expandedValue',
    'defaultExpandedValue',
    'onExpandedChange',
    'expandOnClick',
    'typeahead',
    'class',
    'children',
  ])

  const collection = createMemo(() => {
    if (local.collection) return local.collection
    return buildCollection(local.items ?? [], local.nodeKey ?? 'value')
  })

  const machineId = createId('tree')
  const { api } = createZagApi<TreeApi>(zag.machine, zag.connect, () => ({
    id: machineId,
    collection: collection(),
    selectionMode: local.selectionMode ?? 'single',
    expandedValue: local.expandedValue,
    defaultExpandedValue: local.defaultExpandedValue,
    selectedValue: local.selectedValue,
    defaultSelectedValue: local.defaultSelectedValue,
    expandOnClick: local.expandOnClick ?? true,
    typeahead: local.typeahead ?? true,
    onExpandedChange: (details: { expandedValue: string[] }) =>
      local.onExpandedChange?.(details.expandedValue),
    onSelectionChange: (details: { selectedValue: string[] }) =>
      local.onSelectionChange?.(details.selectedValue),
  }))

  return (
    <TreeContext.Provider value={api}>
      <div
        {...rest}
        {...api().getRootProps()}
        data-slot="tree"
        class={cn('flex select-none flex-col gap-1', local.class)}
      >
        {local.children}
      </div>
    </TreeContext.Provider>
  )
}

interface PartProps {
  class?: string
  children?: JSX.Element
}

/** Accessible name for the tree. Wired to the `role="tree"` container. */
const Label: ParentComponent<PartProps> = (props) => {
  const api = useTreeApi()
  return (
    <div
      {...api().getLabelProps()}
      data-slot="tree-label"
      class={cn('text-base font-medium text-ink-gray-8', props.class)}
    >
      {props.children}
    </div>
  )
}

/** The `role="tree"` container. Put `Tree.Node`s inside it. */
const TreeList: ParentComponent<PartProps> = (props) => {
  const api = useTreeApi()
  return (
    <div
      {...api().getTreeProps()}
      data-slot="tree-tree"
      class={cn('flex flex-col', props.class)}
    >
      {props.children}
    </div>
  )
}

export interface TreeNodeProps {
  /** The node this part renders. */
  node: TreeItem
  /** Index path from the root, e.g. `[0, 1]`. Zag keys state by it. */
  indexPath: number[]
  /** Merged into the part. */
  class?: string
  children?: JSX.Element
}

/** A branch wrapper (`role="treeitem"`); holds a control and its content. */
const Branch: ParentComponent<TreeNodeProps> = (props) => {
  const api = useTreeApi()
  return (
    <div
      {...api().getBranchProps({
        node: props.node,
        indexPath: props.indexPath,
      })}
      data-slot="tree-branch"
      class={cn('flex flex-col', props.class)}
    >
      {props.children}
    </div>
  )
}

/** The clickable row of a branch. Toggles it and selects it. */
const BranchControl: ParentComponent<TreeNodeProps> = (props) => {
  const api = useTreeApi()
  return (
    <div
      {...api().getBranchControlProps({
        node: props.node,
        indexPath: props.indexPath,
      })}
      data-slot="tree-branch-control"
      class={cn(
        'flex h-8 cursor-pointer items-center gap-1.5 rounded-5 pe-1.5 text-base text-ink-gray-8 outline-none transition-colors',
        'ps-[calc(var(--depth)*1rem)]',
        'hover:bg-surface-gray-2',
        'data-[selected]:bg-surface-gray-3 data-[selected]:text-ink-gray-9',
        'focus-visible:focus-ring',
        'data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-gray-4',
        props.class,
      )}
    >
      {props.children}
    </div>
  )
}

/** The chevron button that opens/closes a branch without selecting it. */
const BranchTrigger: ParentComponent<TreeNodeProps> = (props) => {
  const api = useTreeApi()
  return (
    <button
      {...api().getBranchTriggerProps({
        node: props.node,
        indexPath: props.indexPath,
      })}
      type="button"
      data-slot="tree-branch-trigger"
      class={cn(
        'grid size-5 shrink-0 place-items-center rounded-4 text-ink-gray-5 outline-none',
        'hover:bg-surface-gray-3 focus-visible:focus-ring',
        'data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-gray-4',
        props.class,
      )}
    >
      {props.children}
    </button>
  )
}

/** The rotating chevron. */
const BranchIndicator: ParentComponent<TreeNodeProps> = (props) => {
  const api = useTreeApi()
  return (
    <span
      {...api().getBranchIndicatorProps({
        node: props.node,
        indexPath: props.indexPath,
      })}
      data-slot="tree-branch-indicator"
      class={cn(
        'lucide-chevron-right size-3.5 shrink-0 text-ink-gray-6 transition-transform',
        'data-[state=open]:rotate-90',
        props.class,
      )}
    />
  )
}

/** The branch's label. */
const BranchText: ParentComponent<TreeNodeProps> = (props) => {
  const api = useTreeApi()
  return (
    <span
      {...api().getBranchTextProps({
        node: props.node,
        indexPath: props.indexPath,
      })}
      data-slot="tree-branch-text"
      class={cn('truncate leading-tighter', props.class)}
    >
      {props.children}
    </span>
  )
}

/** A branch's children (`role="group"`); hidden while collapsed. */
const BranchContent: ParentComponent<TreeNodeProps> = (props) => {
  const api = useTreeApi()
  return (
    <div
      {...api().getBranchContentProps({
        node: props.node,
        indexPath: props.indexPath,
      })}
      data-slot="tree-branch-content"
      class={cn('relative flex flex-col', props.class)}
    >
      {props.children}
    </div>
  )
}

/** The vertical line that links a branch to its children. */
const BranchIndentGuide: ParentComponent<TreeNodeProps> = (props) => {
  const api = useTreeApi()
  return (
    <span
      {...api().getBranchIndentGuideProps({
        node: props.node,
        indexPath: props.indexPath,
      })}
      aria-hidden="true"
      data-slot="tree-indent-guide"
      class={cn(
        'pointer-events-none absolute inset-y-0 w-px bg-outline-gray-2',
        props.class,
      )}
    />
  )
}

/** A leaf row (`role="treeitem"`). Selecting it is a click or Enter. */
const Item: ParentComponent<TreeNodeProps> = (props) => {
  const api = useTreeApi()
  return (
    <div
      {...api().getItemProps({
        node: props.node,
        indexPath: props.indexPath,
      })}
      data-slot="tree-item"
      class={cn(
        'flex h-8 cursor-pointer items-center gap-1.5 rounded-5 pe-1.5 text-base text-ink-gray-8 outline-none transition-colors',
        'ps-[calc(var(--depth)*1rem)]',
        'hover:bg-surface-gray-2',
        'data-[selected]:bg-surface-gray-3 data-[selected]:text-ink-gray-9',
        'focus-visible:focus-ring',
        'data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-gray-4',
        props.class,
      )}
    >
      {props.children}
    </div>
  )
}

/** A leaf's label. */
const ItemText: ParentComponent<TreeNodeProps> = (props) => {
  const api = useTreeApi()
  return (
    <span
      {...api().getItemTextProps({
        node: props.node,
        indexPath: props.indexPath,
      })}
      data-slot="tree-item-text"
      class={cn('truncate leading-tighter', props.class)}
    >
      {props.children}
    </span>
  )
}

/** A leaf's selected marker; hidden unless the node is selected. */
const ItemIndicator: ParentComponent<TreeNodeProps> = (props) => {
  const api = useTreeApi()
  return (
    <span
      {...api().getItemIndicatorProps({
        node: props.node,
        indexPath: props.indexPath,
      })}
      data-slot="tree-item-indicator"
      class={cn('lucide-check size-3.5 shrink-0 text-ink-blue-6', props.class)}
    />
  )
}

/** A tri-state checkbox for a node (needs `checkedValue` on the machine). */
const NodeCheckbox: ParentComponent<TreeNodeProps> = (props) => {
  const api = useTreeApi()
  return (
    <div
      {...api().getNodeCheckboxProps({
        node: props.node,
        indexPath: props.indexPath,
      })}
      data-slot="tree-node-checkbox"
      class={cn(
        'grid size-4 shrink-0 place-items-center rounded-2 border border-outline-gray-3 text-ink-base outline-none',
        'data-[state=checked]:border-surface-gray-10 data-[state=checked]:bg-surface-gray-10',
        'data-[state=indeterminate]:border-surface-gray-10 data-[state=indeterminate]:bg-surface-gray-10',
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60',
        props.class,
      )}
    >
      <span class="lucide-check size-3" aria-hidden="true" />
    </div>
  )
}

/**
 * The default recursive renderer: a branch (control + indicator + content) or a
 * leaf item. Map your roots with `<For>` and let `Tree.Node` walk the children.
 * For a custom row, drop to `Branch`/`Item` and their parts.
 */
const Node: ParentComponent<TreeNodeProps> = (props) => {
  const api = useTreeApi()
  const nodeProps = () => ({
    node: props.node,
    indexPath: props.indexPath,
  })
  const state = createMemo(() => api().getNodeState(nodeProps()))
  const label = () => api().collection.stringifyNode(props.node)

  return (
    <Show
      when={state().isBranch}
      fallback={
        <Item node={props.node} indexPath={props.indexPath} class={props.class}>
          <ItemText node={props.node} indexPath={props.indexPath}>
            {label()}
          </ItemText>
          <ItemIndicator node={props.node} indexPath={props.indexPath} />
        </Item>
      }
    >
      <Branch node={props.node} indexPath={props.indexPath} class={props.class}>
        <BranchControl node={props.node} indexPath={props.indexPath}>
          <BranchIndicator node={props.node} indexPath={props.indexPath} />
          <BranchText node={props.node} indexPath={props.indexPath}>
            {label()}
          </BranchText>
        </BranchControl>
        <BranchContent node={props.node} indexPath={props.indexPath}>
          <BranchIndentGuide node={props.node} indexPath={props.indexPath} />
          <For each={props.node.children ?? []}>
            {(child, index) => (
              <Node node={child} indexPath={[...props.indexPath, index()]} />
            )}
          </For>
        </BranchContent>
      </Branch>
    </Show>
  )
}

/**
 * A hierarchical tree view built on Zag's `tree-view` machine — keyboard, ARIA
 * and focus come from the primitive. `Root` owns the collection and the
 * expanded/selected control; `Tree` is the `role="tree"` container; `Node`
 * renders a node and recurses.
 */
export const Tree = {
  Root,
  Label,
  Tree: TreeList,
  Branch,
  BranchControl,
  BranchTrigger,
  BranchIndicator,
  BranchText,
  BranchContent,
  BranchIndentGuide,
  Item,
  ItemText,
  ItemIndicator,
  NodeCheckbox,
  Node,
}

export type { TreeRootProps as TreeProps }

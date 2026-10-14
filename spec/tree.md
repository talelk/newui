# Tree

`Tree` — a hierarchical tree view with expand/collapse and selection. Built on
Zag's `tree-view` machine (keyboard, ARIA and focus come from the primitive).

## Compound parts

`Tree` is a namespace. `Root` owns the collection and the expanded/selected
control; `Tree.Tree` is the `role="tree"` container; `Tree.Node` renders a node
and recurses. For a custom row, use the low-level parts.

| part | renders |
| --- | --- |
| `Tree.Root` | provider + outer wrapper (`getRootProps`) |
| `Tree.Label` | accessible name, wired to the tree |
| `Tree.Tree` | the `role="tree"` container |
| `Tree.Node` | default recursive renderer (branch or item) |
| `Tree.Branch` | a branch (`role="treeitem"`) |
| `Tree.BranchControl` | the branch's clickable row |
| `Tree.BranchTrigger` | chevron button (toggles without selecting) |
| `Tree.BranchIndicator` | the rotating chevron |
| `Tree.BranchText` | the branch label |
| `Tree.BranchContent` | a branch's children (`role="group"`) |
| `Tree.BranchIndentGuide` | the vertical connector line |
| `Tree.Item` | a leaf row (`role="treeitem"`) |
| `Tree.ItemText` | the leaf label |
| `Tree.ItemIndicator` | the selected marker |
| `Tree.NodeCheckbox` | a tri-state checkbox for a node |

Every node part takes `node` and `indexPath` (Zag's `NodeProps`).

## Props (`Tree.Root`)

| prop | type | default | notes |
| --- | --- | --- | --- |
| `items` | `TreeItem[]` | — | nested nodes; converted to a Zag `TreeCollection` |
| `collection` | `TreeCollection<TreeItem>` | — | pre-built collection; wins over `items` |
| `nodeKey` | `string` | `"value"` | field that uniquely identifies a node |
| `selectionMode` | `single \| multiple` | `single` | |
| `selectedValue` | `string[]` | — | controlled selection (P2) |
| `defaultSelectedValue` | `string[]` | `[]` | uncontrolled |
| `onSelectionChange` | `(value: string[]) => void` | — | fires with the selected values |
| `expandedValue` | `string[]` | — | controlled expansion (P2) |
| `defaultExpandedValue` | `string[]` | `[]` | uncontrolled |
| `onExpandedChange` | `(value: string[]) => void` | — | fires with the expanded values |
| `expandOnClick` | `boolean` | `true` | clicking a branch row toggles it |
| `typeahead` | `boolean` | `true` | focus a node by typing its label |
| `class` | `string` | — | merged into the root wrapper |

`TreeItem` is `{ value, label?, children?, disabled? }` plus any extra field
(which reaches the parts). A node with no `children`, or an empty array, is a
leaf. Expansion and selection live in the machine, never on the node — the tree
does not write to the objects you pass in.

## Behavior

- Expansion: click a branch row (or its `BranchTrigger`), or press `Enter` /
  `Space` / `ArrowRight` on it. The `expandedValue` list holds the open node
  values; a value that is absent means collapsed.
- Selection: clicking a row (or `Enter` on it) selects it. In `multiple` mode,
  Ctrl/Cmd-click toggles a node and Shift-click extends the range.
- Controlled: pass `expandedValue` / `selectedValue` and update them in the
  callbacks (P2: a value plus a change callback, never `v-model`).

## Keyboard / ARIA

Zag supplies the WAI-ARIA tree pattern: `role="tree"`, `treeitem` and `group`,
`aria-level`, `aria-expanded`, `aria-selected`, `aria-multiselectable`.

| keys | action |
| --- | --- |
| `ArrowDown` / `ArrowUp` | move to the next or previous visible row |
| `ArrowRight` | open a branch, or move to its first child |
| `ArrowLeft` | close a branch, or move to its parent |
| `Home` / `End` | move to the first or last row |
| `Enter` / `Space` | select, or open/close a branch |
| letters | focus the next row whose label starts with them |

## Styling hooks

`data-slot` (`tree`, `tree-label`, `tree-tree`, `tree-branch`,
`tree-branch-control`, `tree-branch-trigger`, `tree-branch-indicator`,
`tree-branch-text`, `tree-branch-content`, `tree-indent-guide`, `tree-item`,
`tree-item-text`, `tree-item-indicator`, `tree-node-checkbox`), plus Zag's
`data-state` (`open`/`closed`, `checked`/`unchecked`/`indeterminate`),
`data-selected`, `data-focus`, `data-disabled`, `data-depth` and the
`--depth` custom property used for indentation.

Customize via the parts, not class props (P10); `class` on a part is merged with
`cn()`.

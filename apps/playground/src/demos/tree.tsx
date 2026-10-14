import { Tree, type TreeItem } from '@newui/ui'
import { For, type JSX } from 'solid-js'

const TREE_ITEMS: TreeItem[] = [
  {
    value: 'src',
    label: 'src',
    children: [
      { value: 'src/index.ts', label: 'index.ts' },
      { value: 'src/app.ts', label: 'app.ts' },
    ],
  },
  { value: 'readme', label: 'README.md' },
]

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <Tree.Root items={TREE_ITEMS}>
      <Tree.Label>Files</Tree.Label>
      <Tree.Tree>
        <For each={TREE_ITEMS}>
          {(node, index) => <Tree.Node node={node} indexPath={[index()]} />}
        </For>
      </Tree.Tree>
    </Tree.Root>
  )
}

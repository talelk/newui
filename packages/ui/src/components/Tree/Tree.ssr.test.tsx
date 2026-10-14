import { For } from 'solid-js'
import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { Tree, type TreeItem } from './Tree'

const ITEMS: TreeItem[] = [
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

describe('SSR smoke', () => {
  it('Tree renders to a string', () => {
    const html = renderToString(() => (
      <Tree.Root items={ITEMS} defaultExpandedValue={['src']}>
        <Tree.Label>Files</Tree.Label>
        <Tree.Tree>
          <For each={ITEMS}>
            {(node, index) => <Tree.Node node={node} indexPath={[index()]} />}
          </For>
        </Tree.Tree>
      </Tree.Root>
    ))
    expect(html).toContain('role="tree"')
    expect(html).toContain('role="treeitem"')
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('index.ts')
    expect(html).toContain('README.md')
  })
})

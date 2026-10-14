import { render, screen } from '@solidjs/testing-library'
import { For } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { Tree, type TreeItem } from './Tree'

const ITEMS: TreeItem[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
]

describe('Tree (browser, real CSS)', () => {
  it('gives rows a real height and paints the selected one', () => {
    render(() => (
      <Tree.Root items={ITEMS} defaultSelectedValue={['a']}>
        <Tree.Tree>
          <For each={ITEMS}>
            {(node, index) => <Tree.Node node={node} indexPath={[index()]} />}
          </For>
        </Tree.Tree>
      </Tree.Root>
    ))

    const rows = screen.getAllByRole('treeitem') as HTMLElement[]
    expect(rows.length).toBe(2)
    const selected = rows.find((row) => row.hasAttribute('data-selected'))
    const resting = rows.find((row) => !row.hasAttribute('data-selected'))
    expect(selected).toBeTruthy()
    expect(resting).toBeTruthy()
    expect(selected?.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(getComputedStyle(selected as HTMLElement).backgroundColor).not.toBe(
      getComputedStyle(resting as HTMLElement).backgroundColor,
    )
  })
})

import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { For, Show } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { Tree, type TreeItem } from './Tree'

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
}

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

function summarize(results: AxeResults) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))
}

function Example(props: { label?: boolean }) {
  return (
    <Tree.Root items={ITEMS} defaultExpandedValue={['src']}>
      <Show when={props.label !== false}>
        <Tree.Label>Files</Tree.Label>
      </Show>
      <Tree.Tree>
        <For each={ITEMS}>
          {(node, index) => <Tree.Node node={node} indexPath={[index()]} />}
        </For>
      </Tree.Tree>
    </Tree.Root>
  )
}

describe('Tree accessibility', () => {
  it('has no axe violations for a labelled tree', async () => {
    const { container } = render(() => <Example />)
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a bare tree', async () => {
    const { container } = render(() => <Example label={false} />)
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})

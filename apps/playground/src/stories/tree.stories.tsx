import { Tree, type TreeItem } from '@newui/ui'
import { For, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

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

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
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

const meta = {
  title: 'Components/Display/Tree',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Selected: the first node is chosen before any interaction. */
export const Selected: Story = {
  render: () => (
    <Tree.Root items={TREE_ITEMS} selectedValue={['src']}>
      <Tree.Label>Files</Tree.Label>
      <Tree.Tree>
        <For each={TREE_ITEMS}>
          {(node, index) => <Tree.Node node={node} indexPath={[index()]} />}
        </For>
      </Tree.Tree>
    </Tree.Root>
  ),
}

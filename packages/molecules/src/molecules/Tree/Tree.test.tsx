import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { For, Show } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
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

/** Find a treeitem by its value. The accessible name of a branch includes its
 * (expanded) descendants, so `data-value` is the stable handle. */
function treeitem(value: string): HTMLElement {
  const match = screen
    .getAllByRole('treeitem')
    .find((el) => el.getAttribute('data-value') === value)
  if (!match) throw new Error(`no treeitem with value "${value}"`)
  return match
}

interface ExampleProps {
  onSelectionChange?: (value: string[]) => void
  onExpandedChange?: (value: string[]) => void
  defaultExpandedValue?: string[]
  expandedValue?: string[]
  selectionMode?: 'single' | 'multiple'
  withLabel?: boolean
}

function Example(props: ExampleProps) {
  return (
    <Tree.Root
      items={ITEMS}
      selectionMode={props.selectionMode}
      defaultExpandedValue={props.defaultExpandedValue}
      expandedValue={props.expandedValue}
      onSelectionChange={props.onSelectionChange}
      onExpandedChange={props.onExpandedChange}
    >
      <Show when={props.withLabel !== false}>
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

describe('Tree', () => {
  it('renders an ARIA tree, collapsed by default', () => {
    render(() => <Example />)

    expect(screen.getByRole('tree')).toBeTruthy()
    // A collapsed tree shows only its roots.
    expect(screen.getAllByRole('treeitem')).toHaveLength(2)

    const branch = treeitem('src')
    expect(branch.getAttribute('aria-expanded')).toBe('false')
    expect(branch.getAttribute('aria-level')).toBe('1')
  })

  it('names the tree from Tree.Label', () => {
    render(() => <Example />)
    expect(screen.getByRole('tree', { name: 'Files' })).toBeTruthy()
  })

  it('marks the tree multiselectable in multiple mode', () => {
    render(() => <Example selectionMode="multiple" />)
    expect(screen.getByRole('tree').getAttribute('aria-multiselectable')).toBe(
      'true',
    )
  })

  it('expands and collapses a branch on click', async () => {
    const onExpandedChange = vi.fn()
    render(() => <Example onExpandedChange={onExpandedChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'src' }))
    expect(onExpandedChange).toHaveBeenLastCalledWith(['src'])
    expect(screen.getAllByRole('treeitem')).toHaveLength(4)
    expect(treeitem('src').getAttribute('aria-expanded')).toBe('true')

    await userEvent.click(screen.getByRole('button', { name: 'src' }))
    expect(onExpandedChange).toHaveBeenLastCalledWith([])
    expect(screen.getAllByRole('treeitem')).toHaveLength(2)
  })

  it('reports a leaf selection through onSelectionChange', async () => {
    const onSelectionChange = vi.fn()
    render(() => <Example onSelectionChange={onSelectionChange} />)

    await userEvent.click(treeitem('readme'))
    expect(onSelectionChange).toHaveBeenLastCalledWith(['readme'])
  })

  it('honours defaultExpandedValue', () => {
    render(() => <Example defaultExpandedValue={['src']} />)
    expect(screen.getAllByRole('treeitem')).toHaveLength(4)
  })

  it('honours a controlled expandedValue', () => {
    render(() => <Example expandedValue={['src']} />)
    expect(screen.getAllByRole('treeitem')).toHaveLength(4)
  })

  it('expands a focused branch with ArrowRight', async () => {
    render(() => <Example />)

    screen.getByRole('button', { name: 'src' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(treeitem('src').getAttribute('aria-expanded')).toBe('true')
  })
})

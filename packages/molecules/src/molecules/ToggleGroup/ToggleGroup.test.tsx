import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ToggleGroup } from './ToggleGroup'

function Example(props: {
  multiple?: boolean
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}) {
  return (
    <ToggleGroup.Root
      aria-label="Views"
      multiple={props.multiple}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
    >
      <ToggleGroup.Item value="list">List</ToggleGroup.Item>
      <ToggleGroup.Item value="board">Board</ToggleGroup.Item>
      <ToggleGroup.Item value="calendar" disabled>
        Calendar
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  )
}

describe('ToggleGroup', () => {
  it('is a radiogroup when only one value is allowed', () => {
    render(() => <Example />)
    expect(screen.getByRole('radiogroup', { name: 'Views' })).toBeTruthy()
  })

  it('is a group when several values are allowed', () => {
    render(() => <Example multiple />)
    expect(screen.getByRole('group', { name: 'Views' })).toBeTruthy()
  })

  it('renders every cell and presses the default one', () => {
    render(() => <Example defaultValue={['board']} />)
    const cells = screen.getAllByRole('radio')
    expect(cells).toHaveLength(3)
    expect(
      screen.getByRole('radio', { name: 'Board' }).getAttribute('data-state'),
    ).toBe('on')
    expect(
      screen.getByRole('radio', { name: 'List' }).getAttribute('data-state'),
    ).toBe('off')
  })

  it('reports the new selection', async () => {
    const onValueChange = vi.fn()
    render(() => <Example onValueChange={onValueChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Board' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['board'])
  })

  it('presses a cell with the keyboard', async () => {
    render(() => <Example />)
    const cell = screen.getByRole('radio', { name: 'List' })
    cell.focus()
    await userEvent.keyboard(' ')
    expect(cell.getAttribute('data-state')).toBe('on')
  })

  it('allows one value unless multiple is set', async () => {
    render(() => <Example />)
    await userEvent.click(screen.getByRole('radio', { name: 'List' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Board' }))
    expect(
      screen.getByRole('radio', { name: 'List' }).getAttribute('data-state'),
    ).toBe('off')
  })

  it('keeps both when multiple is set', async () => {
    render(() => <Example multiple />)
    // With `multiple` the root is a group and the cells are pressed buttons,
    // not radios — that is what makes "several on at once" legal ARIA.
    await userEvent.click(screen.getByRole('button', { name: 'List' }))
    await userEvent.click(screen.getByRole('button', { name: 'Board' }))
    expect(
      screen.getByRole('button', { name: 'List' }).getAttribute('data-state'),
    ).toBe('on')
    expect(
      screen.getByRole('button', { name: 'Board' }).getAttribute('data-state'),
    ).toBe('on')
  })

  it('disables a disabled cell', () => {
    render(() => <Example />)
    expect(
      screen.getByRole('radio', { name: 'Calendar' }).hasAttribute('disabled'),
    ).toBe(true)
  })

  it('takes its shape from the root, not from the cells', () => {
    render(() => (
      <ToggleGroup.Root aria-label="Density" variant="outline" size="lg">
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
      </ToggleGroup.Root>
    ))
    const root = screen.getByRole('radiogroup', { name: 'Density' })
    expect(root.getAttribute('data-variant')).toBe('outline')
    expect(root.getAttribute('data-size')).toBe('lg')
  })
})

import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TransferList } from './TransferList'

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
]

async function mount(
  overrides?: Partial<Parameters<typeof TransferList>[0]> & {
    onValueChange?: (value: string[]) => void
  },
) {
  const onValueChange = vi.fn()
  const view = render(() => (
    <TransferList
      options={FRUITS}
      onValueChange={onValueChange}
      {...overrides}
    />
  ))
  return { onValueChange, ...view }
}

const moveRight = () =>
  screen.getByRole('button', { name: 'Move checked to selected' })
const moveLeft = () =>
  screen.getByRole('button', { name: 'Move checked to available' })

describe('TransferList', () => {
  it('splits the options across available and selected panels', () => {
    const { container } = render(() => (
      <TransferList options={FRUITS} defaultValue={['apple']} />
    ))
    const panels = container.querySelectorAll(
      '[data-slot="transfer-list-panel"]',
    )
    expect(panels.length).toBe(2)
    expect(screen.getByText('Available (3)')).toBeTruthy()
    expect(screen.getByText('Selected (1)')).toBeTruthy()
  })

  it('moves checked rows to the other side', async () => {
    await mount()
    const banana = screen.getByRole('checkbox', { name: 'Banana' })
    await userEvent.click(banana)
    await userEvent.click(moveRight())
    expect(screen.getByText('Selected (1)')).toBeTruthy()
    expect(screen.getByText('Available (3)')).toBeTruthy()
    // The moved row renders on the right, unchecked.
    const movedRight = screen.getAllByRole('checkbox', { name: 'Banana' })
    expect(movedRight.length).toBe(1)
  })

  it('moves everything with the double-chevron buttons', async () => {
    await mount()
    await userEvent.click(
      screen.getByRole('button', { name: 'Move everything to selected' }),
    )
    expect(screen.getByText('Selected (4)')).toBeTruthy()
    expect(screen.getByText('Available (0)')).toBeTruthy()
  })

  it('reports the picked values in order', async () => {
    const { onValueChange } = await mount()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Cherry' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Apple' }))
    await userEvent.click(moveRight())
    expect(onValueChange).toHaveBeenLastCalledWith(['cherry', 'apple'])
  })

  it('filters both panels when `search` is on', async () => {
    await mount({ search: true })
    const filter = screen.getByRole('textbox', { name: 'Filter available' })
    await userEvent.type(filter, 'an')
    // "Banana" and "Date" match "an" (Date has no 'an'? d-a-t-e — no). Cherry no.
    expect(screen.getByRole('checkbox', { name: 'Banana' })).toBeTruthy()
    expect(screen.queryByRole('checkbox', { name: 'Cherry' })).toBeNull()
  })

  it('honours a controlled `value`', async () => {
    await mount({ value: ['date'] })
    await userEvent.click(moveLeft())
    // Controlled: the owner decides; the right panel keeps its pick.
    expect(screen.getByText('Selected (1)')).toBeTruthy()
  })

  it('disables every control together', () => {
    render(() => <TransferList options={FRUITS} disabled />)
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect((checkbox as HTMLInputElement).disabled).toBe(true)
    }
    expect((moveRight() as HTMLButtonElement).disabled).toBe(true)
  })
})

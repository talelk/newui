import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Combobox } from './Combobox'

const OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Paid', value: 'paid' },
  { label: 'Cancelled', value: 'cancelled', disabled: true },
]

const GROUPED = [
  {
    group: 'Active',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Paid', value: 'paid' },
    ],
  },
  { group: 'Closed', options: [{ label: 'Cancelled', value: 'cancelled' }] },
]

const RICH_OPTIONS = [
  {
    label: 'Draft',
    value: 'draft',
    icon: 'lucide-file',
    description: 'Not sent yet',
  },
]

function comboboxOf(): HTMLInputElement {
  return screen.getByRole('combobox') as HTMLInputElement
}

describe('Combobox', () => {
  it('renders a combobox input', () => {
    render(() => <Combobox options={OPTIONS} label="Status" />)
    expect(comboboxOf().getAttribute('role')).toBe('combobox')
    expect(comboboxOf().getAttribute('aria-expanded')).toBe('false')
  })

  it('shows the selected option label for a controlled value', () => {
    render(() => <Combobox options={OPTIONS} value="paid" />)
    expect(comboboxOf().value).toBe('Paid')
  })

  it('opens on click and lists the options', async () => {
    render(() => <Combobox options={OPTIONS} label="Status" />)
    await userEvent.click(comboboxOf())
    expect(await screen.findByRole('option', { name: /Draft/ })).toBeTruthy()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('filters the options as the user types', async () => {
    render(() => <Combobox options={OPTIONS} label="Status" />)
    await userEvent.type(comboboxOf(), 'can')
    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]?.textContent).toContain('Cancelled')
  })

  it('shows the empty state when nothing matches', async () => {
    render(() => (
      <Combobox options={OPTIONS} label="Status" emptyText="Nothing here" />
    ))
    await userEvent.type(comboboxOf(), 'zzz')
    expect(await screen.findByText('Nothing here')).toBeTruthy()
  })

  it('commits a click selection through onValueChange', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <Combobox
        options={OPTIONS}
        label="Status"
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(comboboxOf())
    await userEvent.click(await screen.findByRole('option', { name: /Draft/ }))

    expect(onValueChange).toHaveBeenCalledWith('draft')
    expect(comboboxOf().value).toBe('Draft')
    expect(comboboxOf().getAttribute('aria-expanded')).toBe('false')
  })

  it('commits a keyboard selection', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <Combobox
        options={OPTIONS}
        label="Status"
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(comboboxOf())
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('draft')
  })

  it('wires the shared labelling contract', () => {
    render(() => (
      <Combobox
        options={OPTIONS}
        label="Status"
        description="Where it stands"
        error="Pick one"
        required
      />
    ))
    const input = comboboxOf()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')?.split(' ').length).toBe(2)

    const label = document.querySelector(`label[for="${input.id}"]`)
    expect(label?.textContent).toContain('Status')
  })

  it('does not open when disabled', async () => {
    render(() => <Combobox options={OPTIONS} label="Status" disabled />)
    await userEvent.click(comboboxOf())
    expect(screen.queryByRole('option')).toBeNull()
  })

  it('shows a loading row instead of results', async () => {
    render(() => <Combobox options={OPTIONS} label="Status" loading />)
    await userEvent.click(comboboxOf())
    expect(await screen.findByText('Loading...')).toBeTruthy()
    // The row is a *disabled option*: a listbox may only contain options
    // (axe: aria-required-children), and none of them selectable.
    const options = screen.queryAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveAttribute('aria-disabled', 'true')
  })

  it('keeps every option when filterable is false', async () => {
    render(() => (
      <Combobox options={OPTIONS} label="Status" filterable={false} />
    ))
    await userEvent.type(comboboxOf(), 'zzz')
    expect(await screen.findAllByRole('option')).toHaveLength(3)
  })

  it('filters from a controlled query and reports changes', async () => {
    const onQueryChange = vi.fn()
    const [query, setQuery] = createSignal('')
    render(() => (
      <Combobox
        options={OPTIONS}
        label="Status"
        query={query()}
        onQueryChange={(value) => {
          setQuery(value)
          onQueryChange(value)
        }}
      />
    ))
    await userEvent.type(comboboxOf(), 'can')
    expect(onQueryChange).toHaveBeenCalled()
    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]?.textContent).toContain('Cancelled')
  })

  it('renders grouped options with their headings', async () => {
    render(() => <Combobox options={GROUPED} label="Status" />)
    await userEvent.click(comboboxOf())
    expect(await screen.findByText('Active')).toBeTruthy()
    expect(screen.getByText('Closed')).toBeTruthy()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('renders an option icon and description in the row', async () => {
    render(() => <Combobox options={RICH_OPTIONS} label="Status" />)
    await userEvent.click(comboboxOf())
    const option = await screen.findByRole('option', { name: /Draft/ })
    expect(option.textContent).toContain('Not sent yet')
    expect(option.querySelector('.lucide-file')).toBeTruthy()
  })
})

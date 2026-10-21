import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { MultiSelect } from './MultiSelect'

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

function inputOf(): HTMLInputElement {
  return screen.getByRole('combobox') as HTMLInputElement
}

function chipsOf(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll('[data-slot="multiselect-chip"]'),
  )
}

describe('MultiSelect', () => {
  it('renders a combobox input', () => {
    render(() => <MultiSelect options={OPTIONS} label="Status" />)
    expect(inputOf().getAttribute('role')).toBe('combobox')
  })

  it('renders a chip per selected value', () => {
    const { container } = render(() => (
      <MultiSelect options={OPTIONS} value={['draft', 'paid']} />
    ))
    const chips = chipsOf(container)
    expect(chips).toHaveLength(2)
    expect(chips[0]?.textContent).toContain('Draft')
    expect(chips[1]?.textContent).toContain('Paid')
  })

  it('keeps the popover open while selecting several options', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <MultiSelect
        options={OPTIONS}
        label="Status"
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(inputOf())
    await userEvent.click(await screen.findByRole('option', { name: /Draft/ }))
    expect(onValueChange).toHaveBeenCalledWith(['draft'])
    // Still open, so a second pick is possible without reopening.
    await userEvent.click(screen.getByRole('option', { name: /Paid/ }))
    expect(onValueChange).toHaveBeenLastCalledWith(['draft', 'paid'])
  })

  it('removes a chip', async () => {
    const onValueChange = vi.fn()
    const { container } = render(() => (
      <MultiSelect
        options={OPTIONS}
        value={['draft', 'paid']}
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(screen.getByRole('button', { name: 'Remove Draft' }))
    expect(onValueChange).toHaveBeenCalledWith(['paid'])
    expect(chipsOf(container)).toHaveLength(2) // controlled: unchanged until parent updates
  })

  it('filters the options as the user types', async () => {
    render(() => <MultiSelect options={OPTIONS} label="Status" />)
    await userEvent.type(inputOf(), 'can')
    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]?.textContent).toContain('Cancelled')
  })

  it('selects all enabled options from the footer', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <MultiSelect
        options={OPTIONS}
        label="Status"
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(inputOf())
    await userEvent.click(
      await screen.findByRole('button', { name: 'Select all' }),
    )
    expect(onValueChange).toHaveBeenCalledWith(['draft', 'paid'])
  })

  it('clears all from the footer', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <MultiSelect
        options={OPTIONS}
        label="Status"
        value={['draft']}
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(inputOf())
    await userEvent.click(
      await screen.findByRole('button', { name: 'Clear all' }),
    )
    expect(onValueChange).toHaveBeenCalledWith([])
  })

  it('wires the shared labelling contract', () => {
    render(() => (
      <MultiSelect
        options={OPTIONS}
        label="Status"
        description="Pick any"
        error="Pick one"
        required
      />
    ))
    const input = inputOf()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')?.split(' ').length).toBe(2)
    expect(
      document.querySelector(`label[for="${input.id}"]`)?.textContent,
    ).toContain('Status')
  })

  it('shows a loading row instead of results', async () => {
    render(() => <MultiSelect options={OPTIONS} label="Status" loading />)
    await userEvent.click(inputOf())
    expect(await screen.findByText('Loading...')).toBeTruthy()
    // The row is a *disabled option*: a listbox may only contain options
    // (axe: aria-required-children), and none of them selectable.
    const options = screen.queryAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveAttribute('aria-disabled', 'true')
  })

  it('keeps every option when filterable is false', async () => {
    render(() => (
      <MultiSelect options={OPTIONS} label="Status" filterable={false} />
    ))
    await userEvent.type(inputOf(), 'zzz')
    expect(await screen.findAllByRole('option')).toHaveLength(3)
  })

  it('filters from a controlled query and reports changes', async () => {
    const onQueryChange = vi.fn()
    const [query, setQuery] = createSignal('')
    render(() => (
      <MultiSelect
        options={OPTIONS}
        label="Status"
        query={query()}
        onQueryChange={(value) => {
          setQuery(value)
          onQueryChange(value)
        }}
      />
    ))
    await userEvent.type(inputOf(), 'can')
    expect(onQueryChange).toHaveBeenCalled()
    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]?.textContent).toContain('Cancelled')
  })

  it('renders grouped options with their headings', async () => {
    render(() => <MultiSelect options={GROUPED} label="Status" />)
    await userEvent.click(inputOf())
    expect(await screen.findByText('Active')).toBeTruthy()
    expect(screen.getByText('Closed')).toBeTruthy()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('renders an option icon and description in the row', async () => {
    render(() => <MultiSelect options={RICH_OPTIONS} label="Status" />)
    await userEvent.click(inputOf())
    const option = await screen.findByRole('option', { name: /Draft/ })
    expect(option.textContent).toContain('Not sent yet')
    expect(option.querySelector('.lucide-file')).toBeTruthy()
  })

  it('selects every option across groups', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <MultiSelect
        options={GROUPED}
        label="Status"
        onValueChange={onValueChange}
      />
    ))
    await userEvent.click(inputOf())
    await userEvent.click(
      await screen.findByRole('button', { name: 'Select all' }),
    )
    expect(onValueChange).toHaveBeenCalledWith(['draft', 'paid', 'cancelled'])
  })
})

import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FormControl } from './FormControl'

const OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Paid', value: 'paid' },
]

describe('FormControl', () => {
  it('defaults to a text input', () => {
    const { getByRole } = render(() => <FormControl label="Title" />)
    expect((getByRole('textbox') as HTMLInputElement).type).toBe('text')
  })

  it('routes a native input type to TextInput', () => {
    const { container } = render(() => (
      <FormControl type="email" label="Email" />
    ))
    expect(container.querySelector('input')?.type).toBe('email')
  })

  it('renders a textarea for type="textarea"', () => {
    const { container } = render(() => (
      <FormControl type="textarea" label="Notes" rows={5} />
    ))
    const textarea = container.querySelector('textarea')
    expect(textarea).not.toBeNull()
    expect(textarea?.getAttribute('rows')).toBe('5')
  })

  it('draws the shared labelling contract for text fields', () => {
    const { getByRole } = render(() => (
      <FormControl
        label="Email"
        description="We never share it"
        error="Required"
        required
      />
    ))
    const input = getByRole('textbox')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-required')).toBe('true')
    expect(input.getAttribute('aria-describedby')?.split(' ').length).toBe(2)
  })

  it('forwards value and onInput for text fields', async () => {
    const onInput = vi.fn()
    const { getByRole } = render(() => (
      <FormControl label="Title" value="" onInput={onInput} />
    ))
    await userEvent.type(getByRole('textbox'), 'Hello')
    expect(onInput).toHaveBeenCalled()
  })

  it('routes to Select and forwards value and onValueChange', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <FormControl
        type="select"
        label="Status"
        options={OPTIONS}
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(
      document.querySelector('[data-slot="select-trigger"]') as Element,
    )
    await userEvent.click(await screen.findByText('Paid'))
    expect(onValueChange).toHaveBeenCalledWith('paid')
  })

  it('routes to Checkbox and forwards checked and onCheckedChange', async () => {
    const onCheckedChange = vi.fn()
    const { getByRole } = render(() => (
      <FormControl
        type="checkbox"
        label="Agree"
        onCheckedChange={onCheckedChange}
      />
    ))

    await userEvent.click(getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('routes to Combobox and forwards value and onValueChange', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <FormControl
        type="combobox"
        label="Status"
        options={OPTIONS}
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: /Paid/ }))
    expect(onValueChange).toHaveBeenCalledWith('paid')
  })

  it('routes to MultiSelect and forwards value and onValueChange', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <FormControl
        type="multiselect"
        label="Status"
        options={OPTIONS}
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: /Paid/ }))
    expect(onValueChange).toHaveBeenCalledWith(['paid'])
  })

  it('routes to DatePicker and forwards value and onValueChange', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <FormControl
        type="date"
        label="Due"
        value="2026-10-14"
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.click(await screen.findByText('15'))
    expect(onValueChange).toHaveBeenCalledWith('2026-10-15')
  })

  it('passes an id through to the text control', () => {
    const { container } = render(() => <FormControl label="Email" id="email" />)
    expect(container.querySelector('input')?.id).toBe('email')
  })
})

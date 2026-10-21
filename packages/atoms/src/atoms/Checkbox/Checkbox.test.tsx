import { render } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('keeps uncontrolled selection and input identity when validation appears', async () => {
    const [error, setError] = createSignal<string>()
    const { getByRole } = render(() => (
      <Checkbox aria-label="Preference" error={error()} />
    ))
    const input = getByRole('checkbox') as HTMLInputElement
    await userEvent.click(input)
    setError('Review your preference.')
    expect(getByRole('checkbox')).toBe(input)
    expect(input.checked).toBe(true)
  })

  it('connects the shared label, supporting text and invalid state', () => {
    const { getByRole, getByText } = render(() => (
      <Checkbox
        label="Preference"
        description="Choose your preference."
        error="A preference is required."
        required
      />
    ))
    const control = getByRole('checkbox', { name: /Preference/ })
    expect(control).toHaveAttribute('aria-invalid', 'true')
    expect(control.getAttribute('aria-describedby')).toContain(
      getByText('Choose your preference.').id,
    )
    expect(control.getAttribute('aria-describedby')).toContain(
      getByRole('alert').id,
    )
  })

  it('exposes a checkbox with the checked state', () => {
    const { getByRole } = render(() => (
      <Checkbox label="Agree" defaultChecked />
    ))
    expect((getByRole('checkbox') as HTMLInputElement).checked).toBe(true)
  })

  it('reports changes through onCheckedChange', async () => {
    const onCheckedChange = vi.fn()
    const { getByRole } = render(() => (
      <Checkbox label="Agree" onCheckedChange={onCheckedChange} />
    ))
    await userEvent.click(getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('applies the requested size to the box', () => {
    const { getByRole, unmount } = render(() => (
      <Checkbox label="Agree" size="md" />
    ))
    expect(getByRole('checkbox').className).toContain('size-4')
    unmount()

    const { getByRole: xs } = render(() => <Checkbox label="Agree" size="xs" />)
    expect(xs('checkbox').className).toContain('size-[13px]')
  })

  it('toggles from the padded row surface', async () => {
    const onCheckedChange = vi.fn()
    const { container } = render(() => (
      <Checkbox padded label="Agree" onCheckedChange={onCheckedChange} />
    ))
    // The row is `data-slot="checkbox"`; the outer surface is its parent.
    const surface = container.querySelector(
      '[data-slot="checkbox-root"]',
    ) as HTMLElement
    expect(surface.className).toContain('hover:bg-surface-gray-3')
    await userEvent.click(surface)
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })
})

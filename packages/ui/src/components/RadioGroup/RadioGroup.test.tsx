import { render } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RadioGroup } from './RadioGroup'

const ITEMS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
]

describe('RadioGroup', () => {
  it('connects the shared label, supporting text and invalid state', () => {
    const { getByRole, getByText } = render(() => (
      <RadioGroup
        items={ITEMS}
        label="Preference"
        description="Choose your preference."
        error="A preference is required."
        required
      />
    ))
    const control = getByRole('radiogroup', { name: /Preference/ })
    expect(control).toHaveAttribute('aria-invalid', 'true')
    expect(control.getAttribute('aria-describedby')).toContain(
      getByText('Choose your preference.').id,
    )
    expect(control.getAttribute('aria-describedby')).toContain(
      getByRole('alert').id,
    )
  })

  it('renders one radio per item and checks the default', () => {
    const { getAllByRole } = render(() => (
      <RadioGroup items={ITEMS} defaultValue="b" />
    ))
    const radios = getAllByRole('radio') as HTMLInputElement[]
    expect(radios.length).toBe(2)
    expect(radios[1]?.checked).toBe(true)
  })

  it('reports the selected value', async () => {
    const onValueChange = vi.fn()
    const { getAllByRole } = render(() => (
      <RadioGroup items={ITEMS} onValueChange={onValueChange} />
    ))
    const first = getAllByRole('radio')[0]
    if (!first) throw new Error('no radio rendered')
    await userEvent.click(first)
    expect(onValueChange).toHaveBeenCalledWith('a')
  })

  it('applies the requested size to every option', () => {
    const { container } = render(() => <RadioGroup items={ITEMS} size="md" />)
    const control = container.querySelector('[data-slot="radio-control"]')
    expect(control?.className).toContain('size-4')
  })

  it('renders an item description under its label', () => {
    const { getByText } = render(() => (
      <RadioGroup
        items={[{ value: 'a', label: 'Alpha', description: 'The first one' }]}
      />
    ))
    expect(getByText('The first one')).toBeTruthy()
  })

  it('renders a group description and an alerting error', () => {
    const { getByText, getByRole } = render(() => (
      <RadioGroup items={ITEMS} description="Pick one" error="Required" />
    ))
    expect(getByText('Pick one')).toBeTruthy()
    expect(getByRole('alert').textContent).toBe('Required')
  })

  it('cancels arrow navigation at the ends when loop is false', () => {
    const { container } = render(() => (
      <RadioGroup items={ITEMS} loop={false} />
    ))
    const inputs = container.querySelectorAll('input[type="radio"]')
    const first = inputs[0] as HTMLInputElement
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      bubbles: true,
      cancelable: true,
    })
    first.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('lets arrow navigation wrap by default', () => {
    const { container } = render(() => <RadioGroup items={ITEMS} />)
    const inputs = container.querySelectorAll('input[type="radio"]')
    const first = inputs[0] as HTMLInputElement
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      bubbles: true,
      cancelable: true,
    })
    first.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })
})

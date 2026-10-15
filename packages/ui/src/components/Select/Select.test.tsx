import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Select } from './Select'

const OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Paid', value: 'paid' },
]

const RICH_OPTIONS = [
  {
    label: 'Draft',
    value: 'draft',
    icon: 'lucide-file',
    description: 'Not sent yet',
  },
  { label: 'Paid', value: 'paid', icon: 'lucide-check' },
]

describe('Select', () => {
  it('exposes a collapsed combobox showing the placeholder', () => {
    render(() => <Select options={OPTIONS} placeholder="Choose…" />)
    // The accessible control is Zag's native <select>, which carries the role.
    expect(screen.getByRole('combobox')).toBeTruthy()
    expect(
      document.querySelector('[data-slot="select-trigger"]')?.textContent,
    ).toContain('Choose…')
  })

  it('opens and selects an option', async () => {
    const onValueChange = vi.fn()
    render(() => <Select options={OPTIONS} onValueChange={onValueChange} />)

    await userEvent.click(
      document.querySelector('[data-slot="select-trigger"]') as Element,
    )
    await userEvent.click(await screen.findByText('Paid'))
    expect(onValueChange).toHaveBeenCalledWith(['paid'])
  })

  it('exposes the size and variant axes on the control', () => {
    render(() => <Select options={OPTIONS} size="lg" variant="outline" />)
    const control = document.querySelector('[data-slot="select-control"]')
    expect(control?.getAttribute('data-size')).toBe('lg')
    expect(control?.getAttribute('data-variant')).toBe('outline')
  })

  it('defaults to the outline variant', () => {
    render(() => <Select options={OPTIONS} />)
    expect(
      document
        .querySelector('[data-slot="select-control"]')
        ?.getAttribute('data-variant'),
    ).toBe('outline')
  })

  it('renders an option icon and description in the row', async () => {
    render(() => <Select options={RICH_OPTIONS} />)
    await userEvent.click(
      document.querySelector('[data-slot="select-trigger"]') as Element,
    )
    const item = await screen.findByText('Draft')
    const row = item.closest('[data-slot="select-item"]')
    expect(row?.textContent).toContain('Not sent yet')
    expect(
      document.querySelector('[data-slot="select-item"] .lucide-file'),
    ).toBeTruthy()
  })

  it('shows the selected option icon in the trigger', () => {
    const { container } = render(() => (
      <Select options={RICH_OPTIONS} value={['paid']} />
    ))
    const trigger = container.querySelector(
      '[data-slot="select-trigger"]',
    ) as HTMLElement
    expect(trigger.querySelector('.lucide-check')).toBeTruthy()
  })
})

it('labels the visible trigger and links help and validation through Field', () => {
  render(() => (
    <Select
      label="Region"
      description="Choose a reporting region"
      error="A region is required"
      required
      options={OPTIONS}
    />
  ))
  const trigger = screen.getByRole('combobox', {
    name: /^Region\s*\(required\)$/,
  })
  expect(trigger.getAttribute('aria-invalid')).toBe('true')
  expect(trigger.getAttribute('aria-describedby')?.split(' ')).toHaveLength(2)
  expect(document.querySelector(`label[for="${trigger.id}"]`)).not.toBeNull()
  expect(screen.getByRole('alert').textContent).toBe('A region is required')
})

it('keeps uncontrolled selection and the trigger when validation appears', async () => {
  const [error, setError] = createSignal<string>()
  render(() => <Select options={OPTIONS} error={error()} />)
  const trigger = document.querySelector(
    '[data-slot="select-trigger"]',
  ) as HTMLElement
  await userEvent.click(trigger)
  await userEvent.click(await screen.findByText('Paid'))
  setError('Please confirm this status.')
  expect(document.querySelector('[data-slot="select-trigger"]')).toBe(trigger)
  expect(trigger.textContent).toContain('Paid')
  expect(screen.getByRole('alert').textContent).toBe(
    'Please confirm this status.',
  )
})

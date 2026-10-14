import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
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

  it('defaults to the subtle variant', () => {
    render(() => <Select options={OPTIONS} />)
    expect(
      document
        .querySelector('[data-slot="select-control"]')
        ?.getAttribute('data-variant'),
    ).toBe('subtle')
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

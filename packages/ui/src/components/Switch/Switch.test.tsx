import { render } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Switch } from './Switch'

describe('Switch', () => {
  it('exposes a switch whose checked state tracks the prop', () => {
    const { getByRole } = render(() => (
      <Switch label="Notifications" defaultChecked />
    ))
    const el = getByRole('switch') as HTMLInputElement
    expect(el.checked).toBe(true)
  })

  it('reports changes through onCheckedChange', async () => {
    const onCheckedChange = vi.fn()
    const { getByRole } = render(() => (
      <Switch label="Notifications" onCheckedChange={onCheckedChange} />
    ))
    await userEvent.click(getByRole('switch'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('applies the requested size to the track and thumb', () => {
    const { container } = render(() => <Switch label="Notify" size="md" />)
    expect(
      container.querySelector('[data-slot="switch-control"]')?.className,
    ).toContain('h-5 w-8')
    expect(
      container.querySelector('[data-slot="switch-thumb"]')?.className,
    ).toContain('size-3.5')
  })

  it('renders the icon alongside the label', () => {
    const { container } = render(() => (
      <Switch label="Notify" icon="lucide-bell" />
    ))
    expect(container.querySelector('.lucide-bell')).not.toBeNull()
  })

  it('flips the row when the control leads', () => {
    const { container } = render(() => (
      <Switch label="Notify" controlPosition="start" />
    ))
    expect(
      container.querySelector('[data-slot="switch"]')?.className,
    ).toContain('flex-row-reverse')
  })

  it('toggles from the padded row surface', async () => {
    const onCheckedChange = vi.fn()
    const { container } = render(() => (
      <Switch padded label="Notify" onCheckedChange={onCheckedChange} />
    ))
    const surface = container.firstElementChild as HTMLElement
    expect(surface.className).toContain('hover:bg-surface-gray-3')
    await userEvent.click(surface)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })
})

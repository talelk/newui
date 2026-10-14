import { render } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
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
    const surface = container.firstElementChild as HTMLElement
    expect(surface.className).toContain('hover:bg-surface-gray-3')
    await userEvent.click(surface)
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })
})

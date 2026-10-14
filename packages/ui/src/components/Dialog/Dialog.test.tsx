import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Dialog } from './Dialog'

describe('Dialog', () => {
  it('advertises a dialog popup on the trigger', () => {
    const { getByRole } = render(() => (
      <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Hello</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>
    ))
    const trigger = getByRole('button', { name: 'Open' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
  })

  it('teleports an open dialog to the body with an opaque surface', () => {
    render(() => (
      <Dialog.Root defaultOpen>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Hello</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>
    ))

    const content = document.querySelector('[data-slot="dialog-content"]')
    const backdrop = document.querySelector('[data-slot="dialog-backdrop"]')

    expect(content).not.toBeNull()
    expect(backdrop).not.toBeNull()
    // The card must paint a real (non-transparent) surface token.
    expect(content?.className).toContain('bg-surface-elevation-1')
    // And the overlay must dim the page behind it.
    expect(backdrop?.className).toContain('bg-black-overlay-200')
    // Portalled out of the app tree, so no ancestor stacking context traps it.
    expect(content?.closest('#root')).toBeNull()
  })

  it('applies the size and position config to the content', () => {
    render(() => (
      <Dialog.Root defaultOpen>
        <Dialog.Content size="2xl" position="top">
          <Dialog.Title>Big</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>
    ))

    const content = document.querySelector(
      '[data-slot="dialog-content"]',
    ) as HTMLElement
    expect(content.className).toContain('max-w-2xl')
    expect(content.getAttribute('data-size')).toBe('2xl')

    const positioner = document.querySelector(
      '[data-slot="dialog-positioner"]',
    ) as HTMLElement
    expect(positioner.getAttribute('data-position')).toBe('top')
    expect(positioner.className).toContain('pt-[20vh]')
  })

  it('drops the default padding when bare', () => {
    render(() => (
      <Dialog.Root defaultOpen>
        <Dialog.Content bare>
          <span>raw</span>
        </Dialog.Content>
      </Dialog.Root>
    ))

    const content = document.querySelector(
      '[data-slot="dialog-content"]',
    ) as HTMLElement
    expect(content.className).not.toContain('p-4')
  })

  it('renders a themed icon badge in the header', () => {
    render(() => (
      <Dialog.Root defaultOpen>
        <Dialog.Content>
          <Dialog.Header icon="lucide-triangle-alert" theme="red">
            <Dialog.Title>Careful</Dialog.Title>
          </Dialog.Header>
        </Dialog.Content>
      </Dialog.Root>
    ))

    const badge = document.querySelector(
      '[data-slot="dialog-icon"]',
    ) as HTMLElement
    expect(badge).not.toBeNull()
    expect(badge.className).toContain('bg-surface-red-2')
    expect(badge.querySelector('.lucide-triangle-alert')).not.toBeNull()
  })

  it('renders footer actions as buttons', async () => {
    const onOpenChange = vi.fn()
    render(() => (
      <Dialog.Root defaultOpen onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Title>Confirm</Dialog.Title>
          <Dialog.Footer
            actions={[
              { label: 'Cancel' },
              { label: 'Save', variant: 'solid', theme: 'blue' },
            ]}
          />
        </Dialog.Content>
      </Dialog.Root>
    ))

    const save = screen.getByRole('button', { name: 'Save' })
    expect(save.className).toContain('bg-surface-blue-8')
    // No handler: the action closes the dialog.
    await userEvent.click(save)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('runs an action handler with a close context', async () => {
    const onClick = vi.fn()
    render(() => (
      <Dialog.Root defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Confirm</Dialog.Title>
          <Dialog.Footer actions={[{ label: 'Save', onClick }]} />
        </Dialog.Content>
      </Dialog.Root>
    ))

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick.mock.calls[0]?.[0]).toHaveProperty('close')
  })

  it('closes on Escape when dismissible and stays otherwise', async () => {
    const onOpenChange = vi.fn()
    const first = render(() => (
      <Dialog.Root defaultOpen onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Title>Close me</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>
    ))
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
    first.unmount()

    const second = render(() => (
      <Dialog.Root defaultOpen dismissible={false} onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Title>Keep me</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>
    ))
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledTimes(1)
    second.unmount()
  })
})

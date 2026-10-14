import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { afterEach, describe, expect, it } from 'vitest'
import { DialogHost, dialog, resetDialogRequests } from './dialog'

afterEach(() => {
  cleanup()
  resetDialogRequests()
})

function mountHost() {
  return render(() => <DialogHost />)
}

describe('dialog.confirm', () => {
  it('renders a modal and resolves true on confirm', async () => {
    mountHost()
    const answer = dialog.confirm({
      title: 'Delete file?',
      message: 'This cannot be undone.',
    })

    const title = await screen.findByText('Delete file?')
    expect(title).toBeInTheDocument()
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()

    // Portalled out of the render container, with the styling hooks.
    const content = document.querySelector('[data-slot="dialog-content"]')
    expect(content).not.toBeNull()
    expect(content?.className).toContain('bg-surface-elevation-1')

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await expect(answer).resolves.toBe(true)
  })

  it('resolves false on cancel', async () => {
    mountHost()
    const answer = dialog.confirm({ title: 'Discard changes?' })

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    await expect(answer).resolves.toBe(false)
  })

  it('resolves false when the returned close handle is used', async () => {
    mountHost()
    const answer = dialog.confirm({ title: 'Close me' })

    await screen.findByText('Close me')
    answer.close()
    await expect(answer).resolves.toBe(false)
  })

  it('honours confirmText and cancelText', async () => {
    mountHost()
    const answer = dialog.confirm({
      title: 'Save?',
      confirmText: 'Save',
      cancelText: 'Nope',
    })

    fireEvent.click(await screen.findByRole('button', { name: 'Save' }))
    await expect(answer).resolves.toBe(true)
    expect(screen.queryByRole('button', { name: 'Nope' })).toBeNull()
  })

  it('falls back to description when message is absent', async () => {
    mountHost()
    const answer = dialog.confirm({
      title: 'Heads up',
      description: 'Body via description',
    })

    expect(await screen.findByText('Body via description')).toBeInTheDocument()
    answer.close()
    await expect(answer).resolves.toBe(false)
  })
})

describe('dialog.danger', () => {
  it('labels the confirm action Delete and resolves true', async () => {
    mountHost()
    const answer = dialog.danger({ title: 'Delete workspace?' })

    const confirm = await screen.findByRole('button', { name: 'Delete' })
    expect(confirm.className).toContain('bg-surface-red-8')
    fireEvent.click(confirm)
    await expect(answer).resolves.toBe(true)
  })
})

describe('dialog.prompt', () => {
  it('resolves with the typed value', async () => {
    mountHost()
    const answer = dialog.prompt({
      title: 'Rename',
      defaultValue: 'old',
    })

    const input = await screen.findByRole('textbox')
    expect(input).toHaveValue('old')

    fireEvent.input(input, { target: { value: 'new name' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await expect(answer).resolves.toBe('new name')
  })

  it('resolves null on cancel', async () => {
    mountHost()
    const answer = dialog.prompt({ title: 'Rename' })

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    await expect(answer).resolves.toBeNull()
  })
})

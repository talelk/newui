import { TextInput } from '@newui/atoms'
import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { CreateDialog } from './CreateDialog'

describe('CreateDialog (example scaffold)', () => {
  it('gates field errors on the first submit attempt', async () => {
    const onSubmit = vi.fn()
    render(() => (
      <CreateDialog
        open
        onOpenChange={() => {}}
        title="Create a thing"
        description="Make a local thing."
        submitLabel="Create thing"
        onSubmit={onSubmit}
        fields={(attempted) => (
          <TextInput
            label="Thing name"
            required
            value=""
            error={attempted() ? 'Enter a name.' : undefined}
          />
        )}
      />
    ))
    expect(screen.queryByText('Enter a name.')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Create thing' }))
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(screen.getByText('Enter a name.')).toBeTruthy()
  })

  it('resets attempted when reopened and closes from Cancel', async () => {
    const [open, setOpen] = createSignal(true)
    render(() => (
      <CreateDialog
        open={open()}
        onOpenChange={setOpen}
        title="Create a thing"
        description="Make a local thing."
        submitLabel="Create thing"
        onSubmit={() => {}}
        fields={(attempted) => (
          <TextInput
            label="Thing name"
            required
            value=""
            error={attempted() ? 'Enter a name.' : undefined}
          />
        )}
      />
    ))
    await userEvent.click(screen.getByRole('button', { name: 'Create thing' }))
    expect(screen.getByText('Enter a name.')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('button', { name: 'Create thing' })).toBeNull()
    setOpen(true)
    expect(screen.queryByText('Enter a name.')).toBeNull()
  })
})

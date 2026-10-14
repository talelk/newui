import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import {
  type KeyboardShortcutEntry,
  KeyboardShortcutsDialog,
} from './KeyboardShortcutsDialog'

const SHORTCUTS: KeyboardShortcutEntry[] = [
  { group: 'General', label: 'Open command palette', combo: 'Mod+K' },
  {
    group: 'General',
    label: 'Show keyboard shortcuts',
    combo: 'Mod+Shift+Slash',
  },
  { group: 'Editing', label: 'Undo', combo: 'Mod+Z' },
  { group: 'Editing', label: 'Redo', combo: 'Mod+Shift+Z' },
]

function Harness(props: {
  shortcuts: KeyboardShortcutEntry[]
  searchThreshold?: number
}) {
  const [open, setOpen] = createSignal(true)
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        reopen
      </button>
      <KeyboardShortcutsDialog
        open={open()}
        onOpenChange={setOpen}
        shortcuts={props.shortcuts}
        searchThreshold={props.searchThreshold}
      />
    </div>
  )
}

describe('<KeyboardShortcutsDialog />', () => {
  it('lists shortcuts under their groups', () => {
    render(() => <KeyboardShortcutsDialog open shortcuts={SHORTCUTS} />)
    expect(screen.getByText('General')).toBeTruthy()
    expect(screen.getByText('Editing')).toBeTruthy()
    expect(screen.getByText('Open command palette')).toBeTruthy()
    expect(screen.getByText('Undo')).toBeTruthy()
    expect(screen.getAllByText('Ctrl').length).toBeGreaterThan(0)
  })

  it('accepts frappe-ui rows that use description', () => {
    render(() => (
      <KeyboardShortcutsDialog
        open
        shortcuts={[{ description: 'Save the page', combo: 'Mod+S' }]}
      />
    ))
    expect(screen.getByText('Save the page')).toBeTruthy()
  })

  it('groups ungrouped rows under General', () => {
    render(() => (
      <KeyboardShortcutsDialog
        open
        shortcuts={[{ label: 'Help', combo: 'Mod+Slash' }]}
      />
    ))
    expect(screen.getByText('General')).toBeTruthy()
    expect(screen.getByText('Help')).toBeTruthy()
  })

  it('hides search until the row count passes the threshold', () => {
    render(() => <KeyboardShortcutsDialog open shortcuts={SHORTCUTS} />)
    expect(
      screen.queryByRole('textbox', { name: 'Search shortcuts' }),
    ).toBeNull()
  })

  it('filters rows and matches the drawn glyph', async () => {
    render(() => (
      <KeyboardShortcutsDialog open shortcuts={SHORTCUTS} searchThreshold={1} />
    ))
    const input = screen.getByRole('textbox', { name: 'Search shortcuts' })

    await userEvent.type(input, 'undo')
    expect(screen.getByText('Undo')).toBeTruthy()
    expect(screen.queryByText('Open command palette')).toBeNull()

    // The row for `Mod+Shift+Slash` draws `Ctrl ⇧ /`.
    await userEvent.clear(input)
    await userEvent.type(input, '/')
    expect(screen.getByText('Show keyboard shortcuts')).toBeTruthy()
  })

  it('shows the no-results message when nothing matches', async () => {
    render(() => (
      <KeyboardShortcutsDialog open shortcuts={SHORTCUTS} searchThreshold={1} />
    ))
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Search shortcuts' }),
      'zzz',
    )
    expect(screen.getByText('No shortcuts match your search.')).toBeTruthy()
  })

  it('shows the empty message when there are no shortcuts', () => {
    render(() => <KeyboardShortcutsDialog open shortcuts={[]} />)
    expect(screen.getByText('No keyboard shortcuts available.')).toBeTruthy()
  })

  it('clears the search when the dialog reopens', async () => {
    render(() => <Harness shortcuts={SHORTCUTS} searchThreshold={1} />)
    const input = screen.getByRole('textbox', { name: 'Search shortcuts' })
    await userEvent.type(input, 'undo')
    expect(screen.queryByText('Open command palette')).toBeNull()

    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: 'reopen' }))

    const reopened = screen.getByRole('textbox', {
      name: 'Search shortcuts',
    }) as HTMLInputElement
    expect(reopened.value).toBe('')
    expect(screen.getByText('Open command palette')).toBeTruthy()
  })

  it('reports a close through onOpenChange', async () => {
    const onOpenChange = vi.fn()
    render(() => (
      <KeyboardShortcutsDialog
        open
        shortcuts={SHORTCUTS}
        onOpenChange={onOpenChange}
      />
    ))
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

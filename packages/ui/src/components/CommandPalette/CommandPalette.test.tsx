import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CommandGroup, CommandItem, CommandPalette } from './CommandPalette'

const noop = () => {}

function palette(
  props: {
    onSelect?: (value: string) => void
    shortcut?: boolean
    defaultOpen?: boolean
  } = {},
) {
  return render(() => (
    <CommandPalette
      defaultOpen={props.defaultOpen ?? true}
      shortcut={props.shortcut}
      label="Commands"
    >
      <CommandGroup label="Pages">
        <CommandItem
          value="intro"
          icon="lucide-house"
          onSelect={props.onSelect}
        >
          Introduction
        </CommandItem>
        <CommandItem
          value="blocks"
          keywords="patterns sections"
          onSelect={props.onSelect}
        >
          Blocks
        </CommandItem>
      </CommandGroup>
      <CommandGroup label="Actions">
        <CommandItem value="theme" shortcut="⌘B" onSelect={props.onSelect}>
          Toggle theme
        </CommandItem>
        <CommandItem value="soon" disabled onSelect={props.onSelect}>
          Coming soon
        </CommandItem>
      </CommandGroup>
    </CommandPalette>
  ))
}

const field = () => screen.getByRole('combobox', { name: 'Commands' })
const options = () => screen.queryAllByRole('option')
const activeId = () => field().getAttribute('aria-activedescendant')

describe('CommandPalette', () => {
  it('renders its groups and items, and focuses the field', () => {
    palette()
    expect(screen.getByRole('listbox', { name: 'Commands' })).toBeTruthy()
    expect(screen.getByText('Pages')).toBeTruthy()
    expect(screen.getByText('Actions')).toBeTruthy()
    expect(options()).toHaveLength(4)
    expect(document.activeElement).toBe(field())
  })

  it('highlights the first usable item, not the first item', () => {
    palette()
    // `soon` is last and disabled; the first item is the one highlighted.
    expect(activeId()).toBe(options()[0]?.id)
    expect(options()[0]?.getAttribute('aria-selected')).toBe('true')
  })

  it('narrows the list as you type, across every group', async () => {
    palette()
    await userEvent.type(field(), 'toggle')

    expect(options()).toHaveLength(1)
    expect(options()[0]?.textContent).toContain('Toggle theme')
    // While searching, the heading is noise: relevance is the order.
    expect(screen.queryByText('Pages')).toBeNull()
  })

  it('matches a keyword the label does not contain', async () => {
    palette()
    await userEvent.type(field(), 'patterns')
    expect(screen.getByText('Blocks')).toBeTruthy()
  })

  it('drops the heading while filtering and restores it when cleared', async () => {
    palette()
    await userEvent.type(field(), 'toggle')
    expect(screen.queryByText('Actions')).toBeNull()

    await userEvent.clear(field())
    expect(screen.getByText('Actions')).toBeTruthy()
  })

  it('says so when nothing matches', async () => {
    palette()
    await userEvent.type(field(), 'zzzz')
    expect(options()).toHaveLength(0)
    expect(screen.getByText('Nothing matches.')).toBeTruthy()
  })

  it('moves the highlight with the arrows, stepping over disabled items', async () => {
    palette()
    const items = options()

    await userEvent.keyboard('{ArrowDown}')
    expect(activeId()).toBe(items[1]?.id)
    await userEvent.keyboard('{ArrowDown}')
    expect(activeId()).toBe(items[2]?.id)
    // The disabled item is skipped rather than landed on.
    await userEvent.keyboard('{ArrowDown}')
    expect(activeId()).toBe(items[0]?.id)
    await userEvent.keyboard('{ArrowUp}')
    expect(activeId()).toBe(items[2]?.id)
  })

  it('selects the highlighted item on Enter and closes', async () => {
    const onSelect = vi.fn()
    palette({ onSelect })

    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')

    expect(onSelect).toHaveBeenCalledWith('blocks')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('selects on click, and re-points the highlight on hover', async () => {
    const onSelect = vi.fn()
    palette({ onSelect })

    const items = options()
    await userEvent.hover(items[2] as HTMLElement)
    expect(activeId()).toBe(items[2]?.id)
    await userEvent.click(items[2] as HTMLElement)
    expect(onSelect).toHaveBeenCalledWith('theme')
  })

  it('does nothing on a disabled item', async () => {
    const onSelect = vi.fn()
    palette({ onSelect })
    await userEvent.click(screen.getByText('Coming soon'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('closes on Escape', async () => {
    palette()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('opens on ⌘K, and again after a close', async () => {
    palette({ defaultOpen: false, onSelect: noop })
    expect(screen.queryByRole('listbox')).toBeNull()

    await userEvent.keyboard('{Meta>}k{/Meta}')
    expect(screen.getByRole('listbox', { name: 'Commands' })).toBeTruthy()

    await userEvent.keyboard('{Escape}')
    await userEvent.keyboard('{Meta>}k{/Meta}')
    expect(screen.getByRole('listbox', { name: 'Commands' })).toBeTruthy()
  })

  it('starts a fresh search each time it opens', async () => {
    palette()
    await userEvent.type(field(), 'toggle')
    await userEvent.keyboard('{Escape}')
    await userEvent.keyboard('{Meta>}k{/Meta}')

    expect((field() as HTMLInputElement).value).toBe('')
    expect(options()).toHaveLength(4)
  })

  it('leaves ⌘K to the app when the shortcut is off', async () => {
    palette({ defaultOpen: false, shortcut: false })
    await userEvent.keyboard('{Meta>}k{/Meta}')
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

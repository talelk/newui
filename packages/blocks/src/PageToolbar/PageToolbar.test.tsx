import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PageToolbar } from './PageToolbar'

describe('PageToolbar', () => {
  it('renders the title and the primary action', () => {
    render(() => <PageToolbar title="Tickets" action={{ label: 'Add new' }} />)
    expect(screen.getByText('Tickets')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Add new/ })).toBeTruthy()
  })

  it('calls the primary action', async () => {
    const onClick = vi.fn()
    render(() => (
      <PageToolbar title="Tickets" action={{ label: 'Add new', onClick }} />
    ))
    await userEvent.click(screen.getByRole('button', { name: /Add new/ }))
    expect(onClick).toHaveBeenCalled()
  })

  it('renders no title menu unless one is given', () => {
    const { container } = render(() => <PageToolbar title="Tickets" />)
    expect(container.querySelector('[data-slot="menu-trigger"]')).toBeNull()
  })

  it('opens the title menu and runs the chosen entry', async () => {
    const onArchive = vi.fn()
    render(() => (
      <PageToolbar
        title="Tickets"
        menu={[{ label: 'Archive', onClick: onArchive }]}
      />
    ))

    await userEvent.click(screen.getByRole('button', { name: 'Page actions' }))
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /Archive/ }),
    )
    expect(onArchive).toHaveBeenCalled()
  })
})

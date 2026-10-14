import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FilterBar } from './FilterBar'

describe('FilterBar', () => {
  it('renders a labelled search box', () => {
    render(() => <FilterBar query={{ placeholder: 'Search files' }} />)
    expect(screen.getByLabelText('Search files')).toBeTruthy()
  })

  it('reports typing', async () => {
    const onInput = vi.fn()
    render(() => <FilterBar query={{ placeholder: 'Search', onInput }} />)
    await userEvent.type(screen.getByLabelText('Search'), 'inv')
    expect(onInput).toHaveBeenLastCalledWith('inv')
  })

  it('gives every select an accessible name from its label', () => {
    render(() => (
      <FilterBar
        selects={[
          {
            label: 'Owner',
            options: [{ label: 'Anyone', value: 'any' }],
          },
        ]}
      />
    ))
    expect(screen.getByLabelText('Owner')).toBeTruthy()
  })

  it('reports a select change', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <FilterBar
        selects={[
          {
            label: 'Owner',
            value: 'any',
            onValueChange,
            options: [
              { label: 'Anyone', value: 'any' },
              { label: 'Me', value: 'me' },
            ],
          },
        ]}
      />
    ))

    await userEvent.click(screen.getByLabelText('Owner'))
    await userEvent.click(await screen.findByRole('option', { name: 'Me' }))
    expect(onValueChange).toHaveBeenCalledWith('me')
  })

  it('renders no view switcher unless one is given', () => {
    const { container } = render(() => <FilterBar />)
    expect(container.querySelector('[data-slot="tab-trigger"]')).toBeNull()
  })

  it('renders and reports the view switcher', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <FilterBar
        tabs={{
          value: 'list',
          onValueChange,
          options: [
            { label: 'List', value: 'list' },
            { label: 'Board', value: 'board' },
          ],
        }}
      />
    ))

    await userEvent.click(screen.getByRole('tab', { name: 'Board' }))
    expect(onValueChange).toHaveBeenCalledWith('board')
  })
})

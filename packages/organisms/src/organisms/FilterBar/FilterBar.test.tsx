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

  it('puts the controls on one surface', () => {
    const { container } = render(() => (
      <FilterBar query={{ placeholder: 'Search' }} />
    ))
    const bar = container.querySelector('[data-slot="filter-bar"]')
    expect(bar?.className).toContain('bg-surface-elevation-1')
    expect(bar?.className).toContain('border-outline-gray-1')
  })

  it('focuses the search box on / and ignores / while editing elsewhere', async () => {
    render(() => (
      <>
        <input aria-label="Other field" />
        <FilterBar query={{ placeholder: 'Search tickets' }} />
      </>
    ))
    const search = screen.getByLabelText('Search tickets')
    await userEvent.keyboard('/')
    expect(document.activeElement).toBe(search)

    const other = screen.getByLabelText('Other field')
    other.focus()
    await userEvent.keyboard('/')
    expect(document.activeElement).toBe(other)
  })

  it('states the result count, singular and plural', () => {
    const one = render(() => <FilterBar resultCount={1} />)
    expect(screen.getByText('1 result')).toBeTruthy()
    one.unmount()
    render(() => <FilterBar resultCount={24} />)
    expect(screen.getByText('24 results')).toBeTruthy()
  })

  it('renders chips and removes one by its labelled button', async () => {
    const onRemove = vi.fn()
    render(() => <FilterBar chips={[{ label: 'Status: Open', onRemove }]} />)
    expect(screen.getByText(/Status: Open/)).toBeTruthy()
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove filter: Status: Open' }),
    )
    expect(onRemove).toHaveBeenCalled()
  })

  it('renders a chip without onRemove as a plain pill', () => {
    render(() => <FilterBar chips={[{ label: 'Region: Europe' }]} />)
    expect(screen.getByText('Region: Europe')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Remove filter/ })).toBeNull()
  })

  it('shows Clear all only while a filter is active, and reports it', async () => {
    const onClearAll = vi.fn()
    const idle = render(() => <FilterBar onClearAll={onClearAll} />)
    expect(screen.queryByRole('button', { name: 'Clear all' })).toBeNull()
    idle.unmount()

    render(() => (
      <FilterBar
        onClearAll={onClearAll}
        selects={[
          {
            label: 'Owner',
            value: 'me',
            options: [{ label: 'Me', value: 'me' }],
          },
        ]}
      />
    ))
    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(onClearAll).toHaveBeenCalled()
  })

  it('renders and reports the view switcher', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <FilterBar
        tabs={{
          label: 'View',
          value: 'list',
          onValueChange,
          options: [
            { label: 'List', value: 'list' },
            { label: 'Board', value: 'board' },
          ],
        }}
      />
    ))

    await userEvent.click(screen.getByRole('radio', { name: 'Board' }))
    expect(onValueChange).toHaveBeenCalledWith('board')
  })
})

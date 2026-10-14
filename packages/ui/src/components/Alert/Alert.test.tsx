import { render } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Alert } from './Alert'

describe('Alert', () => {
  it('uses a neutral container and stays a status for non-danger themes', () => {
    const { getByRole } = render(() => <Alert theme="green" title="Saved" />)
    const el = getByRole('status')
    expect(el.className).toContain('bg-surface-gray-1')
  })

  it('becomes an assertive alert for the red theme', () => {
    const { getByRole } = render(() => <Alert theme="red" title="Failed" />)
    expect(getByRole('alert')).toBeTruthy()
  })

  it('stacks into a banner when a description is present', () => {
    const { container } = render(() => (
      <Alert title="Heads up" description="Something to read" />
    ))
    expect(container.querySelector('[data-slot="alert"]')?.className).toContain(
      'items-start',
    )
  })

  it('fires onDismiss from the × control', async () => {
    const onDismiss = vi.fn()
    const { getByRole } = render(() => (
      <Alert title="Saved" dismissible onDismiss={onDismiss} />
    ))
    await userEvent.click(getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalled()
  })

  it('renders an action button', async () => {
    const onClick = vi.fn()
    const { getByRole } = render(() => (
      <Alert
        theme="amber"
        title="Unsaved"
        action={{ label: 'Retry', onClick }}
      />
    ))
    await userEvent.click(getByRole('button', { name: 'Retry' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('renders a primary action with a dismiss context', async () => {
    const onDismiss = vi.fn()
    const onClick = vi.fn()
    const { getByRole } = render(() => (
      <Alert
        title="Saved"
        primaryAction={{ label: 'Undo', onClick }}
        onDismiss={onDismiss}
      />
    ))
    await userEvent.click(getByRole('button', { name: 'Undo' }))
    expect(onClick).toHaveBeenCalledWith({ dismiss: expect.any(Function) })
    onClick.mock.calls[0]?.[0]?.dismiss()
    expect(onDismiss).toHaveBeenCalled()
  })

  it('forces the banner layout when a secondary action is present', () => {
    const { container, getByRole } = render(() => (
      <Alert
        title="Delete?"
        primaryAction={{ label: 'Delete' }}
        secondaryAction={{ label: 'Cancel' }}
      />
    ))
    expect(container.querySelector('[data-slot="alert"]')?.className).toContain(
      'items-start',
    )
    expect(getByRole('button', { name: 'Delete' })).toBeTruthy()
    expect(getByRole('button', { name: 'Cancel' })).toBeTruthy()
  })

  it('prefers primaryAction over the action alias', () => {
    const { queryByRole, getByRole } = render(() => (
      <Alert
        title="Saved"
        action={{ label: 'Legacy' }}
        primaryAction={{ label: 'Primary' }}
      />
    ))
    expect(getByRole('button', { name: 'Primary' })).toBeTruthy()
    expect(queryByRole('button', { name: 'Legacy' })).toBeNull()
  })
})

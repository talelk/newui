import { render } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Divider } from './Divider'

describe('Divider', () => {
  it('renders a bare rule without a label or action', () => {
    const { container } = render(() => <Divider />)
    expect(container.querySelector('hr')).toBeTruthy()
    expect(
      container.querySelector('[data-slot="divider-action-line"]'),
    ).toBeNull()
  })

  it('renders an action button on the rule', async () => {
    const onClick = vi.fn()
    const { getByRole } = render(() => (
      <Divider action={{ label: 'Show more', onClick }} />
    ))
    await userEvent.click(getByRole('button', { name: 'Show more' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('keeps the label rendering when no action is given', () => {
    const { container } = render(() => <Divider label="or" />)
    expect(container.querySelectorAll('hr')).toHaveLength(2)
    expect(container.textContent).toContain('or')
  })
})

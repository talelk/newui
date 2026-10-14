import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Tooltip } from './Tooltip'

// Portal content renders into <body>, outside the render container, so it is
// queried through `screen` (body-scoped) rather than the render result.
describe('Tooltip', () => {
  it('renders a real button trigger carrying the ARIA link', async () => {
    render(() => (
      <Tooltip text="Delete forever" defaultOpen>
        Delete
      </Tooltip>
    ))

    const trigger = screen.getByRole('button', { name: 'Delete' })
    // The describedby must sit on the focusable element, not a wrapper.
    expect(trigger.getAttribute('aria-describedby')).toBeTruthy()
    expect((await screen.findByRole('tooltip')).textContent).toContain(
      'Delete forever',
    )
  })

  it('does not render content while closed', () => {
    render(() => <Tooltip text="Hidden">Hover</Tooltip>)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})

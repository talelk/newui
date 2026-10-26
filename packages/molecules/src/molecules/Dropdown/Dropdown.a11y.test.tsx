import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Dropdown } from './Dropdown'

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
}

function summarize(results: AxeResults) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))
}

const OPTIONS = [
  { label: 'Edit', value: 'edit', icon: 'lucide-pencil' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'Delete', value: 'delete', danger: true, disabled: true },
]

describe('Dropdown accessibility', () => {
  it('has no axe violations when the menu is open', async () => {
    render(() => <Dropdown options={OPTIONS}>Actions</Dropdown>)

    await userEvent.click(screen.getByRole('button', { name: /Actions/ }))
    expect(await screen.findByRole('menu')).toBeTruthy()
    expect(screen.getAllByRole('menuitem')).toHaveLength(3)
    expect(summarize(await axe.run(document.body, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations when the menu is closed', async () => {
    const { container } = render(() => (
      <Dropdown options={OPTIONS}>Actions</Dropdown>
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})

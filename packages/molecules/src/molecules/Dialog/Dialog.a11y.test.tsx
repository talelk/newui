import { render, screen } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Dialog } from './Dialog'

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

describe('Dialog accessibility', () => {
  it('has no axe violations for an open dialog', async () => {
    render(() => (
      <Dialog.Root defaultOpen>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header icon="lucide-triangle-alert" theme="red">
            <Dialog.Title>Delete invoice</Dialog.Title>
            <Dialog.Description>
              This permanently removes the invoice from the ledger.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer
            actions={[{ label: 'Cancel' }, { label: 'Delete', theme: 'red' }]}
          />
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
    ))

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(summarize(await axe.run(document.body, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a closed dialog', async () => {
    const { container } = render(() => (
      <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Hello</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})

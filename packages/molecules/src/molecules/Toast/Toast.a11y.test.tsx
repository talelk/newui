import { render, screen } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { afterEach, describe, expect, it } from 'vitest'
import { createToaster, ToastRegion, toaster } from './Toast'

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

// Long duration so axe sees the toast before it auto-dismisses.
const NEVER = { duration: 60_000 }

afterEach(() => toaster.remove())

describe('Toast accessibility', () => {
  it('has no axe violations for a success toast with a dismiss control', async () => {
    const activeToaster = createToaster(NEVER)
    render(() => <ToastRegion toaster={activeToaster} />)
    activeToaster.success({ title: 'Saved', description: 'All changes stored' })

    expect(await screen.findByRole('status')).toBeTruthy()
    expect(summarize(await axe.run(document.body, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for an error toast', async () => {
    const activeToaster = createToaster(NEVER)
    render(() => <ToastRegion toaster={activeToaster} />)
    activeToaster.error({ title: 'Failed to save' })

    expect(await screen.findByRole('status')).toBeTruthy()
    expect(summarize(await axe.run(document.body, AXE_OPTIONS))).toEqual([])
  })
})

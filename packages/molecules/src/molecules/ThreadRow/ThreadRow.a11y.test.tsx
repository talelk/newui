import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { ThreadRow } from './ThreadRow'

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

describe('ThreadRow accessibility', () => {
  it('has no axe violations for a plain thread list', async () => {
    const { container } = render(() => (
      <ul aria-label="Announcements">
        <ThreadRow
          role="listitem"
          title="Renewal pricing for Q1"
          snippet="Procurement signed off"
          meta="12 replies"
          time="2h"
        />
        <ThreadRow
          role="listitem"
          title="Office move"
          unread
          meta="3 replies"
          time="1d"
        />
      </ul>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a selected, disabled row with actions', async () => {
    const { container } = render(() => (
      <ul aria-label="Announcements">
        <ThreadRow
          role="listitem"
          title="Renewal pricing for Q1"
          selected
          suffix={
            <button type="button" aria-label="Follow thread">
              Follow
            </button>
          }
        />
        <ThreadRow role="listitem" title="Locked thread" disabled />
      </ul>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})

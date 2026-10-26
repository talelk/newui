import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { NotificationItem } from './NotificationItem'

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

describe('NotificationItem accessibility', () => {
  it('has no axe violations for a plain notification feed', async () => {
    const { container } = render(() => (
      <ul aria-label="Notifications">
        <NotificationItem
          role="listitem"
          title="Contract approved"
          description="Acme · Master services agreement"
          time="5m"
        />
        <NotificationItem
          role="listitem"
          title="Mentioned in Discussions"
          description="Rhea Kapoor"
          unread
          time="2m"
        />
      </ul>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a selected, disabled row with actions', async () => {
    const { container } = render(() => (
      <ul aria-label="Notifications">
        <NotificationItem
          role="listitem"
          title="Contract approved"
          selected
          suffix={
            <button type="button" aria-label="Mark contract approval read">
              Mark read
            </button>
          }
        />
        <NotificationItem role="listitem" title="Archived alert" disabled />
      </ul>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})

import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { MessageListItem } from './MessageListItem'

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

describe('MessageListItem accessibility', () => {
  it('has no axe violations for a plain mailbox list', async () => {
    const { container } = render(() => (
      <ul aria-label="Inbox">
        <MessageListItem
          role="listitem"
          sender="Ana Costa"
          subject="Invoice 4821"
          snippet="Added the late fee line"
          time="14:32"
        />
        <MessageListItem
          role="listitem"
          sender="Sam Rivera"
          subject="Q4 numbers"
          unread
          time="12:02"
        />
      </ul>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a selected, disabled row with actions', async () => {
    const { container } = render(() => (
      <ul aria-label="Inbox">
        <MessageListItem
          role="listitem"
          sender="Ana Costa"
          subject="Invoice 4821"
          selected
          suffix={
            <button type="button" aria-label="Star Invoice 4821">
              Star
            </button>
          }
        />
        <MessageListItem
          role="listitem"
          sender="Locked bot"
          subject="Automated digest"
          disabled
        />
      </ul>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})

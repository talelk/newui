import { describe, expect, it } from 'vitest'
import { filterMail, initialMail, patchMail } from './mail-data'

describe('local mail workflow', () => {
  it('combines folders, categories, search and unread state', () => {
    expect(
      filterMail(initialMail, 'Inbox', 'invoice', true, 'Transactions').map(
        (message) => message.id,
      ),
    ).toEqual(['MAIL-2'])
    expect(
      filterMail(initialMail, 'Inbox', 'invoice', true, 'Updates'),
    ).toEqual([])
    expect(
      filterMail(initialMail, 'Starred', '', false, 'All categories').map(
        (message) => message.id,
      ),
    ).toEqual(['MAIL-1', 'MAIL-5'])
  })
  it('moves only selected messages and preserves an immutable undo snapshot', () => {
    const moved = patchMail(initialMail, ['MAIL-1'], { folder: 'Archive' })
    expect(
      filterMail(moved, 'Archive', '', false, 'All categories'),
    ).toHaveLength(1)
    expect(initialMail[0]?.folder).toBe('Inbox')
    expect(moved[1]).toBe(initialMail[1])
  })
})

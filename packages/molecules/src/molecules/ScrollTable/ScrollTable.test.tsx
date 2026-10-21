import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ScrollTable, ScrollTableHead } from './ScrollTable'

describe('ScrollTable', () => {
  it('is a labelled, focusable scroll region', () => {
    const { container } = render(() => (
      <ScrollTable label="Deals table">
        <table>
          <ScrollTableHead>
            <tr>
              <th>Name</th>
            </tr>
          </ScrollTableHead>
        </table>
      </ScrollTable>
    ))
    const region = container.querySelector(
      'section[data-slot="scroll-table"]',
    ) as HTMLElement
    expect(region.getAttribute('aria-label')).toBe('Deals table')
    // Keyboard users must be able to reach the far columns: the scroller
    // itself is focusable.
    expect(region.getAttribute('tabindex')).toBe('0')
  })

  it('binds the shared header treatment to the head', () => {
    const { container } = render(() => (
      <ScrollTable label="Deals table">
        <table>
          <ScrollTableHead>
            <tr>
              <th>Name</th>
            </tr>
          </ScrollTableHead>
        </table>
      </ScrollTable>
    ))
    const head = container.querySelector(
      'thead[data-slot="scroll-table-head"]',
    ) as HTMLElement
    expect(head.className).toContain('bg-surface-gray-1')
    expect(head.className).toContain('text-caption')
  })
})

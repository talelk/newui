import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ScrollTable, ScrollTableHead } from './ScrollTable'

function table() {
  return (
    <table>
      <ScrollTableHead>
        <tr>
          <th>Name</th>
        </tr>
      </ScrollTableHead>
      <tbody>
        <tr>
          <td>Globex</td>
        </tr>
      </tbody>
    </table>
  )
}

describe('ScrollTable (browser, real CSS)', () => {
  it('is a real horizontal scroller with rounded corners', () => {
    const { container } = render(() => (
      <ScrollTable label="Deals table">{table()}</ScrollTable>
    ))
    const region = container.querySelector(
      'section[data-slot="scroll-table"]',
    ) as HTMLElement
    const style = getComputedStyle(region)
    // The whole point of the shell: wide content scrolls, it does not
    // overflow the page.
    expect(style.overflowX).toBe('auto')
    expect(Number.parseFloat(style.borderRadius)).toBeGreaterThan(0)
  })

  it('pins the header to the top of the scroll region', () => {
    const { container } = render(() => (
      <ScrollTable label="Deals table" stickyHeader>
        {table()}
      </ScrollTable>
    ))
    const head = container.querySelector(
      'thead[data-slot="scroll-table-head"]',
    ) as HTMLElement
    const style = getComputedStyle(head)
    // The unit test asserts the class string; this asserts the browser
    // actually resolves the arbitrary `[&_thead]:sticky` variant.
    expect(style.position).toBe('sticky')
    expect(style.top).toBe('0px')
    expect(Number.parseInt(style.zIndex, 10)).toBeGreaterThan(0)
  })

  it('paints the shared header treatment', () => {
    const { container } = render(() => (
      <ScrollTable label="Deals table">{table()}</ScrollTable>
    ))
    const head = container.querySelector(
      'thead[data-slot="scroll-table-head"]',
    ) as HTMLElement
    expect(getComputedStyle(head).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})

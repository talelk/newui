import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ItemListRow } from './ItemListRow'

describe('ItemListRow (browser, real CSS)', () => {
  it('grows from sm to lg and keeps horizontal padding', () => {
    const { container, unmount } = render(() => (
      <ItemListRow size="sm">Draft</ItemListRow>
    ))
    const row = container.firstElementChild as HTMLElement
    const small = row.getBoundingClientRect().height
    expect(
      Number.parseFloat(getComputedStyle(row).paddingLeft),
    ).toBeGreaterThan(0)
    unmount()
    const { container: second } = render(() => (
      <ItemListRow size="lg">Draft</ItemListRow>
    ))
    const large = (
      second.firstElementChild as HTMLElement
    ).getBoundingClientRect().height
    expect(large).toBeGreaterThan(small)
  })

  it('paints the active state against the inactive one', () => {
    const { container } = render(() => (
      <div>
        <ItemListRow>Draft</ItemListRow>
        <ItemListRow active>Draft</ItemListRow>
      </div>
    ))
    const [inactive, active] = Array.from(
      container.querySelectorAll('[data-slot="item-list-row"]'),
    )
    expect(getComputedStyle(active as HTMLElement).backgroundColor).not.toBe(
      getComputedStyle(inactive as HTMLElement).backgroundColor,
    )
  })
})

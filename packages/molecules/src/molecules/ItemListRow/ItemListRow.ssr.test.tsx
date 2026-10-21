import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { ItemListRow } from './ItemListRow'

describe('SSR smoke', () => {
  it('ItemListRow renders to a string', () => {
    const html = renderToString(() => (
      <ItemListRow selected size="lg">
        Draft
      </ItemListRow>
    ))
    expect(html).toContain('data-slot="item-list-row"')
    expect(html).toContain('Draft')
    expect(html).toContain('data-state="active"')
  })
})

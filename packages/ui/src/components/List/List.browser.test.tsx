import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { List, ListRow } from './List'

describe('List (browser, real CSS)', () => {
  it('lays rows out on a grid with a real height', () => {
    const { container } = render(() => (
      <List>
        <ListRow>Draft</ListRow>
      </List>
    ))
    const row = container.querySelector('[data-slot="list-row"]') as HTMLElement
    const style = getComputedStyle(row)
    expect(style.display).toBe('grid')
    expect(row.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(style.gridTemplateColumns).not.toBe('none')
  })

  it('paints the active row differently from the resting one', () => {
    const { container } = render(() => (
      <List>
        <ListRow>Draft</ListRow>
        <ListRow active>Draft</ListRow>
      </List>
    ))
    const [inactive, active] = Array.from(
      container.querySelectorAll('[data-slot="list-row"]'),
    )
    expect(getComputedStyle(active as HTMLElement).backgroundColor).not.toBe(
      getComputedStyle(inactive as HTMLElement).backgroundColor,
    )
  })
})

import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { FilterBar } from './FilterBar'

describe('FilterBar (browser, real CSS)', () => {
  it('puts the controls on one painted card surface, or none when bare', () => {
    const card = render(() => <FilterBar query={{ placeholder: 'Search' }} />)
    const bar = card.container.querySelector(
      '[data-slot="filter-bar"]',
    ) as HTMLElement
    const style = getComputedStyle(bar)
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(style.borderTopWidth)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.borderRadius)).toBeGreaterThan(0)
    expect(style.paddingTop).not.toBe('0px')
    card.unmount()

    const bare = render(() => (
      <FilterBar surface="bare" query={{ placeholder: 'Search' }} />
    ))
    const bareBar = bare.container.querySelector(
      '[data-slot="filter-bar"]',
    ) as HTMLElement
    // `bare` is composed into a Section, so it must not paint its own card.
    expect(getComputedStyle(bareBar).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(bareBar).paddingTop).toBe('0px')
  })

  it('paints the / hint on the search box', () => {
    const { container } = render(() => (
      <FilterBar query={{ placeholder: 'Search tickets' }} />
    ))
    const hint = container.querySelector('kbd') as HTMLElement
    expect(hint.getBoundingClientRect().width).toBeGreaterThan(0)
    expect(getComputedStyle(hint).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('states the result count in tabular figures', () => {
    const { container } = render(() => <FilterBar resultCount={24} />)
    const count = container.querySelector(
      '[data-slot="filter-bar-meta"] span',
    ) as HTMLElement
    // `tabular-nums` keeps 24 and 8 aligned as filters change the number.
    expect(getComputedStyle(count).fontVariantNumeric).toContain('tabular-nums')
  })
})

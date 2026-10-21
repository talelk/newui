import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Breadcrumbs } from './Breadcrumbs'

describe('Breadcrumbs (browser, real CSS)', () => {
  it('dims earlier crumbs against the current page', () => {
    const { getByText } = render(() => (
      <Breadcrumbs items={[{ label: 'Home', route: '/' }, { label: 'Docs' }]} />
    ))
    const link = getByText('Home')
    const current = getByText('Docs')
    expect(Number.parseFloat(getComputedStyle(link).fontSize)).toBeGreaterThan(
      0,
    )
    expect(getComputedStyle(link).color).not.toBe(
      getComputedStyle(current).color,
    )
  })
})

import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { Breadcrumbs } from './Breadcrumbs'

describe('SSR smoke', () => {
  it('Breadcrumbs renders to a string', () => {
    const html = renderToString(() => (
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Sales', route: '/sales' },
          { label: 'Invoice' },
        ]}
      />
    ))
    expect(html).toContain('aria-label="Breadcrumb"')
    expect(html).toContain('<ol')
    expect(html).toContain('href="/"')
    expect(html).toContain('href="/sales"')
    expect(html).toContain('aria-current="page"')
    expect(html).toContain('Invoice')
  })
})

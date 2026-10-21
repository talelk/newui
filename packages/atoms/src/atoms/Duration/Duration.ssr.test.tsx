import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { Duration } from './Duration'

describe('SSR smoke', () => {
  it('Duration renders to a string', () => {
    const html = renderToString(() => (
      <Duration label="Duration" value={5445} placeholder="1h 30m 45s" />
    ))
    expect(html).toContain('data-slot="duration"')
    expect(html).toContain('1h 30m 45s')
    expect(html).toContain('Duration')
  })
})

import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { DateRangePicker } from './DateRangePicker'

describe('SSR smoke', () => {
  it('DateRangePicker renders to a string', () => {
    const html = renderToString(() => (
      <DateRangePicker
        label="Range"
        value={['2026-10-14', '2026-10-16']}
        placeholder="Pick a range"
      />
    ))
    expect(html).toContain('value="10/14/2026"')
    expect(html).toContain('value="10/16/2026"')
    expect(html).toContain('Range')
  })
})

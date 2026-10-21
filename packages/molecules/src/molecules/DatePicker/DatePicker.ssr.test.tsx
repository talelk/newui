import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { DatePicker } from './DatePicker'

describe('SSR smoke', () => {
  it('DatePicker renders to a string', () => {
    const html = renderToString(() => (
      <DatePicker label="Date" value="2026-10-14" placeholder="Pick a date" />
    ))
    expect(html).toContain('value="10/14/2026"')
    expect(html).toContain('Date')
  })
})

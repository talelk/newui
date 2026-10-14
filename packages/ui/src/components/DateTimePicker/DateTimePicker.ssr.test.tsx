import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { DateTimePicker } from './DateTimePicker'

describe('SSR smoke', () => {
  it('DateTimePicker renders to a string', () => {
    const html = renderToString(() => (
      <DateTimePicker
        label="When"
        value="2026-10-14T09:30"
        placeholder="Pick a moment"
      />
    ))
    expect(html).toContain('2026')
    expect(html).toContain('When')
  })
})

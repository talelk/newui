import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { TimePicker } from './TimePicker'

describe('SSR smoke', () => {
  it('TimePicker renders to a string', () => {
    const html = renderToString(() => (
      <TimePicker
        label="Time"
        value="09:30"
        interval={30}
        placeholder="Select time"
      />
    ))
    expect(html).toContain('role="combobox"')
    expect(html).toContain('09:30')
    expect(html).toContain('Time')
  })
})

import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { Password } from './Password'

describe('SSR smoke', () => {
  it('Password renders to a string', () => {
    const html = renderToString(() => (
      <Password label="Password" placeholder="••••••••" />
    ))
    expect(html).toContain('type="password"')
    expect(html).toContain('Password')
  })
})

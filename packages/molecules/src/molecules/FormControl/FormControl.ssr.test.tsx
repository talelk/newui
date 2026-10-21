import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { FormControl } from './FormControl'

describe('SSR smoke', () => {
  it('FormControl renders a text field to a string', () => {
    const html = renderToString(() => (
      <FormControl label="Email" type="email" />
    ))
    expect(html).toContain('type="email"')
    expect(html).toContain('Email')
  })

  it('FormControl renders a select to a string', () => {
    const html = renderToString(() => (
      <FormControl
        type="select"
        label="Status"
        options={[{ label: 'Draft', value: 'draft' }]}
      />
    ))
    expect(html).toContain('Status')
  })
})

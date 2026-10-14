import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { Combobox } from './Combobox'

describe('SSR smoke', () => {
  it('Combobox renders to a string', () => {
    const html = renderToString(() => (
      <Combobox
        options={[
          { label: 'Draft', value: 'draft' },
          { label: 'Paid', value: 'paid' },
        ]}
        label="Status"
        placeholder="Pick one"
      />
    ))
    expect(html).toContain('role="combobox"')
    expect(html).toContain('Status')
  })
})

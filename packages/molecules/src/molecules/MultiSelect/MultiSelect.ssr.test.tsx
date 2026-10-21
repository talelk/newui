import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { MultiSelect } from './MultiSelect'

describe('SSR smoke', () => {
  it('MultiSelect renders to a string', () => {
    const html = renderToString(() => (
      <MultiSelect
        options={[
          { label: 'Draft', value: 'draft' },
          { label: 'Paid', value: 'paid' },
        ]}
        label="Status"
        value={['draft']}
      />
    ))
    expect(html).toContain('role="combobox"')
    expect(html).toContain('Draft')
  })
})

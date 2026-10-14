import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { Switch } from '../Switch/Switch'
import { Button } from './Button'

describe('SSR smoke', () => {
  it('Button renders to a string', () => {
    const html = renderToString(() => (
      <Button variant="solid" theme="blue">
        Save
      </Button>
    ))
    expect(html).toContain('Save')
    expect(html).toContain('bg-surface-blue-8')
  })

  it('Switch renders to a string', () => {
    const html = renderToString(() => <Switch label="Notify" defaultChecked />)
    expect(html).toContain('Notify')
    expect(html).toContain('type="checkbox"')
  })
})

import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { BottomSheet } from './BottomSheet'

describe('SSR smoke', () => {
  it('BottomSheet renders its closed state to an empty string', () => {
    const html = renderToString(() => (
      <BottomSheet title="Filters">Body</BottomSheet>
    ))
    expect(html).not.toContain('role="dialog"')
  })
})

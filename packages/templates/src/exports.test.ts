import { describe, expect, it } from 'vitest'
import * as templates from './index'

describe('@talelk/newui-templates', () => {
  it('exports exactly the three supported page templates', () => {
    expect(Object.keys(templates).sort()).toEqual([
      'AppShell',
      'AuthLayout',
      'PaneLayout',
    ])
  })
})

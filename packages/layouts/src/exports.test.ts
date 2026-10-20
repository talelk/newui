/**
 * The page templates' public surface, asserted by name.
 *
 * Two templates is the honest count: a page frame and a split. A third appears
 * here when it is a *template* — an arrangement two applications share — not
 * when a particular screen wants a different shape.
 */
import { describe, expect, it } from 'vitest'
import * as layouts from './index'

const PUBLIC = ['AppLayout', 'PaneLayout']

describe('@newui/layouts', () => {
  it('exports exactly the shipped templates', () => {
    expect(Object.keys(layouts).sort()).toEqual(PUBLIC)
  })
})

/**
 * The public surface, asserted by name. One line per shipped symbol, so an
 * accidental `export *` growth fails here rather than reaching consumers.
 */
import { describe, expect, it } from 'vitest'
import * as codeEditor from './index'

const PUBLIC = ['CodeEditor', 'diffDocument']

describe('public surface', () => {
  it('exports every documented member', () => {
    for (const name of PUBLIC) {
      expect(codeEditor, name).toHaveProperty(name)
    }
  })
})

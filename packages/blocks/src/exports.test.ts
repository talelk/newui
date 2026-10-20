/**
 * The composed layer's public surface, asserted by name.
 *
 * Blocks sit between components and layouts; a block that quietly gains a
 * sub-part (`FilterBarChip`, say) is a block that is becoming a component
 * family, and that decision should be made here rather than discovered by a
 * consumer.
 */
import { describe, expect, it } from 'vitest'
import * as blocks from './index'

const PUBLIC = [
  'AppSidebar',
  'AuthCard',
  'DetailHeader',
  'FilterBar',
  'KanbanBoard',
  'PageToolbar',
  'StatGrid',
  // Documented in `spec/kanban-board.md`: a controlled board that maps its own
  // model needs the placement semantics, not just the gesture.
  'placeKanbanItem',
]

describe('@newui/blocks', () => {
  it('exports exactly the shipped blocks', () => {
    expect(Object.keys(blocks).sort()).toEqual(PUBLIC)
  })

  it('exports components, not recipes or internals', () => {
    for (const [name, value] of Object.entries(blocks)) {
      expect(typeof value, name).toBe('function')
    }
  })
})

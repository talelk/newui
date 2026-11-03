import { describe, expect, it } from 'vitest'
import { button } from './button-recipe'
import {
  type ControlSize,
  controlDensity,
  fieldPads,
  fieldSizes,
  overlayLayers,
  overlayPanel,
  overlayScrim,
} from './control-styles'

const SIZES: ControlSize[] = ['xs', 'sm', 'md', 'lg']

describe('control density', () => {
  // The peer invariant the table exists for: a size name is one box, so a
  // Button and a field at the same size share a height in a form row.
  for (const size of SIZES) {
    it(`${size}: button min-height peers the field height`, () => {
      const step = controlDensity[size].height.replace('h-', '')
      expect(fieldSizes[size]).toContain(`h-${step}`)
      expect(button({ size })).toContain(`min-h-${step}`)
      expect(button({ size, icon: true })).toContain(`h-${step}`)
    })

    it(`${size}: field pads reserve symmetric adornment boxes`, () => {
      const pads = fieldPads[size]
      expect(pads.base).toBe(controlDensity[size].pad)
      // The prefix reservation is the suffix reservation with ps-/pe- swapped.
      const swap = (value: string) =>
        value
          .split(' ')
          .map((token) =>
            token.startsWith('ps-')
              ? `pe-${token.slice(3)}`
              : `ps-${token.slice(3)}`,
          )
          .sort()
          .join(' ')
      expect(swap(pads.prefix)).toBe(pads.suffix.split(' ').sort().join(' '))
    })
  }
})

describe('overlay foundation', () => {
  it('stamps one surface, edge, radius role and motion on both kinds', () => {
    for (const kind of ['modal', 'popup'] as const) {
      const panel = overlayPanel({ kind })
      expect(panel).toContain('bg-surface-elevation-1')
      expect(panel).toContain('border-outline-gray-1')
      expect(panel).toContain('rounded-overlay')
      expect(panel).toContain('animate-overlay-in')
      expect(panel).toContain('motion-reduce:animate-none')
    }
  })

  it('keeps layers on positioners/hosts, never on the panel', () => {
    // Zag's popper hoists the content's computed z-index onto the
    // positioner; a z on the panel would demote a popup below its modal.
    for (const kind of ['modal', 'popup'] as const) {
      expect(overlayPanel({ kind })).not.toMatch(
        /\bz-(floating|overlay|top|raised)\b/,
      )
    }
    expect(overlayPanel({ kind: 'popup' })).toContain('shadow-popover')
    expect(overlayPanel({ kind: 'modal' })).toContain('shadow-dialog')
    // Popups share the modal layer so a popup inside a dialog stacks by
    // portal order (opened later = on top); toast/tooltip sit above.
    expect(overlayLayers.popup).toBe('z-overlay')
    expect(overlayLayers.modal).toBe('z-overlay')
    expect(overlayLayers.toast).toBe('z-top')
    expect(overlayLayers.tooltip).toBe('z-top')
  })

  it('scrim names the mode-flipping var, never a dark: variant', () => {
    expect(overlayScrim).toContain('bg-surface-scrim')
    expect(overlayScrim).not.toContain('dark:')
  })
})

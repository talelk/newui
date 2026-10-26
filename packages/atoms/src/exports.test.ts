/**
 * The public surface, asserted by name. Grows one line per shipped symbol, so
 * an accidental `export *` growth fails here rather than reaching consumers.
 */
import { describe, expect, it } from 'vitest'
import * as atoms from './index'

const PUBLIC = [
  'Avatar',
  'AvatarGroup',
  'Badge',
  'Button',
  'Checkbox',
  'Divider',
  'Duration',
  'ErrorMessage',
  'FormLabel',
  'Heading',
  'Icon',
  'IconButton',
  'Image',
  'KeyboardShortcut',
  'Link',
  'Progress',
  'ProgressCircle',
  'ScrollArea',
  'Skeleton',
  'Slider',
  'Spinner',
  'Switch',
  'Text',
  'TextInput',
  'Textarea',
  'Tooltip',
  'VisuallyHidden',
]

describe('public surface', () => {
  it('exports every documented member', () => {
    for (const name of PUBLIC) {
      expect(atoms, name).toHaveProperty(name)
    }
  })

  it('does not export app-level templates from the atom package', () => {
    for (const legacy of [
      'AppShell',
      'AppLayout',
      'DesktopShell',
      'MobileShell',
      'ResponsiveShell',
      'SidebarRail',
      'SidebarRailItem',
    ]) {
      expect(atoms).not.toHaveProperty(legacy)
    }
  })
})

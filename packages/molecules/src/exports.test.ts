import { describe, expect, it } from 'vitest'
import * as molecules from './index'

const PUBLIC = [
  'Accordion',
  'Alert',
  'BottomSheet',
  'Breadcrumbs',
  'Card',
  'Collapsible',
  'Combobox',
  'ContextMenu',
  'DatePicker',
  'DateRangePicker',
  'DateTimePicker',
  'Dialog',
  'Dropdown',
  'EmptyState',
  'FileUploader',
  'FormControl',
  'HoverCard',
  'ItemListRow',
  'KeyboardShortcutsDialog',
  'List',
  'Menu',
  'MultiSelect',
  'NumberInput',
  'Pagination',
  'Password',
  'Popover',
  'RadioGroup',
  'Rating',
  'Select',
  'ScrollTable',
  'TABLE_HEAD_CLASS',
  'TabButtons',
  'Tabs',
  'TimePicker',
  'Timeline',
  'ToggleGroup',
  'Tree',
]

describe('@newui/molecules', () => {
  it('exports exactly the composed interactions', () => {
    expect(Object.keys(molecules)).toEqual(expect.arrayContaining(PUBLIC))
    for (const legacy of [
      'AppShell',
      'AppLayout',
      'DesktopShell',
      'MobileShell',
      'ResponsiveShell',
      'SidebarRail',
      'SidebarRailItem',
    ]) {
      expect(molecules).not.toHaveProperty(legacy)
    }
  })
})

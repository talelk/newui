import { describe, expect, it } from 'vitest'
import * as molecules from './index'

const PUBLIC = [
  'Accordion',
  'Alert',
  'BottomSheet',
  'Breadcrumbs',
  'Calendar',
  'Card',
  'Carousel',
  'Collapsible',
  'ColorPicker',
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
  'PinInput',
  'Popover',
  'RadioGroup',
  'Rating',
  'Select',
  'ScrollTable',
  'ScrollTableHead',
  'Table',
  'TableBody',
  'TableCell',
  'TableColumnHeader',
  'TableHead',
  'TableRow',
  'TabButtons',
  'Stepper',
  'Tabs',
  'TagInput',
  'TimePicker',
  'Timeline',
  'TimeRangePicker',
  'Toaster',
  'ToastRegion',
  'ToggleGroup',
  'TransferList',
  'Tree',
  'createToaster',
  'toast',
  'toaster',
]

describe('@talelk/newui-molecules', () => {
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

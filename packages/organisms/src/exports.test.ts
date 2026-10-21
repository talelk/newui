import { describe, expect, it } from 'vitest'
import * as organisms from './index'

const PUBLIC = [
  'AppSidebar',
  'AuthCard',
  'CommandPalette',
  'DataTable',
  'DetailHeader',
  'FilterBar',
  'KanbanBoard',
  'MobileNav',
  'PageToolbar',
  'SettingsDialog',
  'Sidebar',
  'StatGrid',
  'VirtualList',
  'placeKanbanItem',
]

describe('@talelk/newui-organisms', () => {
  it('exports exactly the page-region APIs', () => {
    expect(Object.keys(organisms)).toEqual(expect.arrayContaining(PUBLIC))
    expect(Object.keys(organisms)).not.toContain('SidebarRail')
    expect(Object.keys(organisms)).not.toContain('SidebarRailItem')
  })
})

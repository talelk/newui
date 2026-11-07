// What a page without a table imports (the Discussions route's set): the
// organisms barrel must tree-shake DataTable, its column operations and its
// virtualiser out of it.
export {
  DataState,
  FilterBar,
  PageToolbar,
  SidebarItem,
} from '../../packages/organisms/src/index'

/**
 * The blocks barrel, for the size budget.
 *
 * Relative imports, like the other fixtures: the root has no dependency on the
 * workspace packages, and a fixture is not a place to add one.
 */
export {
  AppSidebar,
  AuthCard,
  DetailHeader,
  FilterBar,
  KanbanBoard,
  PageToolbar,
  StatGrid,
} from '../../packages/blocks/src/index'
export { Button, TextInput } from '../../packages/ui/src/index'

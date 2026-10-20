/**
 * The query surface of the logic layer, for the size budget.
 *
 * TanStack Query is the one large dependency the data package owns; the budget
 * is the assertion that it arrives alone — no component, no chart, no editor.
 */

export type { Repository } from '../../packages/data/src/query/index'
export {
  createCollection,
  createDataClient,
  createListQuery,
  DataProvider,
} from '../../packages/data/src/query/index'

/**
 * The Frappe resource client, for the size budget.
 *
 * App-specific cost (fetch + IndexedDB + realtime) must stay behind its
 * earned subpath and out of every visual barrel.
 */
export {
  createListResource,
  createResource,
  useDoc,
  useDoctype,
  useList,
  useNewDoc,
} from '../../packages/data/src/resource/index'

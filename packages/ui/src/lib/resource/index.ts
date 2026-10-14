/**
 * The signal-based data layer: a configurable request client, generic
 * resources, and the thin composables over them.
 *
 * Ported from frappe-ui's `resources/` + `data-fetching/`, translated to Solid
 * signals. No Vue `ref`/`reactive`, no `v-model` — every value is an accessor
 * (`() => T`) and every action a plain function.
 */

export type {
  ClientConfig,
  RequestErrorOptions,
  RequestOptions,
} from './client'
export {
  getConfig,
  isAbortError,
  normalizeError,
  RequestError,
  request,
  resetConfig,
  setConfig,
} from './client'
export type {
  DocumentOperationOptions,
  DocumentResource,
  DocumentResourceOptions,
} from './document'
export { createDocumentResource } from './document'
export type { IdbStore, IdbStoreOptions } from './idb'
export { createIdbStore } from './idb'
export type {
  ListFilters,
  ListResource,
  ListResourceOptions,
} from './list'
export { createListResource } from './list'
export type { LocalStore, LocalStoreOptions } from './local'
export { createLocalStore } from './local'
export type {
  Realtime,
  RealtimeEventMap,
  RealtimeListener,
  RealtimeOptions,
  RealtimeSocket,
  RealtimeSocketFactory,
} from './realtime'
export { createRealtime } from './realtime'
export type {
  Resource,
  ResourceFetcher,
  ResourceOptions,
} from './resource'
export { createResource } from './resource'
export type { UseCallOptions, UseCallReturn } from './useCall'
export { useCall } from './useCall'
export type { UseDocOptions, UseDocReturn } from './useDoc'
export { useDoc } from './useDoc'
export type {
  DoctypeAction,
  RunDocMethodInput,
  RunMethodInput,
  UseDoctypeOptions,
  UseDoctypeReturn,
} from './useDoctype'
export { useDoctype } from './useDoctype'
export type { UseListOptions, UseListReturn } from './useList'
export { useList } from './useList'
export type { UseNewDocOptions, UseNewDocReturn } from './useNewDoc'
export { useNewDoc } from './useNewDoc'

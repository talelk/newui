import { createUniqueId } from 'solid-js'

/** SSR-safe id. Call within a component/reactive root. */
export function createId(prefix = 'newui'): string {
  return `${prefix}-${createUniqueId()}`
}

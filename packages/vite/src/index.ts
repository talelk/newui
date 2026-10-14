/**
 * `@newui/vite` — the Vite plugin for newui apps.
 *
 * Three concerns, each also exported on its own:
 *
 * 1. {@link frappeProxy} — proxy `/api` (and friends) to a Frappe backend.
 * 2. {@link lucideIcons} — optional `~icons/lucide/*` + bare-tag auto-import.
 * 3. {@link doctypeTypes} / {@link generateDocTypes} — typed DocTypes.
 *
 *   import { newuiVite } from '@newui/vite'
 *   export default defineConfig({ plugins: [newuiVite(), solid()] })
 */
import type { Plugin } from 'vite'
import { doctypeTypes } from './doctype'
import { lucideIcons } from './lucide'
import { type NewuiViteOptions, normalizeOptions } from './options'
import { frappeProxy } from './proxy'

/** Build the enabled sub-plugins from {@link NewuiViteOptions}. */
export function newuiVite(options: NewuiViteOptions = {}): Plugin[] {
  const normalized = normalizeOptions(options)
  const plugins: Plugin[] = []

  if (normalized.frappeProxy) plugins.push(frappeProxy(normalized.frappeProxy))
  if (normalized.lucideIcons) plugins.push(lucideIcons(normalized.lucideIcons))
  if (normalized.doctypeTypes) {
    plugins.push(doctypeTypes(normalized.doctypeTypes))
  }

  return plugins
}

export {
  type DocTypeField,
  type DocTypeMeta,
  doctypeTypes,
  type GenerateDocTypesOptions,
  type GenerateDocTypesResult,
  generateDocTypes,
} from './doctype'
export { type LucideIconsOptions, lucideIcons } from './lucide'
export {
  type NewuiViteOptions,
  type NormalizedViteOptions,
  normalizeOptions,
} from './options'
export { type FrappeProxyOptions, frappeProxy, type ProxyConfig } from './proxy'

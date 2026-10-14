/**
 * Option normalisation: turn the terse `newuiVite()` options into one resolved
 * shape per sub-plugin. Pure, so it is tested without a Vite server.
 */
import type { GenerateDocTypesOptions } from './doctype'
import type { LucideIconsOptions } from './lucide'
import type { FrappeProxyOptions } from './proxy'

/** Top-level options for {@link newuiVite}. */
export interface NewuiViteOptions {
  /**
   * Dev-server proxy to a Frappe backend.
   * @default true
   */
  frappeProxy?: boolean | FrappeProxyOptions
  /**
   * Lucide icon auto-import (`~icons/lucide/*` and bare `<LucideName />`).
   * Off by default: newui's own components use `lucide-*` class strings drawn
   * by the Tailwind plugin, which need no Vite support.
   * @default false
   */
  lucideIcons?: boolean | LucideIconsOptions
  /**
   * DocType TypeScript generation. Needs a `doctypes` list, so `true` is not
   * accepted — pass an options object or leave it off.
   * @default false
   */
  doctypeTypes?: GenerateDocTypesOptions | false
}

/** Every option resolved to a concrete object or `false` (disabled). */
export interface NormalizedViteOptions {
  frappeProxy: FrappeProxyOptions | false
  lucideIcons: LucideIconsOptions | false
  doctypeTypes: GenerateDocTypesOptions | false
}

/** Resolve `newuiVite()` options to one concrete shape. */
export function normalizeOptions(
  options: NewuiViteOptions = {},
): NormalizedViteOptions {
  return {
    frappeProxy: expand(options.frappeProxy ?? true),
    lucideIcons: expand(options.lucideIcons ?? false),
    doctypeTypes: options.doctypeTypes ?? false,
  }
}

function expand<T extends object>(value: boolean | T): T | false {
  if (value === false) return false
  if (value === true) return {} as T
  return value
}

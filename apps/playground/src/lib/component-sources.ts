/**
 * The lazy data sources behind a component's reference page, globbed in `.ts`
 * rather than where they are consumed.
 *
 * Vite 8's dependency scan rewrites any file containing `import.meta.glob` as
 * `moduleType: js` before parsing it, so JSX in a `.tsx` glob host crashes the
 * scan ("JSX syntax is disabled") and pre-bundling is skipped wholesale. A
 * `source-globs.test.ts` guard keeps the invariant from the other side.
 */

export interface ApiMember {
  name: string
  type: string
  optional: boolean
  description?: string
  default?: string
}

/**
 * Prop tables load per component. The glob is inside the app root, so it needs
 * no `fs.allow` and Vite gives each slice its own chunk — a component page
 * fetches ~1 kB of tables rather than the 111 kB `api.json`.
 */
export const API_SLICES = import.meta.glob<{
  API: Record<string, ApiMember[]>
}>('../generated/api/*.ts')

export const DEMO_SOURCES = import.meta.glob<{ default: string }>(
  '../demos/*.tsx',
  {
    query: '?raw',
  },
)

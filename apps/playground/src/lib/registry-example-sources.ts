/**
 * Raw source text for the registry example pages — stories and patterns both.
 *
 * Globbed in a `.ts` module — a `.tsx` file hosting `import.meta.glob` breaks
 * Vite 8's dependency scan (see `component-sources.ts` and the guard test).
 */
export const REGISTRY_EXAMPLE_SOURCES = import.meta.glob<string>(
  ['../stories/*.stories.tsx', '../patterns/*.tsx'],
  { query: '?raw', import: 'default' },
)

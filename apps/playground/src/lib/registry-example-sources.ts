/**
 * Raw source text for the registry example pages — demos and patterns both.
 *
 * Globbed in a `.ts` module — a `.tsx` file hosting `import.meta.glob` breaks
 * Vite 8's dependency scan (see `component-sources.ts` and the guard test).
 */
export const registryExampleSources = import.meta.glob<string>(
  ['../demos/*.tsx', '../patterns/*.tsx'],
  { query: '?raw', import: 'default' },
)

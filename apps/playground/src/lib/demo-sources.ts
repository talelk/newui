/**
 * Raw source text for every demo, for the "show the code" surfaces.
 *
 * Globbed in a `.ts` module — a `.tsx` file hosting `import.meta.glob` breaks
 * Vite 8's dependency scan (see `component-sources.ts` and the guard test).
 */
export const demoSources = import.meta.glob<string>('../demos/*.tsx', {
  query: '?raw',
  import: 'default',
})

/**
 * Package READMEs, loaded on demand for the package guides — never copied
 * into generated data.
 *
 * Globbed in a `.ts` module — a `.tsx` file hosting `import.meta.glob` breaks
 * Vite 8's dependency scan (see `component-sources.ts` and the guard test).
 */
export const packageGuideSources = import.meta.glob<string>(
  '../../../../packages/*/README.md',
  { query: '?raw', import: 'default' },
)

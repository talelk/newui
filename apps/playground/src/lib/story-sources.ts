/**
 * Raw source text for every story, for the "show the code" surfaces.
 *
 * The source of a demo is the story file that renders it: one file per
 * component, `Demo` for the site and stories for Storybook.
 *
 * Globbed in a `.ts` module — a `.tsx` file hosting `import.meta.glob` breaks
 * Vite 8's dependency scan (see `component-sources.ts` and the guard test).
 */
export const storySources = import.meta.glob<string>(
  '../stories/*.stories.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)

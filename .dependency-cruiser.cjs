/**
 * Architecture rules, enforced.
 *
 * The layering this repo claims in AGENTS.md stops being a convention here:
 * `lib/` is the layer *under* `components/`, `@newui/tokens` is a leaf, packages
 * never reach into an app, and nothing imports from a build output.
 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'A cycle means the layering is wrong somewhere.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'lib-is-below-components',
      severity: 'error',
      comment:
        'lib/ (tv, field, zag, color-scheme) must not depend on components/. If it needs a component, the abstraction is in the wrong place. Its own tests are the exception — they exist to mount components.',
      from: { path: '^packages/ui/src/lib', pathNot: '\\.(test|spec)\\.tsx?$' },
      to: { path: '^packages/ui/src/components' },
    },
    {
      name: 'tokens-is-a-leaf',
      severity: 'error',
      comment:
        '@newui/tokens is framework-neutral design data; it imports nothing.',
      from: { path: '^packages/tokens' },
      to: { pathNot: '^packages/tokens', dependencyTypesNot: ['core'] },
    },
    {
      name: 'packages-do-not-reach-apps',
      severity: 'error',
      comment: 'A shipped package must never import from the playground.',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },
    {
      name: 'no-build-output-imports',
      severity: 'error',
      comment: 'Import the source, never a build artifact.',
      from: {},
      to: { path: '(^|/)dist/' },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'A file nobody imports is either dead or should be an entry.',
      from: {
        orphan: true,
        pathNot: [
          '\\.(test|spec|ssr\\.test|a11y\\.test|browser\\.test)\\.tsx?$',
          '\\.d\\.ts$',
          '(^|/)tsconfig',
          '(^|/)vite\\.config\\.ts$',
          '^packages/tailwind/src/plugins/', // loaded by CSS `@plugin`, not by an import
          '(^|/)\\.[^/]+\\.(c?js|mjs|json)$',
        ],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: {
      path: '(^|/)(dist|coverage|test-results|playwright-report|generated)/',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: { text: { highlightFocused: true } },
  },
}

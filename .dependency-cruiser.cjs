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
      name: 'the-ladder-only-points-down',
      severity: 'error',
      comment:
        'ADR-0012: components (ui) ← blocks ← layouts ← apps. A layout may compose components and blocks; a block or a component may never reach up to a layout, and nothing here may reach into an app.',
      from: { path: '^packages/(ui|blocks)/' },
      to: { path: '^packages/layouts/' },
    },
    {
      name: 'layouts-do-not-reach-past-ui-and-blocks',
      severity: 'error',
      comment:
        'A page template is arrangement, not data or rendering: it composes @newui/ui and @newui/blocks and stops there.',
      from: { path: '^packages/layouts/' },
      to: {
        path: '^packages/(ui|blocks)/',
        pathNot: '(packages/ui/src|packages/blocks/src)',
      },
    },
    {
      name: 'data-is-headless',
      severity: 'error',
      comment:
        'ADR-0012: @newui/data owns behaviour, not rendering. It imports solid-js and nothing from the visual packages, so a page can use it without paying for a component — and a component can never depend on a policy it might want to change.',
      from: {
        path: '^packages/data/',
        // The promoted surfaces render, so they compose `@newui/ui` — the one
        // carve-out the layer's name allows. Everything else stays headless.
        pathNot: '^packages/data/src/(table|virtual)/',
      },
      to: { path: '^packages/(ui|blocks|layouts|tailwind|icons)/' },
    },
    {
      name: 'nothing-below-imports-data',
      severity: 'error',
      comment:
        'The data layer sits beside the component ladder, not under it. A component that needs formatting takes it from the app or the standard library; it may not reach sideways into the logic layer.',
      from: { path: '^packages/(ui|blocks|layouts|tokens|tailwind|icons)/' },
      to: { path: '^packages/data/' },
    },
    {
      name: 'packages-do-not-reach-apps',
      severity: 'error',
      comment: 'A shipped package must never import from the playground.',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },
    {
      name: 'site-shell-stays-lean',
      severity: 'error',
      comment:
        'The site shell (routes.tsx, shell/*) is on every route, so it must reach a page only through `import()` — a static import ships that page (and everything it renders) on every route. The old playground mounted all six sections on `/` and paid 219 kB gzip for it.',
      from: { path: '^apps/playground/src/(shell/|routes)' },
      to: {
        path: '^apps/playground/src/(pages/|demos)',
        dependencyTypesNot: ['dynamic-import'],
      },
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
      path: '(^|/)(dist|coverage|test-results|playwright-report|storybook-static|generated)/',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: { text: { highlightFocused: true } },
  },
}

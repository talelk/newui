/**
 * Atomic package boundaries, enforced.
 *
 * The visual ladder only points up one level at a time:
 * atoms ← molecules ← organisms ← templates ← apps. Data is a separate,
 * headless logic branch. Charts/editor packages are optional organism add-ons.
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
      name: 'atoms-do-not-import-upward',
      severity: 'error',
      comment:
        'Atoms are the bottom visual layer; they cannot depend on molecules, organisms or templates.',
      from: { path: '^packages/atoms/' },
      to: { path: '^packages/(molecules|organisms|templates)/' },
    },
    {
      name: 'molecules-only-use-atoms',
      severity: 'error',
      comment:
        'Molecules compose atoms; organisms and templates are above them.',
      from: { path: '^packages/molecules/' },
      to: { path: '^packages/(organisms|templates)/' },
    },
    {
      name: 'organisms-do-not-import-templates',
      severity: 'error',
      comment:
        'Organisms are page regions; only templates arrange them into a page.',
      from: { path: '^packages/organisms/' },
      to: { path: '^packages/templates/' },
    },
    {
      name: 'templates-compose-atomic-packages',
      severity: 'error',
      comment:
        'Templates may compose atoms, molecules and organisms; they do not own domain engines or app policy.',
      from: { path: '^packages/templates/' },
      to: { path: '^packages/(charts|editor|code-editor|data|vite)/' },
    },
    {
      name: 'optional-widgets-point-down',
      severity: 'error',
      comment:
        'Charts and editors are optional organism-level packages. They may use atoms/molecules, never templates or app code.',
      from: { path: '^packages/(charts|editor|code-editor)/' },
      to: { path: '^packages/(organisms|templates)/' },
    },
    {
      name: 'data-is-headless',
      severity: 'error',
      comment:
        'The data layer owns query/form policy and pure helpers; rendered table/list surfaces live in organisms.',
      from: { path: '^packages/data/' },
      to: {
        path: '^packages/(atoms|molecules|organisms|templates|charts|editor|code-editor|tailwind|icons)/',
      },
    },
    {
      name: 'visual-packages-do-not-import-data',
      severity: 'error',
      comment:
        'The logic layer sits beside the visual ladder; apps compose both.',
      from: {
        path: '^packages/(atoms|molecules|organisms|templates|charts|editor|code-editor|tokens|tailwind|icons)/',
      },
      to: { path: '^packages/data/' },
    },
    {
      name: 'tokens-is-a-leaf',
      severity: 'error',
      comment:
        '@newui/tokens is framework-neutral design data; it imports nothing.',
      from: { path: '^packages/tokens/' },
      to: { pathNot: '^packages/tokens', dependencyTypesNot: ['core'] },
    },
    {
      name: 'packages-do-not-reach-apps',
      severity: 'error',
      comment: 'A shipped package must never import from an application.',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },
    {
      name: 'the-site-does-not-import-the-starter',
      severity: 'error',
      comment: 'Applications share packages, never source files.',
      from: { path: '^apps/playground/' },
      to: { path: '^apps/starter/' },
    },
    {
      name: 'the-starter-does-not-import-the-site',
      severity: 'error',
      comment:
        'The starter must stay copyable and cannot depend on the docs site.',
      from: { path: '^apps/starter/' },
      to: { path: '^apps/playground/' },
    },
    {
      name: 'site-shell-stays-lean',
      severity: 'error',
      comment:
        'The site shell reaches a page only through import(); otherwise its dependencies ship on every route.',
      from: { path: '^apps/playground/src/(shell/|routes)' },
      to: {
        path: '^apps/playground/src/(pages/|demos)',
        dependencyTypesNot: ['dynamic-import'],
      },
    },
    {
      name: 'no-build-output-imports',
      severity: 'error',
      comment: 'Import source, never a build artifact.',
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
          '^packages/tailwind/src/plugins/',
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

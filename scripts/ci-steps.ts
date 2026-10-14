/**
 * The CI pipeline, declared once.
 *
 * `.github/workflows/tests.yml` and `pnpm ci` both run exactly these commands,
 * and `ci.test.ts` fails if the workflow stops matching this list. That is what
 * makes "CI runs locally" true rather than aspirational.
 */
export interface CiStep {
  /** Step label, mirrored by the workflow's `name:`. */
  name: string
  /** The command, mirrored by the workflow's `run:`. */
  command: string
  /** Which job the step belongs to. */
  group: 'checks' | 'e2e'
}

export const CI_STEPS: CiStep[] = [
  { name: 'Lint & format (Biome)', command: 'pnpm lint', group: 'checks' },
  {
    name: 'Lint Solid (ESLint)',
    command: 'pnpm lint:solid',
    group: 'checks',
  },
  {
    name: 'Architecture (dependency-cruiser)',
    command: 'pnpm arch',
    group: 'checks',
  },
  {
    name: 'Package manifest (publint)',
    command: 'pnpm packages:check',
    group: 'checks',
  },
  {
    name: 'Dead code & unused deps (Knip)',
    command: 'pnpm knip',
    group: 'checks',
  },
  { name: 'Type-check', command: 'pnpm typecheck', group: 'checks' },
  { name: 'API table is current', command: 'pnpm api:check', group: 'checks' },
  {
    name: 'Site data is current',
    command: 'pnpm site:check',
    group: 'checks',
  },
  { name: 'Docs site builds', command: 'pnpm docs:build', group: 'checks' },
  { name: 'Tests', command: 'pnpm test', group: 'checks' },
  { name: 'SSR smoke tests', command: 'pnpm test:ssr', group: 'checks' },
  {
    name: 'Bundle budget & tree-shaking',
    command: 'pnpm size',
    group: 'checks',
  },
  { name: 'Build packages', command: 'pnpm build', group: 'checks' },
  {
    name: 'Build playground',
    command: 'pnpm build:playground',
    group: 'checks',
  },
  {
    name: 'CSS emission (every referenced utility is emitted)',
    command: 'pnpm css:check',
    group: 'checks',
  },
  {
    name: 'Route JS budget (every route, gzip)',
    command: 'pnpm budget',
    group: 'checks',
  },
  {
    name: 'Lighthouse budgets',
    command: 'pnpm lighthouse',
    group: 'checks',
  },
  {
    name: 'Component browser tests (real CSS)',
    command: 'pnpm test:browser',
    group: 'e2e',
  },
  {
    name: 'Browser harness (a11y · interaction · responsive · perf)',
    command: 'pnpm test:e2e',
    group: 'e2e',
  },
]

export const CHECK_STEPS = CI_STEPS.filter((step) => step.group === 'checks')
export const E2E_STEPS = CI_STEPS.filter((step) => step.group === 'e2e')

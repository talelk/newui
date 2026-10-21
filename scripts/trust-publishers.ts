import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Configure npm trusted publishing for every published package.
 *
 * Run this once, after the first versions are on the registry and after
 * `npm login` in a shell with 2FA enabled. The first `npm trust` call opens
 * npm's 2FA flow; npm lets the remaining calls through for five minutes.
 *
 * `npm trust` needs npm >= 11.15.0, so the script runs a pinned npm through
 * npx instead of depending on the npm bundled with the local Node.
 *
 *   pnpm trust:publishers
 *   pnpm trust:publishers --no-enable   # do not flip NPM_PUBLISH
 */
const root = process.cwd()
const packages = [
  'atoms',
  'molecules',
  'organisms',
  'templates',
  'tokens',
  'tailwind',
  'icons',
  'data',
  'charts',
  'editor',
  'code-editor',
  'vite',
]
  .map((name) => `packages/${name}/package.json`)
  .map(
    (file) =>
      JSON.parse(readFileSync(path.join(root, file), 'utf8')) as {
        name: string
        private?: boolean
      },
  )
  .filter((pkg) => !pkg.private)
  .map((pkg) => pkg.name)

const enable = !process.argv.includes('--no-enable')
const npm = ['--yes', 'npm@11.15.0', 'trust', 'github']
const configured: string[] = []

const tokenEnv = ['NPM_TOKEN', 'NODE_AUTH_TOKEN'].filter(
  (key) => process.env[key],
)
if (tokenEnv.length > 0) {
  process.stderr.write(
    `[trust] ${tokenEnv.join(' and ')} are set. npm trust needs the interactive login session, so unset them before running this script.\n`,
  )
}

for (const [index, name] of packages.entries()) {
  process.stdout.write(`\n[trust] ${name} (${index + 1}/${packages.length})\n`)
  const result = spawnSync(
    'npx',
    [
      ...npm,
      name,
      '--repo',
      'talelk/newui',
      '--file',
      'changesets.yml',
      '--allow-publish',
      '--yes',
    ],
    { stdio: 'inherit' },
  )
  if (result.status !== 0) {
    process.stderr.write(
      `\n[trust] ${name} was not configured. \`npm trust\` requires an interactive \`npm login\` session with 2FA; a long-lived NPM_TOKEN/NODE_AUTH_TOKEN cannot perform this operation. Run \`npm logout\`, \`npm login --auth-type=web\`, then retry. If a Trusted Publisher already exists, run \`npm trust list ${name}\`, revoke it, and retry.\n`,
    )
    process.exit(result.status ?? 1)
  }
  configured.push(name)
  await new Promise((resolve) => setTimeout(resolve, 2_000))
}

process.stdout.write(`\n[trust] configured ${configured.length} packages.\n`)

if (enable) {
  const result = spawnSync(
    'gh',
    [
      'variable',
      'set',
      'NPM_PUBLISH',
      '--body',
      'true',
      '--repo',
      'talelk/newui',
    ],
    { stdio: 'inherit' },
  )
  if (result.status !== 0) {
    process.stderr.write(
      '\n[trust] Trusted Publishers are configured, but the GitHub variable could not be set. Run: gh variable set NPM_PUBLISH --body true --repo talelk/newui\n',
    )
    process.exit(result.status ?? 1)
  }
  process.stdout.write(
    '[trust] NPM_PUBLISH is enabled; the next Version Packages merge publishes through OIDC.\n',
  )
}

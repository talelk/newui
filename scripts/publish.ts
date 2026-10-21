import { spawnSync } from 'node:child_process'

/**
 * Publish through Changesets only when the repository is ready.
 *
 * npm trusted publishing has one unavoidable bootstrap step: a package has to
 * exist before its Trusted Publisher can be configured, and a package cannot be
 * published through a Trusted Publisher until it exists. Until the first
 * publish and the per-package Trusted Publisher setup are done, the Changesets
 * workflow should still open and update the Version Packages PR without
 * painting main red on every push.
 *
 * Set the repository variable `NPM_PUBLISH=true` once the trusted publishers
 * are in place. From then on this script runs `changeset publish`, which uses
 * the workflow's OIDC token — no long-lived npm token.
 */
if (process.env['NPM_PUBLISH'] !== 'true') {
  process.stdout.write(
    '[release] npm publishing is gated. Set the repository variable NPM_PUBLISH=true after configuring the Trusted Publishers for @newui/*.\n',
  )
  process.exit(0)
}

const result = spawnSync('pnpm', ['exec', 'changeset', 'publish'], {
  stdio: 'inherit',
})
process.exit(result.status ?? 1)

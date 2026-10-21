import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Keep `metadata.library_version` equal to the owning package version.
 *
 * Run after `changeset version`, before publishing. `intent validate
 * --set-version` also re-runs the structural and example checks, so a release
 * cannot ship a skill whose examples no longer compile.
 */
const root = process.cwd()
const packages = join(root, 'packages')

for (const entry of readdirSync(packages, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const dir = join(packages, entry.name)
  const skills = join(dir, 'skills')
  if (!existsSync(skills)) continue

  const manifest = JSON.parse(
    readFileSync(join(dir, 'package.json'), 'utf8'),
  ) as {
    version?: string
  }
  if (typeof manifest.version !== 'string') continue

  execFileSync(
    'pnpm',
    [
      'exec',
      'intent',
      'validate',
      `packages/${entry.name}/skills`,
      '--set-version',
      manifest.version,
    ],
    { cwd: root, stdio: 'inherit' },
  )
}
